import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import chatService from "../../services/chat.service";

export default function MessageBoxScreen() {
  // Nhận params từ router
  const { userId, token, myId, name } = useLocalSearchParams();

  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Lấy lịch sử chat và kết nối socket
  useEffect(() => {
    if (!userId || !token || !myId) {
      return;
    }
    setLoading(true);
    setError("");
    chatService
      .getMessagesWith(userId as string, token as string)
      .then((res) => {
        if (res.success) {
          setMessages(res.data.reverse());
        } else {
          setError(res.message || "Lỗi không xác định");
          setMessages([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi kết nối server");
        setMessages([]);
        setLoading(false);
        console.log("[getMessagesWith] catch error:", err);
      });
    // Kết nối socket
    chatService.connect(myId as string, token as string);
    // Lắng nghe tin nhắn mới
    chatService.onNewMessage((msg) => {
      setMessages((prev) => {
        // Nếu có tin nhắn tạm thời (id undefined, content trùng, sender trùng), replace bằng msg từ server
        const idx = prev.findIndex(
          (m) =>
            !m._id &&
            m.content === msg.content &&
            m.sender === msg.sender &&
            m.receiver === msg.receiver &&
            (!m.mediaUrl || m.mediaUrl === msg.mediaUrl)
        );
        if (idx !== -1) {
          const newArr = [...prev];
          newArr[idx] = { ...msg };
          return newArr;
        }
        return [...prev, msg];
      });
      flatListRef.current?.scrollToEnd({ animated: true });
      // Nếu là tin nhắn gửi cho mình và chưa read thì gửi markAsRead giống web
      if (msg.receiver === myId && msg.status !== "read") {
        chatService.markAsRead(String(myId), String(userId));
      }
    });
    return () => {
      chatService.disconnect();
    };
  }, [userId, token, myId]);

  useEffect(() => {
    if (error) {
      Alert.alert("Lỗi", error);
    }
  }, [error]);

  useEffect(() => {
    const handleRead = (data: any) => {
      setMessages((prev) => {
        let updated = prev.map((msg) =>
          data.messageId && msg._id === data.messageId
            ? { ...msg, status: "read" }
            : data.from && msg.sender === myId && msg.receiver === data.from
              ? { ...msg, status: "read" }
              : msg
        );
        // Nếu không có messageId nào khớp, thử cập nhật status cho tin nhắn cuối cùng do mình gửi
        if (data.messageId && !prev.some(msg => msg._id === data.messageId)) {
          const myMsgs = updated.filter(m => m.sender === myId);
          if (myMsgs.length > 0) {
            const lastMsgId = myMsgs[myMsgs.length - 1]._id;
            updated = updated.map(msg =>
              msg._id === lastMsgId ? { ...msg, status: "read" } : msg
            );
            console.log('[CLIENT][PATCH] Không tìm thấy messageId, đã cập nhật status cho tin nhắn cuối cùng:', lastMsgId);
          }
        }
        return updated;
      });
    };
    chatService.onMessageRead(handleRead);
    return () => {
      chatService.offMessageRead(handleRead);
    };
  }, [myId]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImage(asset);
    }
  };

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    // Nếu có ảnh, upload trước
    if (selectedImage) {
      const localUri = selectedImage.uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename ?? "");
      // Xác định đúng mime type
      let type = "image";
      if (match) {
        const ext = match[1].toLowerCase();
        if (ext === "jpg" || ext === "jpeg") type = "image/jpeg";
        else if (ext === "png") type = "image/png";
        else if (ext === "heic") type = "image/heic";
        else if (ext === "webp") type = "image/webp";
        else type = `image/${ext}`;
      }
      const fileObj = {
        uri: localUri,
        name: filename,
        type,
      };
      try {
        const uploadRes = await chatService.uploadMedia(
          fileObj,
          token as string
        );
        if (uploadRes.success && uploadRes.data.url) {
          await chatService.sendMessageAPI(
            {
              receiver: userId,
              content: "",
              mediaUrl: uploadRes.data.url,
              type: "image",
            },
            token as string
          );
          chatService.sendMessageSocket({
            sender: myId,
            receiver: userId,
            content: "",
            mediaUrl: uploadRes.data.url,
            type: "image",
          });
          setSelectedImage(null);
          } else {
          Alert.alert("Lỗi gửi ảnh", uploadRes.message || "Không gửi được ảnh");
        }
      } catch (err) {
        console.log("[IMAGE UPLOAD ERROR]", err);
        Alert.alert("Lỗi gửi ảnh", "Không gửi được ảnh");
      }
      setSending(false);
      return;
    }
    // Nếu chỉ gửi text
    if (!input.trim()) {
      setSending(false);
      return;
    }
    const data = {
      receiver: userId,
      content: input,
      type: "text",
    };
    const res = await chatService.sendMessageAPI(data, token as string);
    if (!res.success) {
      Alert.alert("Lỗi gửi tin nhắn", res.message || "Gửi tin nhắn thất bại");
      setSending(false);
      return;
    }
    chatService.sendMessageSocket({
      sender: myId,
      receiver: userId,
      content: input,
      type: "text",
    });
    setInput("");
    setSending(false);
  };

  // Xác định id tin nhắn mới nhất của mình
  const myLastMessageId = (() => {
    const myMsgs = messages.filter((m) => m.sender === myId);
    const lastId = myMsgs.length > 0 ? myMsgs[myMsgs.length - 1]._id : null;
    return lastId;
  })();

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.sender === myId;
    const isMyLastMsg = isMe && item._id === myLastMessageId;
    // Khôi phục lại hai dòng này để tránh lỗi linter
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMsg || prevMsg.sender !== item.sender;
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        {isMe && (
          <>
            <LinearGradient
              colors={["#29375C", "#6D8FEF"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.bubbleMe]}
            >
              {item.mediaUrl && item.type === "image" ? (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 12,
                    marginBottom: 4,
                  }}
                />
              ) : (
                <Text style={[styles.messageText, { color: '#fff' }]}>{item.content}</Text>
              )}
              <Text style={[styles.time, { color: '#fff', alignSelf: 'flex-end' }]}>{item.time || ""}</Text>
              {isMyLastMsg && (
                <Text
                  style={{
                    fontSize: 11,
                    color: "#fff",
                    opacity: 0.7,
                    marginTop: 2,
                    alignSelf: "flex-end",
                  }}
                >
                  {item.status === "read" ? "Đã xem" : "Chưa xem"}
                </Text>
              )}
            </LinearGradient>
            {showAvatar ? (
              <Image
                source={
                  item.avatar
                    ? { uri: item.avatar }
                    : require("../../assets/images/avt_default.png")
                }
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar} />
            )}
          </>
        )}
        {/* Tin nhắn của người nhận giữ nguyên */}
        {!isMe && (
          <>
            {showAvatar ? (
              <Image
                source={
                  item.avatar
                    ? { uri: item.avatar }
                    : require("../../assets/images/avt_default.png")
                }
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar} />
            )}
            <View style={[styles.bubble, styles.bubbleOther]}>
              {item.mediaUrl && item.type === "image" ? (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 12,
                    marginBottom: 4,
                  }}
                />
              ) : (
                <Text style={[styles.messageText, styles.textOther]}>{item.content}</Text>
              )}
              <Text style={styles.time}>{item.time || ""}</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 36 : 0} // offset này có thể chỉnh cho phù hợp header
    >
      <View style={{ flex: 1, backgroundColor: "#29375C" }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{name || "Đoạn chat"}</Text>
          </View>
        </View>
        {/* Danh sách tin nhắn */}
        <View style={[styles.listWrapper, { marginTop: 10 }]}>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
              {error}
            </Text>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) =>
                item._id?.toString() ||
                item.id?.toString() ||
                Math.random().toString()
              }
              renderItem={(props) => renderMessage({ ...props, index: props.index })}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}
        </View>
        {/* Input gửi tin nhắn */}
        <View style={{ backgroundColor: "#fff", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <View style={styles.inputRow}>
            <Ionicons
              name="happy-outline"
              size={24}
              color="#29375C"
              style={{ marginHorizontal: 8 }}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handlePickImage}
              disabled={sending}
            >
              <Ionicons name="image" size={24} color="#29375C" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn tại đây..."
              placeholderTextColor="#A0A0A0"
              value={input}
              onChangeText={setInput}
              editable={!sending}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              disabled={sending}
            >
              <Ionicons
                name="send"
                size={24}
                color={sending ? "#A0A0A0" : "#29375C"}
              />
            </TouchableOpacity>
          </View>
        </View>
        {selectedImage && (
          <View
            style={{
              marginLeft: 16,
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: selectedImage.uri }}
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="close-circle" size={28} color="red" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#29375C",
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "Baloo2-Bold",
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  listWrapper: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    flex: 1,
    overflow: "hidden",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 6,
  },
  bubble: {
    maxWidth: "70%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 2,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#29375C",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
    fontFamily: "Baloo2-Bold",
  },
  textMe: {
    color: "#fff",
  },
  textOther: {
    color: "#fff",
  },
  time: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.7,
    alignSelf: "flex-end",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    margin: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#29375C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.80,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#29375C",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },
  sendBtn: {
    padding: 6,
    borderRadius: 20,
  },
});
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
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
  const { userId, name } = useLocalSearchParams();

  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("userId").then(setMyId);
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  // Lấy lịch sử chat và kết nối socket
  useEffect(() => {
    if (!userId || !token || !myId) return;

    setLoading(true);
    setError("");
    chatService
      .getMessagesWith(userId as string, token as string)
      .then((res) => {
        setLoading(false); // Đảm bảo luôn tắt loading
        if (res.success) {
          setMessages(Array.isArray(res.data) ? res.data.reverse() : []);
        } else {
          setError(res.message || "Lỗi không xác định");
          setMessages([]);
        }
      })
      .catch((err) => {
        setError("Lỗi kết nối server");
        setMessages([]);
        setLoading(false);
        console.log("[getMessagesWith] catch error:", err);
      });

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id || (m.content === msg.content && m.sender === msg.sender && m.createdAt === msg.createdAt))) return prev;
        return [...prev, msg];
      });
      flatListRef.current?.scrollToEnd({ animated: true });
    };
    chatService.onNewMessage(handleNewMessage);
    return () => {
      chatService.offNewMessage(handleNewMessage);
    };
  }, [userId, token, myId]);

  // Xoá useEffect lắng nghe message_read
  // Xoá useEffect gửi mark_read khi vào phòng chat
  // Xoá mọi đoạn code cập nhật status: "read" hoặc "Chưa xem"/"Đã xem" trong renderMessage

  useEffect(() => {
    if (error) {
      Alert.alert("Lỗi", error);
    }
  }, [error]);

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
    // KHÔNG setMessages ở đây nữa! Chỉ rely vào socket để render tin nhắn
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
    return myMsgs.length > 0 ? myMsgs[myMsgs.length - 1]._id : null;
  })();

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.sender === myId;
    const prevMsg = messages[index - 1];
    const showAvatar =
      (index === 0 || prevMsg?.sender !== item.sender);

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        {/* Avatar bên trái cho người nhận */}
        {!isMe && (showAvatar ? (
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
        ))}
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
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
            <Text
              style={[
                styles.messageText,
                isMe ? styles.textMe : styles.textOther,
              ]}
            >
              {item.content}
            </Text>
          )}
          <Text style={styles.time}>{item.time || ""}</Text>
        </View>
        {/* Avatar bên phải cho người gửi */}
        {isMe && (showAvatar ? (
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
        ))}
      </View>
    );
  };



  if (!userId || !token || !myId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#29375C" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 36 : 0} // offset này có thể chỉnh cho phù hợp header
    >
      <View style={{ flex: 1 }}>
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
        <View style={styles.listWrapper}>
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
              keyExtractor={(item, idx) =>
                item._id?.toString() || item.id?.toString() || idx.toString()
              }
              renderItem={({ item, index }) => renderMessage({ item, index })}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: "#A0A0A0", marginTop: 40 }}>
                  Hãy bắt đầu cuộc trò chuyện!
                </Text>
              }
            />
          )}
        </View>
        {/* Input gửi tin nhắn */}
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
    backgroundColor: "#3B4B7B",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#6D8FEF",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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

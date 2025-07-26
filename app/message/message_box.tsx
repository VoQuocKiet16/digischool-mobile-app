import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import chatService from "../../services/chat.service";

// Hàm format giờ:phút
function formatHourMinute(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

// Hàm format label ngày
function formatDateLabel(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return "Hôm nay";
  if (isYesterday) return "Hôm qua";
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

export default function MessageBoxScreen() {
  // Nhận params từ router
  const { userId, token: paramToken, myId: paramMyId, name } = useLocalSearchParams();

  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [token, setToken] = useState<string | null>(paramToken as string || null);
  const [myId, setMyId] = useState<string | null>(paramMyId as string || null);
  const [isReady, setIsReady] = useState(false);
  const [myName, setMyName] = useState<string>('bạn');

  // Lấy token và myId từ AsyncStorage nếu chưa có
  useEffect(() => {
    let done = false;
    const getData = async () => {
      if (!token) {
        const t = await AsyncStorage.getItem("token");
        if (t) setToken(t);
      }
      if (!myId) {
        const id = await AsyncStorage.getItem("userId");
        if (id) setMyId(id);
      }
      setIsReady(true);
    };
    getData();
    return () => { done = true; };
  }, []);

  // Lấy tên người gửi từ AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('name').then(name => {
      if (name) setMyName(name);
    });
  }, []);

  // Reset imageLoading khi selectedImage thay đổi
  useEffect(() => {
    if (selectedImage) {
      setImageLoading(true);
      // Fallback: Sau 3 giây nếu vẫn chưa load xong thì tắt loading
      const timeout = setTimeout(() => setImageLoading(false), 3000);
      return () => clearTimeout(timeout);
    }
    else setImageLoading(false);
  }, [selectedImage]);

  // Lấy lịch sử chat và kết nối socket
  useEffect(() => {
    if (!isReady) return; // Chờ lấy xong token/myId
    if (
      typeof userId !== 'string' || !userId.trim() ||
      typeof token !== 'string' || !token.trim() ||
      typeof myId !== 'string' || !myId.trim()
    ) {
      setLoading(false);
      setError("Thiếu thông tin người dùng hoặc token");
      return;
    }
    setLoading(true);
    setError("");
    chatService
      .getMessagesWith(userId as string, token as string)
      .then((res) => {
        if (res.success) {
          // Lọc bỏ tin nhắn rỗng (không có content và mediaUrl)
          const filtered = (res.data || []).filter((msg: any) => !!msg.content || !!msg.mediaUrl);
          // Sắp xếp theo thời gian tăng dần (cũ nhất lên đầu)
          const sorted = filtered.sort((a: any, b: any) => {
            const timeA = new Date(a.createdAt || a.time || 0).getTime();
            const timeB = new Date(b.createdAt || b.time || 0).getTime();
            return timeA - timeB;
          });
          setMessages(sorted);
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
  }, [isReady, userId, token, myId]);

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
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageLoading(true);
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
      content: input.replace(/^[\s\n]+|[\s\n]+$/g, ""),
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

  // Hàm kiểm tra tin nhắn này có phải là tin cuối cùng của mình không
  function isLastMyMsg(item: any, messages: any[], myId: any) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === myId) {
        return messages[i]._id === item._id;
      }
    }
    return false;
  }

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.sender === myId;
    const isMyLastMsg = isMe && item._id === myLastMessageId;
    // Khôi phục lại hai dòng này để tránh lỗi linter
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMsg || prevMsg.sender !== item.sender;
    const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
    // Chỉ hiển thị thời gian nếu là cuối cụm (tin nhắn tiếp theo khác sender hoặc là cuối danh sách)
    const showTime = !nextMsg || nextMsg.sender !== item.sender;
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        {isMe && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: 8, width: '100%' }}>
            <View style={{ flexShrink: 1, flexGrow: 1, maxWidth: '90%', alignItems: 'flex-end' }}>
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
                  <Text style={[styles.messageText, { color: '#fff' }]}> {(item.content || "").replace(/^[\s\n]+|[\s\n]+$/g, "")}</Text>
                )}
                {showTime && (
                  <Text style={styles.timeBelow}>{formatHourMinute(item.createdAt)}</Text>
                )}
                <Text style={[styles.time, { color: '#fff', alignSelf: 'flex-end' }]}>{item.time || ""}</Text>
              </LinearGradient>
              {/* Trạng thái đã xem/đã nhận ngoài bubble, nằm dưới bubble */}
              {showTime && item.status === "read" && isLastMyMsg(item, messages, myId) && (
                <View style={styles.statusBelow}>
                  <Text style={styles.statusText}>Đã xem</Text>
                </View>
              )}
            </View>
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
          </View>
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
                <Text style={[styles.messageText, styles.textOther]}> {(item.content || "").replace(/^[\s\n]+|[\s\n]+$/g, "")}</Text>
              )}
              {showTime && (
                <Text style={styles.timeBelow}>{formatHourMinute(item.createdAt)}</Text>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, backgroundColor: "#29375C" }}>
          {/* Danh sách tin nhắn */}
          <View style={[styles.listWrapper, { marginTop: 10, flex: 1 }]}>
            {loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} />
            ) : error ? (
              <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
                {error}
              </Text>
            ) : messages.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 24 }}>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  paddingVertical: 28,
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                  width: 320,
                  maxWidth: '100%',
                }}>
                  <Text style={{ color: '#29375C', fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', fontFamily: 'Baloo2-Bold' }}>
                    Xin chào bạn !
                  </Text>
                  <Text style={{ color: '#29375C', fontSize: 15, marginBottom: 18, textAlign: 'center', lineHeight: 22 }}>
                    Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện với {name || 'người nhận'} nhé.
                  </Text>
                  <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
                    Khi bạn gửi tin nhắn, {name || 'người nhận'} sẽ nhìn thấy tin nhắn của bạn.
                  </Text>
                </View>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) =>
                  item._id?.toString() ||
                  item.id?.toString() ||
                  Math.random().toString()
                }
                renderItem={({ item, index }) => {
                  // Xác định có cần chèn label ngày không
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const currDate = item.createdAt ? new Date(item.createdAt).toDateString() : '';
                  const prevDate = prevMsg && prevMsg.createdAt ? new Date(prevMsg.createdAt).toDateString() : '';
                  const showDateLabel = !prevMsg || currDate !== prevDate;
                  return (
                    <>
                      {showDateLabel && formatDateLabel(item.createdAt) && (
                        <View style={{ alignItems: 'center', marginVertical: 8 }}>
                          <Text style={{ backgroundColor: '#BFC6D1', color: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, fontSize: 14 }}>
                            {formatDateLabel(item.createdAt)}
                          </Text>
                        </View>
                      )}
                      {renderMessage({ item, index })}
                    </>
                  );
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
          {/* Preview ảnh đã chọn (nếu có) và input gửi tin nhắn */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              {selectedImage && (
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    padding: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 2,
                    alignSelf: "stretch",
                  }}
                >
                  {imageLoading ? (
                    <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="large" color="#29375C" />
                      {/* Render ảnh ẩn để ép sự kiện load */}
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }}
                        onLoad={() => setImageLoading(false)}
                        onLoadEnd={() => setImageLoading(false)}
                      />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                      onLoad={() => setImageLoading(false)}
                      onLoadEnd={() => setImageLoading(false)}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(null);
                      setImageLoading(false);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="close-circle" size={28} color="red" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={{ backgroundColor: "#fff", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: 16 }}>
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
                    style={[styles.input, { maxHeight: 100, textAlignVertical: 'top' }]}
                    placeholder="Nhập tin nhắn tại đây..."
                    placeholderTextColor="#A0A0A0"
                    value={input}
                    onChangeText={setInput}
                    editable={!sending}
                    multiline={true}
                    blurOnSubmit={false}
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
            </View>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  timeBelow: {
    fontSize: 11,
    color: '#A0A0A0',
    marginTop: 2,
    alignSelf: 'flex-end',
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
  statusBelow: {
    backgroundColor: "#BFC6D1",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-end",
    marginTop: 2,
    marginBottom: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
  },
});
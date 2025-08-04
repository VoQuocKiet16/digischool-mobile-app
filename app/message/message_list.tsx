import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import chatService from "../../services/chat.service";
import { fonts } from "../../utils/responsive";

// Giả sử token và myId lấy từ context hoặc props, ở đây hardcode để demo
type Props = {
  token?: string;
};

export default function MessageListScreen({ token = "demo-token" }: Props) {
  const [search, setSearch] = useState("");
  const [chatData, setChatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myId, setMyId] = useState<string | undefined>(undefined);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userId").then((id) => setMyId(id ?? undefined));
  }, []);

  // Tách fetchConversations ra ngoài để có thể gọi lại
  const fetchConversations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await chatService.getConversations(token);
      if (res.success) {
        setChatData(res.data);
      } else {
        setError(res.message || "Lỗi không xác định");
        setChatData([]);
      }
    } catch (e) {
      setError("Lỗi kết nối server");
      setChatData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token, refreshFlag]);

  useEffect(() => {
    const handleNewMessage = (msg: any) => {
      setChatData((prevData) => {
        const otherUserId = msg.sender === myId ? msg.receiver : msg.sender;
        const idx = prevData.findIndex(
          (item) => item.userId === otherUserId || item.id === otherUserId
        );
        if (idx === -1) {
          fetchConversations();
          return prevData;
        }
        // Chỉ tăng unreadCount nếu mình là người nhận
        let newUnreadCount = prevData[idx].unreadCount || 0;
        if (msg.receiver === myId) {
          newUnreadCount = newUnreadCount + 1;
        }
        const updatedConversation = {
          ...prevData[idx],
          lastMessage: msg.content || msg.text || "[Tin nhắn mới]",
          lastMessageTime: msg.time || new Date().toISOString(),
          unreadCount: newUnreadCount,
        };
        const newData = [
          updatedConversation,
          ...prevData.slice(0, idx),
          ...prevData.slice(idx + 1),
        ];
        return newData;
      });
    };
    chatService.onNewMessage(handleNewMessage);
    return () => {
      chatService.offNewMessage(handleNewMessage);
    };
  }, [myId]);

  useEffect(() => {
    if (error) {
      Alert.alert("Lỗi", error);
    }
  }, [error]);

  if (!myId) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color="#215562"
            style={{ marginLeft: 10, marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người dùng...."
            placeholderTextColor="#A0A0A0"
            value={search}
            onChangeText={setSearch}
          />
          <MaterialIcons
            name="sort-by-alpha"
            size={22}
            color="#215562"
            style={{ marginHorizontal: 6 }}
          />
        </View>
        <TouchableOpacity
          style={styles.addChatBtn}
          onPress={() => router.push("/message/add_contact")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color="#215562"
          />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
          {error}
        </Text>
      ) : chatData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="chatbubbles-outline" size={70} color="#A0A0A0" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có tin nhắn nào</Text>
          <Text style={styles.emptySubtitle}>
            Bắt đầu trò chuyện với bạn bè và đồng nghiệp
          </Text>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={() => router.push("/message/add_contact")}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={20} color="#29375C" style={{ marginRight: 8 }} />
            <Text style={styles.startChatButtonText}>Bắt đầu tìm kiếm người dùng</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chatData}
          keyExtractor={(item) =>
            item.userId?.toString() ||
            item.id?.toString() ||
            Math.random().toString()
          }
          renderItem={({ item }) => {
            // Xác định ai là người gửi tin nhắn cuối cùng
            let isSentByMe = false;
            let lastMsg = item.lastMessage;
            if (item.lastMessageSender && myId && item.lastMessageSender === myId) {
              isSentByMe = true;
            }
            // Nếu không có trường lastMessageSender, fallback kiểm tra lastMessageFromId
            if (!item.lastMessageSender && item.lastMessageFromId && myId && item.lastMessageFromId === myId) {
              isSentByMe = true;
            }
            // Nếu là mình gửi thì thêm 'Bạn: '
            if (isSentByMe && lastMsg) {
              lastMsg = `Bạn: ${lastMsg}`;
            }

            // Format thời gian
            const formatTime = (dateString: string): string => {
              const now = new Date();
              const date = new Date(dateString);
              const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
              if (diff < 60) return "Vừa xong";
              if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
              if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
              if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
              return date.toLocaleDateString("vi-VN");
            };

            return (
              <TouchableOpacity
                onPress={async () => {
                  if (item.unreadCount > 0) {
                    setChatData((prevData) => {
                      const idx = prevData.findIndex(
                        (c) => c.userId === item.userId || c.id === item.id
                      );
                      if (idx === -1) return prevData;
                      const updated = { ...prevData[idx], unreadCount: 0 };
                      const newData = [
                        updated,
                        ...prevData.slice(0, idx),
                        ...prevData.slice(idx + 1),
                      ];
                      return newData;
                    });
                  }
                  router.push({
                    pathname: "/message/message_box",
                    params: {
                      userId: item.userId || item.id,
                      token,
                      myId,
                      name: item.name,
                    },
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.chatItemCustom}>
                  <Image
                    source={
                      item.avatar
                        ? { uri: item.avatar }
                        : require("../../assets/images/avt_default.png")
                    }
                    style={styles.avatarCustom}
                  />
                  <View style={styles.chatContentCustom}>
                    <Text style={styles.nameCustom}>{item.name}</Text>
                    <Text
                      style={[
                        styles.lastMessageCustom,
                        item.unreadCount > 0 && { fontFamily: fonts.semiBold, color: "#29375C" }
                      ]}
                      numberOfLines={1}
                    >
                      {lastMsg
                        ? lastMsg
                        : item.lastMessageType === "image"
                          ? "Hình ảnh"
                          : "Chưa có tin nhắn"}
                    </Text>
                  </View>
                  <View style={styles.rightInfo}>
                    <Text style={styles.time}>
                      {item.lastMessageTime ? formatTime(item.lastMessageTime) : ""}
                    </Text>
                    {/* Hiển thị badge số chưa đọc nếu có */}
                    {item.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#29375C",
    height: 55,
    marginRight: 10,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#29375C",
    backgroundColor: "transparent",
    paddingVertical: 0,
    fontFamily: fonts.medium,
  },
  addChatBtn: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#29375C",
    marginTop: 20,
  },
  rightInfo: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 55,
  },
  time: {
    fontSize: 13,
    color: "#A0A0A0",
    marginBottom: 6,
    fontFamily: fonts.regular,
  },
  unreadBadge: {
    backgroundColor: "#FFA726",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  chatItemCustom: {
    flexDirection: "row",
    backgroundColor: "#F7F7F7",
    marginHorizontal: 0,
    marginBottom: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  avatarCustom: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
  },
  chatContentCustom: {
    flex: 1,
    justifyContent: "center",
  },
  nameCustom: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: "#29375C",
    marginBottom: 2,
  },
  lastMessageCustom: {
    fontSize: 13,
    color: "#A0A0A0",
    fontFamily: fonts.medium,
  },
  emptyContainer: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: "#29375C",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  startChatButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  startChatButtonText: {
    color: "#29375C",
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});

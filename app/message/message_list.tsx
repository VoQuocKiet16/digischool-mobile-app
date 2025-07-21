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
        const updatedConversation = {
          ...prevData[idx],
          lastMessage: msg.content || msg.text || "[Tin nhắn mới]",
          time: msg.time || new Date().toISOString(),
          unread: (prevData[idx].unread || 0) + 1,
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
      {/* Thanh tìm kiếm */}
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
            placeholder="Tìm kiếm người dùng"
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
      {/* Danh sách chat */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={chatData}
          keyExtractor={(item) =>
            item.userId?.toString() ||
            item.id?.toString() ||
            Math.random().toString()
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={async () => {
                if (item.unread > 0) {
                  // Gửi mark_read lên server khi user click vào conversation
                  setChatData((prevData) => {
                    const idx = prevData.findIndex(
                      (c) => c.userId === item.userId || c.id === item.id
                    );
                    if (idx === -1) return prevData;
                    const updated = { ...prevData[idx], unread: 0 };
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
              <View style={styles.chatItem}>
                <Image
                  source={
                    item.avatar
                      ? { uri: item.avatar }
                      : require("../../assets/images/avt_default.png")
                  }
                  style={styles.avatar}
                />
                <View style={styles.chatContent}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text
                    style={[
                      styles.lastMessage,
                      item.unread > 0 && { fontWeight: "bold", color: "#29375C" }
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage || "Chưa có tin nhắn"}
                  </Text>
                </View>
                <View style={styles.rightInfo}>
                  {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    borderWidth: 1.5,
    borderColor: "#E6EEF2",
    height: 44,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#29375C",
    backgroundColor: "transparent",
    paddingVertical: 0,
  },
  addChatBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E6EEF2",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#29375C",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: "#A0A0A0",
    marginBottom: 0,
  },
  rightInfo: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 40,
  },
  time: {
    fontSize: 13,
    color: "#A0A0A0",
    marginBottom: 6,
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
    fontWeight: "bold",
    fontSize: 14,
  },
});

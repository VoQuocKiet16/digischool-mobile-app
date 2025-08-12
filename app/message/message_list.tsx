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
import { useChatContext } from "../../contexts/ChatContext";
import { useChatState } from "../../hooks/useChatState";
import chatService from "../../services/chat.service";
import { fonts } from "../../utils/responsive";

// Giả sử token và myId lấy từ context hoặc props, ở đây hardcode để demo
type Props = {
  token?: string;
};

export default function MessageListScreen({ token = "demo-token" }: Props) {
  const { currentUserId, currentToken } = useChatContext();
  const {
    isConnected,
    getConversations,
    setConversations,
    updateConversationWithMessage,
    markConversationAsRead,
    invalidateConversations,
    // Thêm methods mới cho persistent storage
    loadConversationsFromStorage,
    saveConversationsToStorage,
  } = useChatState();
  const [search, setSearch] = useState("");
  const [chatData, setChatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myId, setMyId] = useState<string | undefined>(currentUserId || undefined);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  // Bước 1: Load data từ persistent storage trước (hiển thị ngay)
  useEffect(() => {
    const loadInitialData = async () => {
      if (currentUserId) {
        setMyId(currentUserId);
        // Đọc từ persistent storage trước để hiển thị ngay
        const storedConversations = await loadConversationsFromStorage(currentUserId);
        if (storedConversations && storedConversations.length > 0) {
          console.log('🚀 Loaded conversations from storage, displaying immediately');
          setChatData(storedConversations);
          setLoading(false);
          setIsInitialLoad(false);
        }
      } else {
        AsyncStorage.getItem("userId").then(async (id) => {
          const uid = id ?? undefined;
          setMyId(uid);
          if (uid) {
            // Đọc từ persistent storage trước
            const storedConversations = await loadConversationsFromStorage(uid);
            if (storedConversations && storedConversations.length > 0) {
              console.log('🚀 Loaded conversations from storage, displaying immediately');
              setChatData(storedConversations);
              setLoading(false);
              setIsInitialLoad(false);
            }
          }
        });
      }
    };

    loadInitialData();
  }, [currentUserId, loadConversationsFromStorage]);

  // Bước 2: Kiểm tra RAM cache (nếu có)
  useEffect(() => {
    if (currentUserId && isInitialLoad) {
      const cached = getConversations(currentUserId);
      if (cached?.items && cached.items.length > 0) {
        console.log('🚀 Loaded conversations from RAM cache');
        setChatData(cached.items);
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [currentUserId, getConversations, isInitialLoad]);

  // Tách fetchConversations ra ngoài để có thể gọi lại
  const fetchConversations = async (showLoading = true) => {
    if (showLoading) {
      setError("");
      setLoading(true);
    }
    
    try {
      const actualToken = currentToken || token;
      const res = await chatService.getConversations(actualToken);
      if (res.success) {
        console.log('🔄 Fetched fresh conversations from API');
        setChatData(res.data);
        if (myId) {
          setConversations(myId, res.data);
          // Lưu vào persistent storage
          await saveConversationsToStorage(myId, res.data);
        }
      } else {
        setError(res.message || "Lỗi không xác định");
        if (!chatData.length) setChatData([]);
      }
    } catch (e) {
      setError("Lỗi kết nối server");
      if (!chatData.length) setChatData([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Bước 3: Sync với API (background, không block UI)
  useEffect(() => {
    const syncWithAPI = async () => {
      if (myId && !isInitialLoad) {
        const cached = getConversations(myId);
        const staleTimeMs = 20 * 1000; // 20 giây
        const isFresh = cached && Date.now() - cached.updatedAt < staleTimeMs;
        
        if (!isFresh) {
          console.log('🔄 Cache stale, syncing with API in background');
          // Sync ngầm, không hiển thị loading
          fetchConversations(false);
        } else {
          console.log('✅ Cache still fresh, no API call needed');
        }
      }
    };

    // Chỉ sync sau khi đã load initial data
    if (!isInitialLoad) {
      syncWithAPI();
    }
  }, [currentToken, token, refreshFlag, myId, isInitialLoad]);

  useEffect(() => {
    const handleNewMessage = (msg: any) => {
      // Sử dụng hook để update conversation
      updateConversationWithMessage(msg);
      
      setChatData((prevData) => {
        const otherUserId = msg.sender === myId ? msg.receiver : msg.sender;
        const idx = prevData.findIndex(
          (item) => item.userId === otherUserId || item.id === otherUserId
        );
        if (idx === -1) {
          // Nếu không tìm thấy conversation, refresh toàn bộ danh sách
          fetchConversations(false);
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
        if (myId) {
          setConversations(myId, newData);
          // Invalidate cache để đảm bảo data luôn fresh
          invalidateConversations();
        }
        return newData;
      });
    };
    
    const handleMessageRead = (data: any) => {
      // Sử dụng hook để mark conversation as read
      markConversationAsRead(data.from);
      
      // Khi có tin nhắn được mark as read, reset unreadCount cho conversation đó
      setChatData((prevData) => {
        const idx = prevData.findIndex(
          (item) => item.userId === data.from || item.id === data.from
        );
        if (idx !== -1) {
          const updated = { ...prevData[idx], unreadCount: 0 };
          const newData = [
            updated,
            ...prevData.slice(0, idx),
            ...prevData.slice(idx + 1),
          ];
          if (myId) {
            setConversations(myId, newData);
            // Invalidate cache để đảm bảo data luôn fresh
            invalidateConversations();
          }
          return newData;
        }
        return prevData;
      });
    };
    
    if (myId) {
      chatService.onNewMessage(myId, handleNewMessage);
      chatService.onMessageRead(myId, handleMessageRead);
      return () => {
        chatService.offNewMessage(myId, handleNewMessage);
        chatService.offMessageRead(myId, handleMessageRead);
      };
    }
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
      
      {loading && isInitialLoad ? (
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
                  // Chỉ mark as read khi user thực sự nhấn vào conversation
                  if (item.unreadCount > 0) {
                    // Mark as read khi user nhấn vào conversation cụ thể này
                    if (myId) {
                      const conversationUserId = item.userId || item.id;
                      chatService.markAsRead(myId, myId, conversationUserId);
                    }
                    
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
                      if (myId) setConversations(myId, newData);
                      return newData;
                    });
                  }
                  router.push({
                    pathname: "/message/message_box",
                    params: {
                      userId: item.userId || item.id,
                      token: currentToken || token,
                      myId: myId,
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
          onRefresh={() => {
            setRefreshFlag(prev => prev + 1);
            fetchConversations(true);
          }}
          refreshing={loading && !isInitialLoad}
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

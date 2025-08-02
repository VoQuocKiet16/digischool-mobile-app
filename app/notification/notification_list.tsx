import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { io, Socket } from "socket.io-client";
import HeaderLayout from "../../components/layout/HeaderLayout";
import { useNotificationContext } from "../../contexts/NotificationContext";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  Notification,
} from "../../services/notification.service";
import { fonts } from "../../utils/responsive";

const SOCKET_URL = "http://192.168.1.7:8080/";

const TABS = [
  { key: "user", label: "Người dùng" },
  { key: "activity", label: "Hoạt động" },
  { key: "system", label: "Hệ thống" },
];

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

function truncateText(text: string, maxLength = 90) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export default function NotificationListScreen() {
  const [tab, setTab] = useState("user");
  const [search, setSearch] = useState("");
  const [notificationsUser, setNotificationsUser] = useState<Notification[]>(
    []
  );
  const [notificationsActivity, setNotificationsActivity] = useState<
    Notification[]
  >([]);
  const [notificationsSystem, setNotificationsSystem] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();
  const { refreshNotifications } = useNotificationContext();

  // Kết nối socket và lắng nghe notification mới
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const [userId, token] = await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("token"),
        ]);

        if (userId && token) {
          setUserId(userId);
          
          const newSocket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token: `Bearer ${token}` },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
          });

          newSocket.on("connect", () => {
            console.log("✅ Notification list socket connected");
          });

          newSocket.on("disconnect", () => {
            console.log("❌ Notification list socket disconnected");
          });

          // Lắng nghe notification mới
          newSocket.on("new_notification", (notification: Notification) => {
            // Thêm notification vào đúng category
            switch (notification.type) {
              case "user":
                setNotificationsUser(prev => [notification, ...prev]);
                break;
              case "activity":
                setNotificationsActivity(prev => [notification, ...prev]);
                break;
              case "system":
                setNotificationsSystem(prev => [notification, ...prev]);
                break;
            }
          });

          newSocket.emit("join", userId);
          setSocket(newSocket);
        }
      } catch (error) {
        console.error("❌ Error initializing notification list socket:", error);
      }
    };

    initializeSocket();

    // Cleanup khi component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const fetchAllNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token đăng nhập");
        setLoading(false);
        return;
      }
      const [user, activity, system] = await Promise.all([
        getNotifications({ type: "user", token }),
        getNotifications({ type: "activity", token }),
        getNotifications({ type: "system", token }),
      ]);
      setNotificationsUser(user.data || []);
      setNotificationsActivity(activity.data || []);
      setNotificationsSystem(system.data || []);
    } catch (err) {
      setError("Không thể tải thông báo");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAllNotifications();
    }, [])
  );

  const safeUserId = userId || "";
  const unreadCounts = {
    user: notificationsUser.filter(
      (n) => !n.isReadBy || !n.isReadBy.includes(safeUserId)
    ).length,
    activity: notificationsActivity.filter(
      (n) => !n.isReadBy || !n.isReadBy.includes(safeUserId)
    ).length,
    system: notificationsSystem.filter(
      (n) => !n.isReadBy || !n.isReadBy.includes(safeUserId)
    ).length,
  };

  const notifications =
    tab === "user"
      ? notificationsUser
      : tab === "activity"
      ? notificationsActivity
      : notificationsSystem;

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
  );

  // Đếm số lượng chưa đọc cho từng tab
  const unreadCountsForDisplay = {
    user: notificationsUser.filter(
      (n) => !n.isReadBy || !n.isReadBy.includes(safeUserId)
    ).length,
    activity: notificationsActivity.filter(
      (n) => !n.isReadBy || !n.isReadBy.includes(safeUserId)
    ).length,
    system: notificationsSystem.filter(
      (n) => !n.isReadBy || !n.isReadBy.includes(safeUserId)
    ).length,
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      await markAllNotificationsAsRead(token);
      fetchAllNotifications();
      // Cập nhật notification context
      refreshNotifications();
    } catch {}
  };

  const handlePressNotification = async (item: Notification) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        await markNotificationAsRead(item._id, token);
        // Cập nhật notification context
        refreshNotifications();
      }
    } catch (err) {
      alert("Lỗi khi đánh dấu thông báo đã đọc");
    }
    router.push({
      pathname: "/notification/notification_detail",
      params: {
        title: item.title,
        content: item.content,
        sender_name: item.sender?.name || "",
        sender_gender: item.sender?.gender || "",
        sender_id: item.sender?._id || "",
        createdAt: item.createdAt,
        relatedObject_id: item.relatedObject?.id || "",
        relatedObject_requestType: item.relatedObject?.requestType || "",
        relatedObject_status: item.relatedObject?.status || "",
      },
    });
  };

  return (
    <HeaderLayout
      title="Thông báo"
      onBack={() => router.back()}
      rightIcon={<MaterialIcons name="add" size={30} color="#29375C" />}
      onRightIconPress={() => {
        router.push("/notification/notification_create");
      }}
    >
      <View style={styles.tabsRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={[styles.tabText, tab === t.key && styles.tabTextActive]}
              >
                {t.label}
              </Text>
              {unreadCountsForDisplay[t.key as "user" | "activity" | "system"] >
                0 && (
                <View style={styles.unreadBadgeWrap}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCountsForDisplay[
                      t.key as "user" | "activity" | "system"
                    ] > 9
                      ? "9+"
                      : unreadCountsForDisplay[
                          t.key as "user" | "activity" | "system"
                        ]}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons
            name="search"
            size={24}
            color="#29375C"
            style={{ marginLeft: 15 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm thông báo..."
            placeholderTextColor="#A0A0A0"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.bellBtn}>
            <MaterialIcons
              name="notifications-active"
              size={24}
              color="#29375C"
            />
          </TouchableOpacity>
        </View>
      </View>
      {filteredNotifications.length > 0 &&
        unreadCounts[tab as "user" | "activity" | "system"] > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
          >
            <Text style={styles.markAllBtnText}>Đánh dấu tất cả đã đọc</Text>
            <MaterialIcons name="mark-email-unread" size={26} color="#29375C" />
          </TouchableOpacity>
        )}
      {loading ? (
        <Text
          style={{
            textAlign: "center",
            marginTop: 20,
            fontFamily: fonts.medium,
            fontSize: 14,
            color: "#A0A0A0",
          }}
        >
          Đang tải...
        </Text>
      ) : error ? (
        <Text
          style={{
            textAlign: "center",
            color: "red",
            marginTop: 20,
            fontFamily: fonts.medium,
            fontSize: 14,
          }}
        >
          {error}
        </Text>
      ) : filteredNotifications.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            marginTop: 20,
            fontFamily: fonts.medium,
            fontSize: 14,
            color: "#A0A0A0",
          }}
        >
          Không có thông báo nào
        </Text>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item._id}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => {
            const isUnread =
              userId && (!item.isReadBy || !item.isReadBy.includes(userId));
            return (
              <TouchableOpacity onPress={() => handlePressNotification(item)}>
                <View style={styles.notiItem}>
                  <Image
                    source={require("../../assets/images/teacher.png")}
                    style={styles.avatar}
                  />
                  <View style={styles.notiContent}>
                    <View style={styles.notiHeader}>
                      <Text style={styles.notiName}>{item.title}</Text>
                      <Text style={styles.notiTime}>
                        {timeAgo(item.createdAt)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={[
                          styles.notiText,
                          isUnread && {
                            fontFamily: fonts.semiBold,
                            color: "#000",
                          },
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {truncateText(item.content)}
                      </Text>
                      {isUnread && <Text style={styles.markIcon}>•</Text>}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchAllNotifications}
          refreshing={loading}
        />
      )}
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
    padding: 2,
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tabBtnActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    color: "#A0A0A0",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    color: "#29375C",
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 32,
    marginVertical: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    height: 55,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#29375C",
    marginLeft: 8,
    fontFamily: fonts.medium,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  notiItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.8,
    borderBottomColor: "#E0E0E0",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 12,
    marginTop: 2,
  },
  notiContent: {
    flex: 1,
    justifyContent: "center",
  },
  notiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  notiName: {
    color: "#000",
    fontSize: 18,
    flex: 1,
    fontFamily: fonts.semiBold,
  },
  notiTime: {
    color: "#A0A0A0",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: fonts.medium,
  },
  notiText: {
    color: "#707274",
    fontSize: 14,
    marginTop: 2,
    fontFamily: fonts.medium,
    flex: 1,
  },
  markIcon: {
    alignSelf: "flex-end",
    color: "#B71C1C",
    fontSize: 40,
    marginBottom: -15,
  },
  unreadBadge: {
    color: "#F9B233",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  unreadBadgeWrap: {
    backgroundColor: "#F9B233",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    marginLeft: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: fonts.bold,
    textAlign: "center",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  markAllBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#29375C",
    marginRight: 8,
    textDecorationLine: "underline",
  },
});

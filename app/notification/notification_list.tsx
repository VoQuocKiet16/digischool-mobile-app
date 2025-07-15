import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import HeaderLayout from "../../components/layout/HeaderLayout";
import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "../../services/notification.service";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const userInfoString = await AsyncStorage.getItem("userId");
      if (userInfoString) {
        setUserId(userInfoString);
      }
    })();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token đăng nhập");
        setLoading(false);
        return;
      }
      const res = await getNotifications({ type: tab, token });
      setNotifications(res.data || []);
    } catch (err) {
      setError("Không thể tải thông báo");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePressNotification = async (item: Notification) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        await markNotificationAsRead(item._id, token);
      }
    } catch (err) {
      // Có thể log lỗi nếu cần
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
            <Text
              style={[styles.tabText, tab === t.key && styles.tabTextActive]}
            >
              {t.label}
            </Text>
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
            <MaterialIcons name="notifications-active" size={24} color="#29375C" />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Đang tải...</Text>
      ) : error ? (
        <Text style={{ textAlign: "center", color: "red", marginTop: 20 }}>
          {error}
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
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text
                        style={[
                          styles.notiText,
                          isUnread && { fontFamily: "Baloo2-SemiBold", color: "#000" },
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {truncateText(item.content)}
                      </Text>
                      {isUnread && (
                        <Text style={ styles.markIcon }>•</Text>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
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
    fontFamily: "Baloo2-Medium",
  },
  tabTextActive: {
    color: "#29375C",
    fontSize: 18,
    fontFamily: "Baloo2-SemiBold",
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
    fontFamily: "Baloo2-Medium",
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
    fontFamily: "Baloo2-SemiBold",
  },
  notiTime: {
    color: "#A0A0A0",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: "Baloo2-Medium",
  },
  notiText: {
    color: "#707274",
    fontSize: 14,
    marginTop: 2,
    fontFamily: "Baloo2-Medium",
    flex: 1,
  },
  markIcon: {
    alignSelf: 'flex-end',
    color: "#B71C1C",
    fontSize: 40,
    marginBottom: -15,
  },
});

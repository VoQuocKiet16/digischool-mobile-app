import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import PlusIcon from "../../components/PlusIcon";
import { getMyNews } from "../../services/news.service";

export default function ManageNewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Thêm hàm formatRelativeTime
  function formatRelativeTime(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // giây
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  }

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      const res = await getMyNews();
      if (res.success) {
        setNews(res.data || []);
      } else {
        setError(res.message || "Lỗi không xác định");
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <HeaderLayout
      title="Danh sách tin đăng"
      subtitle="Tin đăng của giáo viên"
      onBack={() => router.push("/news")}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#29375C"
              style={{ marginTop: 40 }}
            />
          ) : error ? (
            <Text style={{ color: "red", marginTop: 40 }}>{error}</Text>
          ) : news.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
                fontFamily: "Baloo2-Medium",
                fontSize: 16,
                color: "#A0A0A0",
              }}
            >
              Không có tin đăng nào
            </Text>
          ) : (
            <FlatList
              data={news}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/news/edit_news",
                      params: {
                        id: item._id,
                      },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.card}>
                    <Image
                      source={{ uri: item.coverImage }}
                      style={styles.cardImage}
                    />
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <MaterialIcons
                          name="push-pin"
                          size={20}
                          color="#29375C"
                          style={{
                            marginLeft: 10,
                            transform: [{ rotate: "40deg" }],
                          }}
                        />
                      </View>
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {item.content?.replace(/<[^>]+>/g, "")}
                      </Text>
                      <View style={styles.cardFooter}>
                        <MaterialIcons
                          name="access-time"
                          size={16}
                          color="#29375C"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.cardTime}>
                          {item.createdAt
                            ? formatRelativeTime(item.createdAt)
                            : ""}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        <View style={styles.plusWrap}>
          <PlusIcon
            text="Thêm tin tức"
            onPress={() => router.push("/news/add_news")}
          />
        </View>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#E5E8F0",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 18,
    width: 340,
    alignSelf: "center",
    padding: 12,
    alignItems: "center",
  },
  cardImage: {
    width: 80,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  cardContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 24,
    color: "#29375C",
    flex: 1,
    fontFamily: "Baloo2-SemiBold",
  },
  cardDesc: {
    color: "#7D88A7",
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "Baloo2-Medium",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTime: {
    color: "#29375C",
    fontSize: 13,
    fontFamily: "Baloo2-Medium",
  },
  plusWrap: {
    marginTop: 8,
    marginBottom: 30,
    alignItems: "flex-start",
    width: "90%",
  },
});

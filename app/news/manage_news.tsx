import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useNewsStore } from "../../stores/news.store";
import { fonts } from "../../utils/responsive";

export default function ManageNewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sử dụng news store để truy cập persistent storage
  const { loadNewsFromStorage, saveNewsToStorage } = useNewsStore();

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

      try {
        // Bước 1: Thử load từ persistent storage trước
        const storedNews = await loadNewsFromStorage('news', 'all');
        if (storedNews && storedNews.length > 0) {
          // Lọc chỉ lấy news của giáo viên hiện tại
          const userId = await AsyncStorage.getItem("userId");
          const teacherNews = storedNews.filter(item => 
            item.createdBy?._id === userId || item.createdBy?.id === userId
          );
          
          if (teacherNews.length > 0) {
            console.log('🚀 Loaded teacher news from storage, displaying immediately');
            setNews(teacherNews);
            setLoading(false);
            return;
          }
        }

        // Bước 2: Nếu không có trong storage, gọi API
        console.log('🔄 No teacher news in storage, fetching from API');
        const res = await getMyNews();
        if (res.success) {
          const newsData = res.data || [];
          setNews(newsData);
          
          // Lưu vào persistent storage
          await saveNewsToStorage('news', 'all', newsData);
        } else {
          setError(res.message || "Lỗi không xác định");
        }
      } catch (error) {
        console.error('Error fetching teacher news:', error);
        setError("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [loadNewsFromStorage, saveNewsToStorage]);

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
                fontFamily: fonts.medium,
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
    fontFamily: fonts.semiBold,
  },
  cardDesc: {
    color: "#7D88A7",
    fontSize: 14,
    marginBottom: 6,
    fontFamily: fonts.medium,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTime: {
    color: "#29375C",
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  plusWrap: {
    marginTop: 8,
    marginBottom: 30,
    alignItems: "flex-start",
    width: "90%",
  },
});

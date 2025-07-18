import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import HeaderLayout from "../../components/layout/HeaderLayout";
import {
  favoriteNews,
  getNewsDetail,
  unfavoriteNews,
} from "../../services/news.service";

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const screenWidth = Dimensions.get("window").width;

  // Hàm formatRelativeTime giống news_feed.tsx
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
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      const res = await getNewsDetail(id as string);
      if (res.success) {
        setNews(res.data);
        // Kiểm tra userId trong mảng favorites
        const userId = await AsyncStorage.getItem("userId");
        const favArr = Array.isArray(res.data.favorites)
          ? res.data.favorites
          : [];
        setFavorite(
          userId ? favArr.map(String).includes(String(userId)) : false
        );
      } else {
        setError(res.message || "Lỗi không xác định");
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!news || favoriteLoading) return;
    setFavoriteLoading(true);
    if (favorite) {
      const res = await unfavoriteNews(news._id || news.id);
      if (res.success) setFavorite(false);
    } else {
      const res = await favoriteNews(news._id || news.id);
      if (res.success) setFavorite(true);
    }
    setFavoriteLoading(false);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#29375C" />
      </View>
    );
  if (error || !news)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error || "Không tìm thấy tin"}</Text>
      </View>
    );

  return (
    <HeaderLayout
      title="Chi tiết tin tức"
      onBack={() => router.back()}
      rightIcon={
        favoriteLoading ? (
          <ActivityIndicator size={22} color="#29375C" />
        ) : (
          <Ionicons
            name={favorite ? "bookmark" : "bookmark-outline"}
            size={28}
            color="#29375C"
          />
        )
      }
      onRightIconPress={handleToggleFavorite}
    >
      <ScrollView
        style={styles.contentWrap}
        showsVerticalScrollIndicator={false}
      >
        {/* Tiêu đề */}
        <Text style={styles.title}>{news.title || ""}</Text>
        {/* Nội dung */}
        <WebView
          originWhitelist={["*"]}
          source={{
            html: `
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&family=Manrope:wght@200..800&family=Space+Grotesk:wght@300..700&display=swap');
              </style>
              <style>
                body {
                  font-size: 50px;
                  line-height: 1.5;
                  font-family: "Baloo 2", sans-serif;
                  font-weight: 450;
                  color: #29375C;
                }
              </style>
              ${news.content || "<p>Không có nội dung</p>"}
            `,
          }}
          style={{
            width: "100%",
            minHeight: 150,
            maxHeight: 350,
            backgroundColor: "transparent",
          }}
          scrollEnabled={false}
        />
        {/* Hashtag */}
        {news.hashtag && <Text style={styles.hashtag}>{news.hashtag}</Text>}
        {/* Tác giả và thời gian */}
        {news.createdBy?.name && (
          <Text style={styles.author}>{news.createdBy?.name || ""}</Text>
        )}
        {news.createdAt && (
          <Text style={styles.time}>{formatRelativeTime(news.createdAt)}</Text>
        )}
      </ScrollView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  contentWrap: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 18,
  },
  title: {
    fontSize: 28,
    color: "#000",
    marginBottom: 10,
    fontFamily: "Baloo2-SemiBold",
  },
  hashtag: {
    color: "#3B6EF6",
    fontSize: 15,
    marginTop: 12,
    marginBottom: 2,
    fontWeight: "500",
    fontFamily: "Baloo2-Medium",
  },
  author: {
    color: "#29375C",
    fontSize: 18,
    marginBottom: 6,
    fontFamily: "Baloo2-Medium",
  },
  time: {
    color: "#A0A0A0",
    fontSize: 15,
    fontFamily: "Baloo2-Medium",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

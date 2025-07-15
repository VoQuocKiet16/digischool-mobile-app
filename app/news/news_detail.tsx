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
import RenderHtml from "react-native-render-html";
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
      title="Bí kiếp chinh phục"
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
        contentContainerStyle={styles.contentWrap}
        showsVerticalScrollIndicator={false}
      >
        <RenderHtml
          contentWidth={screenWidth - 32}
          source={{ html: news.content || "" }}
          tagsStyles={{
            body: {
              color: "#29375C",
              fontSize: 16,
              fontFamily: "Baloo2-Medium",
            },
            p: { marginBottom: 8, lineHeight: 22 },
            b: { fontWeight: "bold" },
            ul: { marginBottom: 8 },
            li: { marginBottom: 4 },
          }}
        />
        {/* Hashtag */}
        {news.hashtag && <Text style={styles.hashtag}>{news.hashtag}</Text>}
        {/* Tác giả và thời gian */}
        <Text style={styles.author}>{news.createdBy?.name || ""}</Text>
        <Text style={styles.time}>
          {news.createdAt
            ? new Date(news.createdAt).toLocaleString("vi-VN")
            : ""}
        </Text>
      </ScrollView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  hashtag: {
    color: "#3B6EF6",
    fontSize: 15,
    marginTop: 12,
    marginBottom: 2,
    fontWeight: "500",
  },
  author: {
    color: "#29375C",
    fontSize: 15,
    marginTop: 8,
    fontWeight: "bold",
  },
  time: {
    color: "#7D88A7",
    fontSize: 14,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

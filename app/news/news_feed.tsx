import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MenuDropdown from "../../components/MenuDropdown";
import {
  favoriteNews,
  getAllNews,
  getFavoriteNews,
  getNewsBySubject,
  unfavoriteNews,
} from "../../services/news.service";
import { getAllSubjects } from "../../services/subjects.service";
import { useNewsStore, type NewsStoreState } from "../../stores/news.store";
import { fonts, responsive, responsiveValues } from "../../utils/responsive";

const { width, height } = Dimensions.get('window');

export default function NewsFeedScreen() {
  const [tab, setTab] = useState<"news" | "favorite">("news");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({ tab: "news", subject: "all" }); // Track filter hiện tại
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([
    {
      key: "all",
      label: "Tất cả",
      icon: require("../../assets/images/all.png"),
    },
  ]);
  const getCache = useNewsStore((s: NewsStoreState) => s.getCache);
  const setCache = useNewsStore((s: NewsStoreState) => s.setCache);
  // Thêm methods mới cho persistent storage
  const loadNewsFromStorage = useNewsStore((s: NewsStoreState) => s.loadNewsFromStorage);
  const saveNewsToStorage = useNewsStore((s: NewsStoreState) => s.saveNewsToStorage);

  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("role").then((r) => {
      if (r) {
        try {
          const arr = JSON.parse(r);
          setRole(Array.isArray(arr) ? arr[0] : arr);
        } catch {
          setRole(r);
        }
      }
    });
  }, []);

  useEffect(() => {
    // Lấy danh sách môn học từ API
    const fetchSubjects = async () => {
      setSubjectsLoading(true); // Bắt đầu loading subjects
      const res = await getAllSubjects();
      if (res.success && res.data?.subjects) {
        // Map subjectName sang icon
        const iconMap: Record<string, any> = {
          "Ngữ văn": require("../../assets/images/literature.png"),
          "Toán": require("../../assets/images/math.png"),
          "Ngoại ngữ": require("../../assets/images/foreign.png"),
          "Vật lý": require("../../assets/images/physics.png"),
          "Hóa học": require("../../assets/images/chemistry.png"),
          "Sinh học": require("../../assets/images/biology.png"),
          "Lịch sử": require("../../assets/images/history.png"),
          "Địa lý": require("../../assets/images/geography.png"),
          "GDCD": require("../../assets/images/gdcd.png"),
          "Thể dục": require("../../assets/images/pe.png"),
          "GDQP": require("../../assets/images/nationaldefense.png"),
          "Tin học": require("../../assets/images/informatics.png"),
        };
        const mapped = res.data.subjects.map((s) => ({
          key: s._id,
          label: s.subjectName,
          icon:
            iconMap[s.subjectName] || require("../../assets/images/all.png"),
          id: s._id,
        }));
        setSubjects([
          {
            key: "all",
            label: "Tất cả",
            icon: require("../../assets/images/all.png"),
          },
          ...mapped,
        ]);
      }
      setSubjectsLoading(false); // Kết thúc loading subjects
    };
    fetchSubjects();
  }, []);

  // Bước 1: Load tin tức từ persistent storage trước (hiển thị ngay)
  useEffect(() => {
    const loadInitialNews = async () => {
      const keyTab: "news" | "favorite" = tab;
      const keySubject = selectedSubject || "all";

      // Đọc từ persistent storage trước để hiển thị ngay
      const storedNews = await loadNewsFromStorage(keyTab, keySubject);
      if (storedNews && storedNews.length > 0) {
        console.log('🚀 Loaded news from storage, displaying immediately');
        setNewsList(storedNews);
        setInitialLoading(false);
        setHasInitialized(true);
        return;
      }

      // Nếu không có storage, kiểm tra RAM cache
      const cached = getCache(keyTab, keySubject);
      if (cached && cached.items?.length) {
        console.log('🚀 Loaded news from RAM cache');
        setNewsList(cached.items);
        setInitialLoading(false);
        setHasInitialized(true);
        return;
      }

      // Nếu không có cache, gọi API
      console.log('🔄 No cached news, fetching from API');
      fetchInitialNewsFromAPI();
    };

    loadInitialNews();
  }, [tab, selectedSubject, loadNewsFromStorage, getCache]);

  // Tách fetch news ra ngoài để có thể gọi lại
  const fetchInitialNewsFromAPI = async () => {
    const keyTab: "news" | "favorite" = tab;
    const keySubject = selectedSubject || "all";

    setError(null);
    try {
      if (keyTab === "favorite") {
        const res = await getFavoriteNews();
        if (res.success) {
          let filteredData = res.data || [];
          if (keySubject !== "all") {
            const subjectObj = subjects.find((s) => s.key === keySubject || s.id === keySubject);
            if (subjectObj?.id) {
              filteredData = filteredData.filter((news: any) => news.subject === subjectObj.id || news.subject === subjectObj.key);
            }
          }
          setNewsList(filteredData);
          setCache(keyTab, keySubject, filteredData);
          // Lưu vào persistent storage
          await saveNewsToStorage(keyTab, keySubject, filteredData);
        } else {
          setError(res.message || "Lỗi không xác định");
        }
      } else {
        if (keySubject === "all") {
          const res = await getAllNews();
          if (res.success) {
            setNewsList(res.data || []);
            setCache(keyTab, keySubject, res.data || []);
            // Lưu vào persistent storage
            await saveNewsToStorage(keyTab, keySubject, res.data || []);
          } else {
            setError(res.message || "Lỗi không xác định");
          }
        } else {
          const subjectObj = subjects.find((s) => s.key === keySubject || s.id === keySubject);
          if (subjectObj?.id) {
            const res = await getNewsBySubject(subjectObj.id);
            if (res.success) {
              setNewsList(res.data || []);
              setCache(keyTab, keySubject, res.data || []);
              // Lưu vào persistent storage
              await saveNewsToStorage(keyTab, keySubject, res.data || []);
            } else {
              setError(res.message || "Lỗi không xác định");
            }
          } else {
            setNewsList([]);
            setCache(keyTab, keySubject, []);
            // Lưu vào persistent storage
            await saveNewsToStorage(keyTab, keySubject, []);
          }
        }
      }
    } catch (error) {
      setError("Lỗi kết nối server");
    } finally {
      setInitialLoading(false);
      setHasInitialized(true);
    }
  };

  // Bước 2: Sync với API (background, không block UI)
  useEffect(() => {
    if (!hasInitialized) return;

    const syncWithAPI = async () => {
      const keyTab: "news" | "favorite" = tab;
      const keySubject = selectedSubject || "all";

      const cached = getCache(keyTab, keySubject);
      const staleTimeMs = 10 * 60 * 1000; // 10 phút
      const isFresh = cached && Date.now() - cached.updatedAt < staleTimeMs;
      
      if (!isFresh) {
        console.log('🔄 News cache stale, syncing with API in background');
        // Sync ngầm, không hiển thị loading
        fetchNewsFromAPI(false);
      } else {
        console.log('✅ News cache still fresh, no API call needed');
      }
    };

    // Chỉ sync sau khi đã load initial data
    if (hasInitialized) {
      syncWithAPI();
    }
  }, [tab, selectedSubject, hasInitialized, getCache, saveNewsToStorage]);

  // Khi chọn subject hoặc tab, gọi API filter, ưu tiên cache trước
  useEffect(() => {
    if (!hasInitialized) return;
    if (currentFilter.tab === tab && currentFilter.subject === selectedSubject) return;
    setCurrentFilter({ tab, subject: selectedSubject });

    const keyTab: "news" | "favorite" = tab;
    const keySubject = selectedSubject || "all";

    const cached = getCache(keyTab, keySubject);
    if (cached) {
      setNewsList(cached.items);
    }

    const fetchNews = async () => {
      const staleTimeMs = 10 * 60 * 1000;
      const isFresh = cached && Date.now() - cached.updatedAt < staleTimeMs;
      if (isFresh) {
        setLoading(false);
        return;
      }

      setLoading(!cached); // nếu có cache thì không hiển thị loading nặng
      setError(null);

      try {
        if (tab === "favorite") {
          const res = await getFavoriteNews();
          if (res.success) {
            let filteredData = res.data || [];
            if (selectedSubject !== "all") {
              const subjectObj = subjects.find((s) => s.key === selectedSubject || s.id === selectedSubject);
              if (subjectObj?.id) {
                filteredData = filteredData.filter((news: any) => 
                  news.subject === subjectObj.id || news.subject === subjectObj.key
                );
              }
            }
            setNewsList(filteredData);
            setCache(keyTab, keySubject, filteredData);
            // Lưu vào persistent storage
            await saveNewsToStorage(keyTab, keySubject, filteredData);
          } else {
            setError(res.message || "Lỗi không xác định");
          }
        } else {
          if (selectedSubject === "all") {
            const res = await getAllNews();
            if (res.success) {
              setNewsList(res.data || []);
              setCache(keyTab, keySubject, res.data || []);
              // Lưu vào persistent storage
              await saveNewsToStorage(keyTab, keySubject, res.data || []);
            } else {
              setError(res.message || "Lỗi không xác định");
            }
          } else {
            const subjectObj = subjects.find((s) => s.key === selectedSubject || s.id === selectedSubject);
            if (subjectObj?.id) {
              const res = await getNewsBySubject(subjectObj.id);
              if (res.success) {
                setNewsList(res.data || []);
                setCache(keyTab, keySubject, res.data || []);
                // Lưu vào persistent storage
                await saveNewsToStorage(keyTab, keySubject, res.data || []);
              } else {
                setError(res.message || "Lỗi không xác định");
              }
            } else {
              setNewsList([]);
              setCache(keyTab, keySubject, []);
              // Lưu vào persistent storage
              await saveNewsToStorage(keyTab, keySubject, []);
            }
          }
        }
      } catch (error) {
        setError("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [selectedSubject, tab, subjects, hasInitialized, currentFilter, saveNewsToStorage]);

  // Tách fetch news ra ngoài để có thể gọi lại
  const fetchNewsFromAPI = async (showLoading = true) => {
    const keyTab: "news" | "favorite" = tab;
    const keySubject = selectedSubject || "all";

    if (showLoading) {
      setLoading(true);
      setError(null);
    }

    try {
      if (tab === "favorite") {
        const res = await getFavoriteNews();
        if (res.success) {
          let filteredData = res.data || [];
          if (selectedSubject !== "all") {
            const subjectObj = subjects.find((s) => s.key === selectedSubject || s.id === selectedSubject);
            if (subjectObj?.id) {
              filteredData = filteredData.filter((news: any) => 
                news.subject === subjectObj.id || news.subject === subjectObj.key
              );
            }
          }
          setNewsList(filteredData);
          setCache(keyTab, keySubject, filteredData);
          // Lưu vào persistent storage
          await saveNewsToStorage(keyTab, keySubject, filteredData);
        } else {
          setError(res.message || "Lỗi không xác định");
        }
      } else {
        if (selectedSubject === "all") {
          const res = await getAllNews();
          if (res.success) {
            setNewsList(res.data || []);
            setCache(keyTab, keySubject, res.data || []);
            // Lưu vào persistent storage
            await saveNewsToStorage(keyTab, keySubject, res.data || []);
          } else {
            setError(res.message || "Lỗi không xác định");
          }
        } else {
          const subjectObj = subjects.find((s) => s.key === selectedSubject || s.id === selectedSubject);
          if (subjectObj?.id) {
            const res = await getNewsBySubject(subjectObj.id);
            if (res.success) {
              setNewsList(res.data || []);
              setCache(keyTab, keySubject, res.data || []);
              // Lưu vào persistent storage
              await saveNewsToStorage(keyTab, keySubject, res.data || []);
            } else {
              setError(res.message || "Lỗi không xác định");
            }
          } else {
            setNewsList([]);
            setCache(keyTab, keySubject, []);
            // Lưu vào persistent storage
            await saveNewsToStorage(keyTab, keySubject, []);
          }
        }
      }
    } catch (error) {
      setError("Lỗi kết nối server");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const [showMenu, setShowMenu] = useState(false);

  const handleToggleBookmark = async (id: string) => {
    if (bookmarkLoading) return;
    setBookmarkLoading(id);
    setNewsList((prev) =>
      prev.map((n) => {
        if ((n._id || n.id) === id) {
          const isBookmarked =
            Array.isArray(n.favorites) && userId
              ? n.favorites.map(String).includes(String(userId))
              : false;
          return {
            ...n,
            favorites: isBookmarked
              ? n.favorites.filter((f: string) => String(f) !== String(userId))
              : [...(n.favorites || []), userId],
          };
        }
        return n;
      })
    );
    // Gọi API
    const news = newsList.find((n) => (n._id || n.id) === id);
    const isBookmarked =
      Array.isArray(news?.favorites) && userId
        ? news.favorites.map(String).includes(String(userId))
        : false;
    if (isBookmarked) {
      await unfavoriteNews(id);
    } else {
      await favoriteNews(id);
    }
    setBookmarkLoading(null);
  };

  // Thêm hàm formatRelativeTime phía trên component
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

  // Khi render subjectScroll, filter bỏ các subject 'Chào cờ' và 'Sinh hoạt lớp'
  const filteredSubjects = subjects.filter(
    (s) =>
      s.label !== "Chào cờ" &&
      s.label !== "Sinh hoạt lớp"
  );

  const teacherMenuItems = [
    {
      id: 'add-news',
      title: 'Thêm tin tức',
      onPress: () => router.push("/news/add_news"),
    },
    {
      id: 'manage-news',
      title: 'Quản lý tin tức',
      onPress: () => router.push("/news/manage_news"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "news" && styles.tabBtnActive]}
          onPress={() => setTab("news")}
        >
          <Text
            style={[styles.tabText, tab === "news" && styles.tabTextActive]}
          >
            Tin tức
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "favorite" && styles.tabBtnActive]}
          onPress={() => setTab("favorite")}
        >
          <Text
            style={[styles.tabText, tab === "favorite" && styles.tabTextActive]}
          >
            Yêu thích
          </Text>
        </TouchableOpacity>
        {role === "teacher" && (
          <View style={{ marginLeft: 2 }}>
            <MenuDropdown
              items={teacherMenuItems}
              anchorText=""
              anchorIcon="menu"
              anchorIconSize={responsiveValues.iconSize.xxxxl}
              anchorIconColor="#29375C"
              anchorStyle={{ padding: 2 }}
            />
          </View>
        )}
      </View>

      {/* Subject filter */}
      {subjectsLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subjectScroll}
          contentContainerStyle={{ paddingBottom: 0, marginBottom: 0 }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((_, idx) => (
            <View
              key={idx}
              style={{ alignItems: "center", marginRight: 18, minWidth: 56 }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#E6E9F0",
                  marginBottom: 2,
                }}
              />
              <View
                style={{
                  width: 40,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#D1D5DB",
                  marginBottom: 2,
                }}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subjectScroll}
          contentContainerStyle={{ paddingBottom: 0, marginBottom: 0 }}
        >
          {filteredSubjects.map((s: any) => (
            <TouchableOpacity
              key={s.key}
              style={styles.subjectItem}
              onPress={() => setSelectedSubject(s.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.subjectIconWrap,
                  selectedSubject === s.key && styles.subjectIconActive,
                ]}
              >
                <Image
                  source={s.icon}
                  style={styles.subjectIcon}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={[
                  styles.subjectLabel,
                  selectedSubject === s.key && styles.subjectLabelActive,
                ]}
              >
                {s.label}
              </Text>
              {selectedSubject === s.key && (
                <View style={styles.subjectUnderline} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* News list */}
      {initialLoading ? (
        <View style={{ flexDirection: "row", marginTop: 40 }}>
          {[1, 2, 3].map((_, idx) => (
            <View
              key={idx}
              style={{
                width: 320,
                height: 430,
                backgroundColor: "#E6E9F0",
                borderRadius: 28,
                marginRight: 20,
                marginBottom: 120,
                padding: 24,
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  width: 120,
                  height: 24,
                  backgroundColor: "#D1D5DB",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              />
              <View
                style={{
                  width: 80,
                  height: 18,
                  backgroundColor: "#D1D5DB",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  width: 60,
                  height: 18,
                  backgroundColor: "#D1D5DB",
                  borderRadius: 8,
                }}
              />
            </View>
          ))}
        </View>
      ) : loading ? (
        <View style={{ flexDirection: "row", marginTop: 40 }}>
          {[1, 2, 3].map((_, idx) => (
            <View
              key={idx}
              style={{
                width: 320,
                height: 360,
                backgroundColor: "#E6E9F0",
                borderRadius: 28,
                marginRight: 20,
                marginBottom: 120,
                padding: 24,
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  width: 120,
                  height: 24,
                  backgroundColor: "#D1D5DB",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              />
              <View
                style={{
                  width: 80,
                  height: 18,
                  backgroundColor: "#D1D5DB",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  width: 60,
                  height: 18,
                  backgroundColor: "#D1D5DB",
                  borderRadius: 8,
                }}
              />
            </View>
          ))}
        </View>
      ) : error ? (
        <Text style={{ color: "red", marginTop: 40 }}>{error}</Text>
      ) : !newsList || newsList.length === 0 ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#7D88A7",
              fontSize: 14,
              fontFamily: fonts.medium,
            }}
          >
            Không có tin tức nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={newsList}
          keyExtractor={(item) => item._id || item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 0,
            paddingTop: 0,
            paddingBottom: 110,
            justifyContent: "center",
            alignItems: "center",
          }}
          snapToAlignment="center"
          decelerationRate="fast"
          renderItem={({ item }) => {
            const isBookmarked =
              Array.isArray(item.favorites) && userId
                ? item.favorites.map(String).includes(String(userId))
                : false;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push(`/news/news_detail?id=${item._id || item.id}`)
                }
                style={styles.newsCardContainer}
              >
                <View style={styles.newsCard}>
                  <Image
                    source={{ uri: item.coverImage || item.image?.uri || "" }}
                    style={styles.newsImage}
                  />
                  <View style={styles.overlay} />
                  <TouchableOpacity
                    style={styles.bookmarkBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(item._id || item.id);
                    }}
                    disabled={bookmarkLoading === (item._id || item.id)}
                  >
                    {bookmarkLoading === (item._id || item.id) ? (
                      <ActivityIndicator size={20} color="#fff" />
                    ) : (
                      <MaterialIcons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color="#fff"
                      />
                    )}
                  </TouchableOpacity>
                  <View style={styles.newsContent}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginTop: 4,
                      }}
                    >
                      {/* Bên trái */}
                      <View
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 20,
                          }}
                        >
                          {item.subject && (
                            <Image
                              source={
                                subjects.find(
                                  (s) =>
                                    s.key === item.subject ||
                                    s.id === item.subject
                                )?.icon ||
                                require("../../assets/images/all.png")
                              }
                              style={styles.newsSubjectIcon}
                            />
                          )}
                          <Text
                            style={[styles.newsInfoText, { marginLeft: 10 }]}
                          >
                            {subjects.find(
                              (s) =>
                                s.key === item.subject || s.id === item.subject
                            )?.label || "Không xác định"}
                          </Text>
                        </View>
                        <Text style={styles.newsAuthor}>
                          {item.createdBy?.name || ""}
                        </Text>
                      </View>
                      {/* Bên phải */}
                      <View
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-end",
                          minWidth: 90,
                        }}
                      >
                        <Text
                          style={[
                            styles.newsInfoText,
                            { marginBottom: 10, marginTop: 10 },
                          ]}
                        >
                          {item.createdAt
                            ? formatRelativeTime(item.createdAt)
                            : ""}
                        </Text>
                        <Text style={styles.newsInfoText}>
                          {item.views || 0} người xem
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: responsiveValues.padding.md, backgroundColor: "#F7F7F7" },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: responsiveValues.padding.lg,
    marginBottom: responsiveValues.padding.sm,
    gap: responsiveValues.padding.sm,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: "#E6E9F0",
    borderRadius: 24,
    paddingVertical: responsiveValues.padding.sm,
    marginHorizontal: 5,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#29375C",
  },
  tabText: {
    color: "#29375C",
    fontFamily: fonts.semiBold,
    fontSize: responsiveValues.fontSize.lg,
  },
  tabTextActive: {
    color: "#fff",
  },
  subjectScroll: {
    marginTop: responsive.height(1), // responsive theo chiều cao
    paddingLeft: responsive.width(2), // responsive theo chiều rộng
  },
  subjectItem: {
    alignItems: "center",
    marginRight: responsive.isIPad() ? responsive.width(3) : responsive.width(4.5), // Nhỏ hơn cho iPad
    minWidth: responsive.isIPad() ? responsive.width(10) : responsive.width(14), // Nhỏ hơn cho iPad
  },
  subjectIconWrap: {
    width: responsive.isIPad() ? responsive.width(12) : responsive.width(17), // Nhỏ hơn cho iPad
    height: responsive.isIPad() ? responsive.width(12) : responsive.width(17), // Nhỏ hơn cho iPad
    borderRadius: responsive.isIPad() ? responsive.width(9) : responsive.width(13), // Nhỏ hơn cho iPad
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsive.height(0.6),
    borderWidth: 2,
    borderColor: "transparent",
  },
  subjectIconActive: {
    borderColor: "#29375C",
    backgroundColor: "#E6E9F0",
  },
  subjectIcon: {
    width: responsive.isIPad() ? responsive.width(8) : responsive.width(12), // Nhỏ hơn cho iPad
    height: responsive.isIPad() ? responsive.width(8) : responsive.width(12), // Nhỏ hơn cho iPad
  },
  subjectLabel: {
    fontSize: responsive.isIPad() ? responsive.fontSize(11) : responsive.fontSize(13), // Nhỏ hơn cho iPad
    color: "#29375C",
    fontWeight: "500",
    marginBottom: responsive.height(0.2),
  },
  subjectLabelActive: {
    color: "#29375C",
    fontWeight: "bold",
  },
  subjectUnderline: {
    width: responsive.isIPad() ? responsive.width(4) : responsive.width(6), // Nhỏ hơn cho iPad
    height: responsive.isIPad() ? responsive.height(0.3) : responsive.height(0.4), // Nhỏ hơn cho iPad
    backgroundColor: "#29375C",
    borderRadius: 2,
    marginTop: responsive.height(0.2),
  },
  newsCardContainer: {
    width: responsive.cardWidth(75), // 85% chiều rộng màn hình
    height: responsive.isIPad() ? responsive.cardHeight(45) : responsive.cardHeight(50), // iPad 45%, điện thoại 50%
    marginRight: responsiveValues.padding.lg,
    marginTop: responsiveValues.padding.sm,
  },
  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 2,
    shadowRadius: responsiveValues.padding.sm,
    elevation: 2,
    overflow: "hidden",
    position: "relative",
    alignSelf: "center",
    width: "100%",
    height: "100%",
  },
  newsImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37,52,93,0.25)",
  },
  bookmarkBtn: {
    position: "absolute",
    marginTop: 10,
    marginRight: 10,
    top: responsiveValues.padding.sm,
    right: responsiveValues.padding.sm,
    backgroundColor: "rgba(37,52,93,0.7)",
    borderRadius: responsiveValues.borderRadius.md,
    padding: 4,
    zIndex: 2,
  },
  newsContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: responsiveValues.padding.lg,
  },
  newsTitle: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.xxxl,
    marginBottom: responsiveValues.padding.sm,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: fonts.medium,
  },
  newsInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: responsiveValues.padding.lg,
  },
  newsSubjectIcon: {
    width: responsiveValues.iconSize.md,
    height: responsiveValues.iconSize.md,
    marginRight: 4,
  },
  newsInfoText: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.md,
    marginRight: responsiveValues.padding.sm,
    fontFamily: fonts.medium,
  },
  newsAuthor: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.xs,
    fontWeight: "bold",
    marginRight: responsiveValues.padding.sm,
  },
  newsHashtag: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.xs,
    fontStyle: "italic",
  },
  menuPopup: {
    position: "absolute",
    top: responsiveValues.padding.xxxl + 10, // Thêm khoảng cách để menu hiển thị bên dưới icon
    right: responsiveValues.padding.sm,
    backgroundColor: "#29375C",
    borderRadius: responsiveValues.borderRadius.md,
    padding: responsiveValues.padding.sm,
    minWidth: 160,
    marginTop: 0,
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: responsiveValues.padding.sm,
    elevation: 4,
  },
  menuItem: {
    padding: responsiveValues.padding.xs,
    borderRadius: responsiveValues.borderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.xs,
    fontWeight: "500",
    marginLeft: responsiveValues.padding.xs,
  },
});

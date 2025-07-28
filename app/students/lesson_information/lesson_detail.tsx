import HeaderLayout from "@/components/layout/HeaderLayout";
import Lesson_Information from "@/components/lesson_detail/Lesson_Information";
import RefreshableScrollView from "@/components/RefreshableScrollView";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { getLessonDetail } from "../../../services/schedule.service";
import { LessonData } from "../../../types/lesson.types";
import { getLessonSubtitle } from "../../../utils/lessonSubtitle";
import { fonts, responsiveValues } from "../../../utils/responsive";

const LessonDetailScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const pollingRef = useRef<NodeJS.Timeout | number | null>(null);
  const menuIconRef = useRef<View>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (lessonId) {
      fetchLessonDetail();
      // Setup polling mỗi 5s
      pollingRef.current = setInterval(() => {
        pollLessonDetail();
      }, 5000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [lessonId]);

  const fetchLessonDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLessonDetail(lessonId);
      setLessonData(data);
      if (data?.status === "completed") {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    } catch (err) {
      setError("Lỗi tải thông tin tiết học");
    } finally {
      setLoading(false);
    }
  };

  const pollLessonDetail = async () => {
    try {
      const data = await getLessonDetail(lessonId);
      setLessonData(data);
      if (data?.status === "completed") {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    } catch (err) {
      // Không show error khi polling ngầm
    }
  };

  const handleEvaluatePress = () => {
    router.push({
      pathname: "/students/lesson_information/lesson_evaluate",
      params: { lessonId: lessonData?._id },
    });
  };

  if (loading) {
    return (
      <HeaderLayout
        title="Chi tiết tiết học"
        subtitle={getLessonSubtitle(lessonData)}
        onBack={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A546D" />
          <Text style={styles.loadingText}>Đang tải thông tin tiết học...</Text>
        </View>
      </HeaderLayout>
    );
  }

  if (error) {
    return (
      <HeaderLayout
        title="Chi tiết tiết học"
        subtitle={getLessonSubtitle(lessonData)}
        onBack={() => router.back()}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchLessonDetail}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </HeaderLayout>
    );
  }

  return (
    <HeaderLayout
      title="Chi tiết tiết học"
      subtitle={getLessonSubtitle(lessonData)}
      onBack={() => router.back()}
      rightIcon={
        <TouchableOpacity
          ref={menuIconRef}
          onPress={() => {
            menuIconRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
              setMenuPosition({ x, y, width, height });
              setMenuVisible(true);
            });
          }}
        >
          <MaterialIcons name="menu" size={responsiveValues.iconSize.xl} color="#29375C" />
        </TouchableOpacity>
      }
    >
      <RefreshableScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        onRefresh={fetchLessonDetail}
        showsVerticalScrollIndicator={false}
      >
        <Lesson_Information
          isCompleted={isCompleted}
          onEvaluatePress={handleEvaluatePress}
          role="student"
          lessonData={lessonData}
        />
      </RefreshableScrollView>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.menuBox,
              {
                position: "absolute",
                top: menuPosition.y + 0, // 40 là chiều cao menu, 4 là khoảng cách nhỏ
                left: menuPosition.x + menuPosition.width - 110, // 110 là minWidth của menuBox
                marginTop: 0,
                marginRight: 0,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname: "/note/note",
                  params: {
                    lessonId: lessonData?._id,
                    lessonData: JSON.stringify(lessonData),
                  },
                });
              }}
            >
              <Text style={styles.menuText}>Ghi chú</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F04438",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3A546D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 48,
    paddingRight: 12,
  },
  menuBox: {
    backgroundColor: "#29375C",
    borderRadius: 10,
    padding: 5,
    minWidth: 110,
    // Xoá marginTop và marginRight để dùng position tuyệt đối
  },
  menuItem: {
    padding: 5,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});

export default LessonDetailScreen;

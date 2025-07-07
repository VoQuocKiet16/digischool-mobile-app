import HeaderLayout from "@/components/layout/HeaderLayout";
import Lesson_Information from "@/components/lesson_detail/Lesson_Information";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getLessonDetail } from "../../../services/schedule.service";
import { LessonData } from "../../../types/lesson.types";

const LessonDetailScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  useEffect(() => {
    if (lessonId) {
      fetchLessonDetail();
    }
  }, [lessonId]);

  const fetchLessonDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLessonDetail(lessonId);
      setLessonData(data);
    } catch (err) {
      setError("Lỗi tải thông tin tiết học");
      console.error("Error fetching lesson detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluatePress = () => {
    router.push("/students/lesson_information/lesson_evaluate");
  };

  // Tạo subtitle từ dữ liệu lesson
  const getSubtitle = () => {
    if (!lessonData) return "Chưa rõ • Chưa rõ • Chưa rõ • Chưa rõ";

    const session =
      lessonData.timeSlot?.session === "morning" ? "Sáng" : "Chiều";
    const period = `Tiết ${lessonData.timeSlot?.period || 1}`;
    const subject =
      lessonData.subject?.name ||
      lessonData.fixedInfo?.description ||
      "Chưa rõ";
    const className = lessonData.class?.className || "Chưa rõ";

    return `${session} • ${period} • ${subject} • ${className}`;
  };

  if (loading) {
    return (
      <HeaderLayout
        title="Chi tiết tiết học"
        subtitle={getSubtitle()}
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
        subtitle={getSubtitle()}
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
      subtitle={getSubtitle()}
      onBack={() => router.back()}
      rightIcon={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="menu" size={24} color="#25345D" />
        </TouchableOpacity>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Lesson_Information
          onEvaluatePress={handleEvaluatePress}
          role="student"
          lessonData={lessonData}
        />
      </ScrollView>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/note/note");
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
    paddingBottom: 32,
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
    backgroundColor: "#25345D",
    borderRadius: 10,
    padding: 5,
    minWidth: 110,
    marginTop: 75,
    marginRight: 8,
  },
  menuItem: {
    padding: 5,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
});

export default LessonDetailScreen;

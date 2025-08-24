import HeaderLayout from "@/components/layout/HeaderLayout";
import Lesson_Information from "@/components/lesson_detail/Lesson_Information";
import MenuDropdown from "@/components/MenuDropdown";
import RefreshableScrollView from "@/components/RefreshableScrollView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { getLessonDetail } from "../../../services/schedule.service";
import { LessonData } from "../../../types/lesson.types";
import { getLessonSubtitle } from "../../../utils/lessonSubtitle";
import { responsiveValues } from "../../../utils/responsive";

const LessonDetailScreen = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const pollingRef = useRef<NodeJS.Timeout | number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUserId = async () => {
      const userId = await AsyncStorage.getItem("userId");
      setCurrentUserId(userId);
    };
    getCurrentUserId();

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
  }, [lessonId, refreshKey]);

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

  const handleRefresh = async () => {
    await fetchLessonDetail();
    setRefreshKey((k) => k + 1);
  };

  const handleNotePress = () => {
    router.push({
      pathname: "/note/note",
      params: {
        lessonId: lessonData?._id,
        lessonData: JSON.stringify(lessonData),
      },
    });
  };

  const menuItems = [
    {
      id: "note",
      title: "Ghi chú",
      onPress: handleNotePress,
    },
  ];

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
        <MenuDropdown
          items={menuItems}
          anchorIcon="menu"
          anchorIconSize={responsiveValues.iconSize.xl}
          anchorIconColor="#29375C"
        />
      }
    >
      <RefreshableScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      >
        <Lesson_Information
          isCompleted={isCompleted}
          onEvaluatePress={handleEvaluatePress}
          role="student"
          lessonData={lessonData}
          onRefresh={handleRefresh}
          refreshKey={refreshKey}
          currentUserId={currentUserId || undefined}
        />
      </RefreshableScrollView>
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
});

export default LessonDetailScreen;

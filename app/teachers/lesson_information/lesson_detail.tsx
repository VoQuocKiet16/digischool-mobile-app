import HeaderLayout from "@/components/layout/HeaderLayout";
import Lesson_Information from "@/components/lesson_detail/Lesson_Information";
import MenuDropdown from "@/components/MenuDropdown";
import ConfirmTeachedModal from "@/components/notifications_modal/ConfirmTeachedModal";
import PlusIcon from "@/components/PlusIcon";
import RefreshableScrollView from "@/components/RefreshableScrollView";
import { fonts, responsive, responsiveValues } from "@/utils/responsive";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {
    completeLesson,
    deleteLessonDescription,
    getLessonDetail,
    updateLessonDescription,
} from "../../../services/schedule.service";
import { LessonData, TeacherLeaveRequest } from "../../../types/lesson.types";
import { getLessonSubtitle } from "../../../utils/lessonSubtitle";

const LessonDetailScreen = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [shouldAddDescription, setShouldAddDescription] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<{
    type: "substitute" | "swap" | "makeup" | null;
    statusText: string;
  } | null>(null);
  const isFocused = useIsFocused();
  const pollingRef = useRef<NodeJS.Timeout | number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Kiểm tra có được approved nghỉ phép không
  const hasApprovedLeaveRequest = () => {
    return lessonData?.teacherLeaveRequests?.some((request: TeacherLeaveRequest) => 
      request.status === "approved"
    );
  };

  const hasPendingLeaveRequest = () => {
    return lessonData?.teacherLeaveRequests?.some((request: TeacherLeaveRequest) => 
      request.status === "pending"
    );
  };

  // Xác định xem user hiện tại có phải giáo viên chính (bị hạn chế quyền) không
  // Theo logic: substituteTeacher = giáo viên chính ban đầu (chỉ xem), teacher = giáo viên dạy thay hiện tại (đầy đủ quyền)
  const isOriginalTeacher = () => {
    if (!lessonData?.substituteTeacher || !currentUserId) return false;
    return lessonData.substituteTeacher._id === currentUserId;
  };

  // Menu items cho lesson detail
  const lessonMenuItems = [
    // Ẩn dạy thay, đổi tiết, dạy bù cho giáo viên chính (bị hạn chế quyền)
    ...(!isOriginalTeacher() ? [
      {
        id: 'substitute',
        title: 'Dạy thay',
        onPress: () => {
          if (pendingRequest || lessonData?.status === "completed" || hasApprovedLeaveRequest() || hasPendingLeaveRequest()) return;
          router.push({
            pathname: "/teachers/lesson_request/substitute_request",
            params: { lessonId: lessonId },
          });
        },
        disabled: !!pendingRequest || lessonData?.status === "completed" || hasApprovedLeaveRequest() || hasPendingLeaveRequest(),
      },
      {
        id: 'swap',
        title: 'Đổi tiết',
        onPress: () => {
          if (pendingRequest || lessonData?.status === "completed" || hasApprovedLeaveRequest() || hasPendingLeaveRequest()) return;
          router.push({
            pathname: "/teachers/lesson_request/swap_schedule",
            params: {
              lessonId: lessonId,
              className: lessonData?.class?.className,
              lessonFrom: JSON.stringify(lessonData),
              lessonDate: lessonData?.scheduledDate,
              lessonYear: lessonData?.academicYear?.name || "2025-2026",
            },
          });
        },
        disabled: !!pendingRequest || lessonData?.status === "completed" || hasApprovedLeaveRequest() || hasPendingLeaveRequest(),
      },
      {
        id: 'makeup',
        title: 'Dạy bù',
        onPress: () => {
          if (pendingRequest || lessonData?.status === "completed" || hasApprovedLeaveRequest() || hasPendingLeaveRequest()) return;
          router.push({
            pathname: "/teachers/lesson_request/makeup_schedule",
            params: {
              lessonId: lessonId,
              className: lessonData?.class?.className,
              lessonDate: lessonData?.scheduledDate,
              lessonYear: lessonData?.academicYear?.name || "2025-2026",
            },
          });
        },
        disabled: !!pendingRequest || lessonData?.status === "completed" || hasApprovedLeaveRequest() || hasPendingLeaveRequest(),
      },
    ] : []),
    {
      id: 'note',
      title: 'Ghi chú',
      onPress: () => {
        router.push({
          pathname: "/note/note",
          params: {
            lessonId: lessonId,
            lessonData: JSON.stringify(lessonData),
          },
        });
      },
    },
  ];

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

  // Refresh lesson data khi quay về từ trang khác
  useFocusEffect(
    React.useCallback(() => {
      if (lessonId) {
        fetchLessonDetail();
      }
    }, [lessonId])
  );

  // Alternative: Refresh when screen becomes focused
  useEffect(() => {
    if (isFocused && lessonId && lessonData) {
      fetchLessonDetail();
    }
  }, [isFocused, lessonId]);

  useEffect(() => {
    if (lessonData) {
      // Kiểm tra substitute requests với logic 2 giai đoạn
      const substituteRequest = lessonData.substituteRequests?.find((r: any) => r.status === "pending");
      if (substituteRequest) {
        let statusText = "Đang chờ giáo viên phê duyệt";
        if (substituteRequest.teacherApproved && !substituteRequest.managerApproved) {
          statusText = "Giáo viên đã phê duyệt, đang chờ quản lý";
        }
        setPendingRequest({
          type: "substitute",
          statusText,
        });
        return;
      }

      // Kiểm tra swap requests với logic 2 giai đoạn  
      const swapRequest = lessonData.swapRequests?.find((r: any) => r.status === "pending");
      if (swapRequest) {
        let statusText = "Đang chờ giáo viên phê duyệt";
        if (swapRequest.teacherApproved && !swapRequest.managerApproved) {
          statusText = "Giáo viên đã phê duyệt, đang chờ quản lý";
        }
        setPendingRequest({
          type: "swap",
          statusText,
        });
        return;
      }

      // Kiểm tra makeup requests (không đổi)
      if (lessonData.makeupRequests?.some((r: any) => r.status === "pending")) {
        setPendingRequest({
          type: "makeup",
          statusText: "Đang chờ quản lý phê duyệt",
        });
        return;
      }

      setPendingRequest(null);
    }
  }, [lessonData]);

  const fetchLessonDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLessonDetail(lessonId);
      setLessonData(data);
      // Kiểm tra status để set isCompleted
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

  const handleRefresh = () => {
    fetchLessonDetail();
    setRefreshKey((k) => k + 1);
  };

  const handleUpdateDescription = async (description: string) => {
    try {
      await updateLessonDescription(lessonId, description);
      // Cập nhật local state thay vì load lại trang
      if (lessonData) {
        setLessonData({
          ...lessonData,
          description: description,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteDescription = async () => {
    try {
      await deleteLessonDescription(lessonId);
      // Cập nhật local state thay vì load lại trang
      if (lessonData) {
        setLessonData({
          ...lessonData,
          description: "",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCompletePress = () => setShowModal(true);
  const handleConfirmComplete = async () => {
    try {
      await completeLesson(lessonId);

      // Cập nhật local state thay vì load lại trang
      if (lessonData) {
        setLessonData({
          ...lessonData,
          status: "completed",
        });
      }
      setIsCompleted(true);
      setShowModal(false);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        `Không thể hoàn thành tiết học: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  const handleEvaluatePress = () => {
    router.push({
      pathname: "/teachers/lesson_information/lesson_evaluate",
      params: { 
        lessonId: lessonData?._id,
        lessonData: JSON.stringify(lessonData)
      },
    });
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
          items={lessonMenuItems}
          anchorText=""
          anchorIcon="menu"
          anchorIconSize={responsiveValues.iconSize.xxxxl}
          anchorIconColor="#29375C"
          anchorStyle={{ padding: 8 }}
        />
      }
    >
      <RefreshableScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        onRefresh={fetchLessonDetail}
      >
        <Lesson_Information
          isCompleted={isCompleted}
          onCompletePress={handleCompletePress}
          onEvaluatePress={handleEvaluatePress}
          role="teacher"
          lessonData={lessonData}
          onUpdateDescription={handleUpdateDescription}
          onDeleteDescription={handleDeleteDescription}
          shouldAddDescription={shouldAddDescription}
          onAddDescriptionComplete={() => setShouldAddDescription(false)}
          pendingRequest={pendingRequest}
          onRefresh={handleRefresh}
          refreshKey={refreshKey}
          currentUserId={currentUserId || undefined}
        />
        <View style={{ marginHorizontal: 30, marginTop: 0, marginBottom: 12 }}>
          {!lessonData?.description && lessonData?.status !== "completed" && !hasApprovedLeaveRequest() && !isOriginalTeacher() && (
            <View style={{ marginBottom: 12 }}>
              <PlusIcon
                text="Thêm mô tả"
                onPress={() => {
                  setShouldAddDescription(true);
                }}
              />
            </View>
          )}
          {!lessonData?.testInfo && lessonData?.status !== "completed" && !hasApprovedLeaveRequest() && !isOriginalTeacher() && (
            <PlusIcon
              text="Dặn dò kiểm tra"
              onPress={() =>
                router.push({
                  pathname: "/teachers/test_information/test_information",
                  params: {
                    lessonId: lessonId,
                    subtitle: getLessonSubtitle(lessonData),
                  },
                })
              }
            />
          )}
        </View>
      </RefreshableScrollView>
      <ConfirmTeachedModal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirmComplete}
        title="Hoàn thành tiết học"
        message={`Xác nhận rằng \n bạn đã hoàn thành tiết học này?`}
        confirmText="Xác nhận"
        cancelText="Bỏ qua"
        icon="check-circle"
        iconColor="#fff"
        iconBgColor="#29375C"
      />
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: responsive.height(11),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: responsiveValues.padding.md,
    fontSize: responsiveValues.fontSize.md,
    color: "#666",
    fontFamily: fonts.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveValues.padding.lg,
  },
  errorText: {
    fontSize: responsiveValues.fontSize.md,
    color: "#F04438",
    textAlign: "center",
    marginBottom: responsiveValues.padding.lg,
  },
  retryButton: {
    backgroundColor: "#3A546D",
    paddingHorizontal: responsiveValues.padding.lg,
    paddingVertical: responsiveValues.padding.sm,
    borderRadius: responsiveValues.borderRadius.md,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.md,
    fontWeight: "500",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  menuBox: {
    backgroundColor: "#29375C",
    borderRadius: responsiveValues.borderRadius.md,
    padding: responsiveValues.padding.sm,
    minWidth: 110, // Đặt cứng để đồng bộ với logic left
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    // position, top, left sẽ được set động
  },
  menuItem: {
    paddingVertical: responsiveValues.padding.sm,
    paddingHorizontal: responsiveValues.padding.md,
    borderRadius: responsiveValues.borderRadius.md,
    marginTop: responsiveValues.padding.xs,
  },
  menuText: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.md,
    fontWeight: "500",
    opacity: 0.7,
  },
  menuTextActive: {
    color: "#29375C",
    fontWeight: "bold",
  },
});

export default LessonDetailScreen;

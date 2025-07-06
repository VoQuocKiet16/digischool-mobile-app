import HeaderLayout from "@/components/layout/HeaderLayout";
import Lesson_Information from "@/components/lesson_detail/Lesson_Information";
import ConfirmTeachedModal from "@/components/notifications_modal/ConfirmTeachedModal";
import PlusIcon from "@/components/PlusIcon";
import RefreshableScrollView from "@/components/RefreshableScrollView";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
<<<<<<< khoi-api
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
=======
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
>>>>>>> local
} from "react-native";
import { getLessonDetail } from "../../../services/schedule.service";
const LessonDetailScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const [showDescriptionCard, setShowDescriptionCard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (lessonId) {
      fetchLessonDetail();
    }
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
    if (lessonData?.notes || lessonData?.description) {
      const descriptionText = lessonData?.notes || lessonData?.description;
      setDescValue(descriptionText);
      setShowDescriptionCard(true);
    } else {
      setDescValue("");
      setShowDescriptionCard(false);
    }
  }, [lessonData]);

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

  const handleCompletePress = () => setShowModal(true);
  const handleConfirmComplete = () => {
    setIsCompleted(true);
    setShowModal(false);
  };
  const handleEvaluatePress = () => {
    router.push("/teachers/lesson_information/lesson_evaluate");
  };

  const handleDoneEditDesc = () => {
    setIsEditingDesc(false);
  };

  const handleEditTestInfo = () => {
    router.push({
      pathname: "/teachers/test_information/test_information",
      params: {
        subtitle: getSubtitle(),
        lessonId: lessonId || "",
        isEditing: "true",
        testInfo: JSON.stringify(lessonData?.testInfo),
      },
    });
  };

  // Tạo subtitle từ dữ liệu lesson
  const getSubtitle = () => {
    if (!lessonData) return "Đang tải thông tin tiết học...";

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
          <Ionicons name="menu" size={24} color="#25345D" />
        </TouchableOpacity>
      }
    >
      <RefreshableScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchLessonDetail}
      >
        <Lesson_Information
          isCompleted={isCompleted}
          onCompletePress={handleCompletePress}
          onEvaluatePress={handleEvaluatePress}
          role="teacher"
          lessonData={lessonData}
          isEditingDescription={isEditingDesc}
          descriptionValue={descValue}
          onDescriptionChange={setDescValue}
          onEditDescription={() => setIsEditingDesc(true)}
          onDoneEditDescription={handleDoneEditDesc}
          showDescriptionCard={showDescriptionCard}
          setShowDescriptionCard={setShowDescriptionCard}
          testInfo={lessonData?.testInfo}
          onEditTestInfo={handleEditTestInfo}
          lessonId={lessonId}
        />
<<<<<<< khoi-api
        <View style={{ marginHorizontal: 16, marginTop: 0, marginBottom: 12 }}>
          <PlusIcon
            text="Dặn dò kiểm tra cho tiết học này"
            onPress={() => router.push("/teachers/add_exam_reminder/add_exam_reminder")}
          />
        </View>
      </ScrollView>
      <Modal
        visible={showModal}
        transparent
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={40}
                color="#22315B"
              />
            </View>
            <Text style={styles.modalTitle}>Hoàn thành tiết học</Text>
            <Text style={styles.modalDesc}>
              Xác nhận rằng{"\n"}bạn đã hoàn thành tiết học này?
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnOutline}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={handleConfirmComplete}
              >
                <Text style={styles.modalBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
=======
        {!showDescriptionCard && (
          <View
            style={{ marginHorizontal: 16, marginTop: 0, marginBottom: 12 }}
          >
            <PlusIcon
              text="Thêm mô tả"
              onPress={() => {
                setShowDescriptionCard(true);
                setIsEditingDesc(true);
                setDescValue("");
              }}
            />
>>>>>>> local
          </View>
        )}
        {!lessonData?.testInfo && (
          <View
            style={{ marginHorizontal: 16, marginTop: 0, marginBottom: 12 }}
          >
            <PlusIcon
              text="Dặn dò kiểm tra cho tiết học này"
              onPress={() =>
                router.push({
                  pathname: "/teachers/test_information/test_information",
                  params: {
                    subtitle: getSubtitle(),
                    lessonId: lessonId || "",
                  },
                })
              }
            />
          </View>
        )}
      </RefreshableScrollView>
      <ConfirmTeachedModal
        visible={showModal}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowModal(false)}
        title="Hoàn thành tiết học"
        message={`Xác nhận rằng \n bạn đã hoàn thành tiết học này?`}
        confirmText="Xác nhận"
        cancelText="Bỏ qua"
        icon="check-circle"
        iconColor="#fff"
        iconBgColor="#29375C"
      />
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={() => {
                setMenuVisible(false);
                router.push("/teachers/substitute_request/substitute_request");
              }}
            >
              <Text style={styles.menuText}>
                Dạy thay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname: "/teachers/substitute_lesson/substitute_lesson",
                });
              }}
            >
              <Text style={styles.menuText}>Đổi tiết</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname:
                    "/teachers/select_makeup_lesson/select_makeup_lesson",
                });
              }}
            >
              <Text style={styles.menuText}>Dạy bù</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({ pathname: '/note/note' });
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
    padding: 8,
    minWidth: 120,
    marginTop: 0,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#7D88A7",
    marginTop: 5,
  },
  menuItemActive: {
    backgroundColor: "#A0A3BD",
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.7,
  },
  menuTextActive: {
    color: "#22315B",
    fontWeight: "bold",
  },
<<<<<<< khoi-api
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalIconWrap: {
    backgroundColor: "#E5E7EB",
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22315B",
    marginBottom: 8,
    marginTop: 2,
  },
  modalDesc: {
    color: "#22315B",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  modalBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#A0A3BD",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  modalBtnOutlineText: {
    color: "#22315B",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#A0A3BD",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
=======
>>>>>>> local
});

export default LessonDetailScreen;

import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import SuccessModal from "../../../components/notifications_modal/SuccessModal";
import { createSwapLessonRequest } from "../../../services/lesson_request.service";

export default function ConfirmSwap() {
  const params = useLocalSearchParams();
  console.log("params:", params);
  const lessonFrom = params.lessonFrom ? JSON.parse(params.lessonFrom as string) : null;
  console.log("lessonFrom (confirm):", lessonFrom);
  const lessonTo = params.lessonTo ? JSON.parse(params.lessonTo as string) : null;
  // Log lessonTo để kiểm tra type khi bị lỗi hiển thị
  console.log('lessonTo:', lessonTo, 'type:', lessonTo?.type);
  const [reason, setReason] = useState("");
  const teacher = lessonTo?.teacherName || "Không rõ";
  const [showSuccess, setShowSuccess] = useState(false);
  const isValid = reason.trim().length > 0;

  // Hàm format thông tin lesson
  const formatLesson = (lesson: any) => {
    if (!lesson) return "";
    const period = lesson.period || lesson.timeSlot?.period || "";
    const subject =
      lesson.subject?.name ||
      lesson.text ||
      lesson.fixedInfo?.description ||
      "";
    const date = lesson.scheduledDate
      ? lesson.scheduledDate.slice(0, 10)
      : "";
    return `${date ? date + " • " : ""}Tiết ${period} • ${subject}`;
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await createSwapLessonRequest({
        originalLessonId: lessonFrom?.lessonId,
        replacementLessonId: lessonTo?.lessonId,
        reason,
      });
      setShowSuccess(true);
    } catch (e: any) {
      console.log('Lỗi gửi yêu cầu đổi tiết:', e);
      alert(e?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <HeaderLayout
      title="Xác nhận đổi tiết"
      subtitle="Xác nhận lại thông tin đổi tiết"
      onBack={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Tiết học cần đổi</Text>
          <Text style={styles.inputTextOutline}>{formatLesson(lessonFrom)}</Text>
        </View>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Tiết học thay thế</Text>
          <Text style={styles.inputTextOutline}>{formatLesson(lessonTo)}</Text>
        </View>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Giáo viên tiết học thay thế</Text>
          <Text style={styles.inputTextOutline}>{teacher}</Text>
        </View>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Lý do</Text>
          <TextInput
            style={styles.inputTextOutline}
            placeholder="Vui lòng nhập lý do yêu cầu đổi tiết"
            value={reason}
            onChangeText={setReason}
            placeholderTextColor="#A0A3BD"
          />
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          disabled={!isValid}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
        <SuccessModal
          visible={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            router.replace("/");
          }}
          title="Thành công"
          message={"Gửi yêu cầu đổi tiết thành công.\nQuay lại trang trước đó?"}
          buttonText="Xác nhận"
        />
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  outlineInputBox: {
    borderWidth: 1.2,
    borderColor: "#B6C5E1",
    borderRadius: 8,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginTop: 8,
    marginBottom: 16,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    fontSize: 15,
    color: "#25345D",
    fontWeight: "bold",
    zIndex: 2,
  },
  inputTextOutline: {
    fontSize: 15,
    color: "#25345D",
    fontWeight: "bold",
    paddingVertical: 0,
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: "#29375C",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    opacity: 1,
  },
  submitBtnDisabled: {
    backgroundColor: "#A0A3BD",
    opacity: 0.7,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1,
  },
});

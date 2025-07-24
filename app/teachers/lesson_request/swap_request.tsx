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
import LoadingModal from "../../../components/LoadingModal";
import { createSwapLessonRequest } from "../../../services/lesson_request.service";

export default function SwapRequest() {
  const params = useLocalSearchParams();
  const lessonFrom = params.lessonFrom
    ? JSON.parse(params.lessonFrom as string)
    : null;
  const lessonTo = params.lessonTo
    ? JSON.parse(params.lessonTo as string)
    : null;
  const [reason, setReason] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const isValid = reason.trim().length > 0;

  // Hàm format thông tin lesson
  const formatLesson = (lesson: any) => {
    if (!lesson) return "";
    const period = lesson.period || lesson.timeSlot?.period || "";
    const subject =
      lesson.subject?.subjectName ||
      lesson.text ||
      lesson.fixedInfo?.description ||
      "";
    const date = lesson.scheduledDate ? lesson.scheduledDate.slice(0, 10) : "";
    return `${date ? date + " • " : ""}Tiết ${period} • ${subject}`;
  };

  const teacher = lessonTo?.teacherName || "Không rõ";

  const handleSubmit = async () => {
    if (!isValid) return;
    setShowLoading(true);
    setLoadingSuccess(false);
    try {
      await createSwapLessonRequest({
        originalLessonId: lessonFrom?._id,
        replacementLessonId: lessonTo?._id,
        reason,
      });
      setLoadingSuccess(true);
      setTimeout(() => {
        setShowLoading(false);
        setLoadingSuccess(false);
        router.back();
      }, 1000);
    } catch (e: any) {
      setShowLoading(false);
      setLoadingSuccess(false);
      console.log("Lỗi tạo yêu cầu đổi tiết:", e, e?.response?.data);
      alert(
        e?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!"
      );
    }
  };

  return (
    <HeaderLayout
      title="Xác nhận đổi tiết"
      subtitle="Xác nhận lại thông tin đổi tiết"
      onBack={() => {
        router.back();
      }}
    >
      <View style={styles.container}>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Tiết học cần đổi</Text>
          <Text style={styles.inputTextOutline}>
            {formatLesson(lessonFrom)}
          </Text>
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
          <Text style={styles.floatingLabel}>
            Lý do <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.inputTextOutline}
            placeholder="Vui lòng nhập lý do yêu cầu đổi tiết"
            value={reason}
            onChangeText={setReason}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !isValid && styles.sendBtnDisabled]}
          disabled={!isValid}
          onPress={handleSubmit}
        >
          <Text style={styles.sendBtnText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
        <LoadingModal
          visible={showLoading}
          text={loadingSuccess ? "Gửi thành công" : "Đang gửi yêu cầu..."}
          success={loadingSuccess}
        />
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 20,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 25,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
    zIndex: 2,
  },
  inputTextOutline: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  sendBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
    opacity: 1,
  },
  sendBtnDisabled: {
    backgroundColor: "#D1D5DB",
    opacity: 1,
  },
  sendBtnText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
});

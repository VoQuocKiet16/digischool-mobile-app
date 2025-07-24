import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import LoadingModal from "../../../components/LoadingModal";
import { createTeacherLeaveRequest } from "../../../services/leave_request.service";

export default function TeacherLeaveRequestInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse dữ liệu truyền từ trang trước
  const selectedSlots = params.selectedSlots
    ? JSON.parse(params.selectedSlots as string)
    : [];
  const days = params.days
    ? JSON.parse(params.days as string)
    : ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const subjects = params.subjects ? JSON.parse(params.subjects as string) : [];
  const lessonIds = params.lessonIds
    ? JSON.parse(params.lessonIds as string)
    : [];

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);

  // Hiển thị danh sách tiết xin nghỉ
  const lessons = selectedSlots.map((slot: any, idx: number) => ({
    day: days[slot.col],
    period: slot.row + 1,
    subject: subjects[idx] || "",
  }));

  const handleNext = () => {
    if (reason.trim()) {
      setStep("confirm");
    }
  };

  const handleSubmit = async () => {
    setShowLoading(true);
    setLoadingSuccess(false);
    setError("");
    try {
      await createTeacherLeaveRequest({ lessonIds, reason });
      setLoadingSuccess(true);
      setTimeout(() => {
        setShowLoading(false);
        setLoadingSuccess(false);
        router.push("/");
      }, 1200);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gửi yêu cầu thất bại");
      setShowLoading(false);
    }
  };

  return (
    <HeaderLayout
      title={
        step === "form" ? "Thông tin xin nghỉ dạy" : "Xác nhận xin nghỉ dạy"
      }
      subtitle={
        step === "form"
          ? "Hoàn thành mẫu thông tin xin nghỉ dạy"
          : "Xác nhận lại các tiết dạy xin nghỉ"
      }
      onBack={() => (step === "form" ? router.back() : setStep("form"))}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {step === "form" ? (
            <View style={{ padding: 20 }}>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>
                  Lý do xin nghỉ dạy <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.confirmInput}
                  placeholder="Vui lòng nhập lý do xin nghỉ dạy"
                  placeholderTextColor="#9CA3AF"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <TouchableOpacity
                style={[styles.button, !reason.trim() && styles.buttonDisabled]}
                disabled={!reason.trim()}
                onPress={handleNext}
              >
                <Text
                  style={[
                    styles.buttonText,
                    !reason.trim() && styles.buttonTextDisabled,
                  ]}
                >
                  Tiếp tục
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingRight: 30, paddingLeft: 30, paddingTop: 10 }}>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderBar} />
                  <Text style={styles.cardTitle}>Tiết dạy xin nghỉ</Text>
                  <View style={{ flex: 1 }} />
                </View>
                {lessons.map(
                  (
                    lesson: { day: string; period: number; subject: string },
                    idx: number
                  ) => (
                    <View key={idx} style={styles.lessonTagCard}>
                      <Text
                        style={styles.lessonTagTextCard}
                      >{`${lesson.day} - Tiết ${lesson.period} - ${lesson.subject}`}</Text>
                    </View>
                  )
                )}
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Lý do xin nghỉ dạy</Text>
                <Text style={styles.confirmInput}>{reason}</Text>
              </View>
              {error ? (
                <Text
                  style={{ color: "red", textAlign: "center", marginBottom: 8 }}
                >
                  {error}
                </Text>
              ) : null}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <LoadingModal
          visible={showLoading}
          text={loadingSuccess ? "Thành công" : "Đang gửi yêu cầu..."}
          success={loadingSuccess}
        />
      </SafeAreaView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#29375C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
    marginRight: 10,
    marginLeft: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardHeaderBar: {
    width: 4,
    height: 48,
    backgroundColor: "#F9A825",
    borderRadius: 2,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 25,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    flexShrink: 0,
  },
  lessonTagCard: {
    backgroundColor: "#FFD6B0",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    alignSelf: "center",
    marginBottom: 8,
  },
  lessonTagTextCard: {
    color: "#29375C",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Baloo2-SemiBold",
  },
  button: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
  },
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  confirmInputBox: {
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
  confirmLabel: {
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
  confirmInput: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
});

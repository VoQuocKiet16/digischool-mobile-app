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
import SuccessModal from "../../../components/notifications_modal/SuccessModal";

export default function LeaveRequestInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse dữ liệu truyền từ trang trước
  const selectedSlots = params.selectedSlots
    ? JSON.parse(params.selectedSlots as string)
    : [];
  const periods = params.periods
    ? JSON.parse(params.periods as string)
    : ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
  const days = params.days
    ? JSON.parse(params.days as string)
    : ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const subjects = params.subjects ? JSON.parse(params.subjects as string) : [];

  // State nhập liệu
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [error, setError] = useState("");

  // Xác nhận lại thông tin tiết học xin nghỉ
  const selectedLessons = selectedSlots.map(
    ({ row, col }: { row: number; col: number }) => ({
      subject: periods[row],
      day: days[col],
    })
  );

  // Lấy ngày và tiết duy nhất (giả sử chỉ chọn 1 ngày)
  const uniqueDay = selectedLessons.length > 0 ? selectedLessons[0].day : "";

  // Xử lý tiếp tục
  const handleNext = () => {
    if (phone.trim() && reason.trim()) {
      setStep("confirm");
    }
  };

  const handleSubmit = async () => {
    setShowLoading(true);
    setLoadingSuccess(false);
    setError("");
    try {
      const res = await createLeaveRequest({
        lessonIds,
        phoneNumber: phone,
        reason,
      });
      if (res && res.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          router.push("/(tabs)");
        }, 1000);
      } else {
        setError("Gửi yêu cầu thất bại!");
        setShowLoading(false);
      }
    } catch (e) {
      setError("Gửi yêu cầu thất bại!");
      setShowLoading(false);
    }
  };

  return (
    <HeaderLayout
      title={step === "form" ? "Thông tin nghỉ phép" : "Xác nhận thông tin"}
      subtitle={
        step === "form"
          ? "Hoàn thành mẫu thông tin xin nghỉ"
          : "Xác nhận lại thông tin xin nghỉ"
      }
      onBack={() => (step === "form" ? router.back() : setStep("form"))}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {step === "form" ? (
            <View style={{ padding: 20 }}>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Số điện thoại xác nhận</Text>
                <TextInput
                  style={styles.confirmInput}
                  placeholder="Vui lòng nhập SĐT xác nhận nghỉ phép"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Lý do xin nghỉ</Text>
                <TextInput
                  style={styles.confirmInput}
                  placeholder="Vui lòng nhập lý do yêu cầu xin nghỉ"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  (!phone.trim() || !reason.trim()) && styles.buttonDisabled,
                ]}
                disabled={!phone.trim() || !reason.trim()}
                onPress={handleNext}
              >
                <Text
                  style={[
                    styles.buttonText,
                    (!phone.trim() || !reason.trim()) &&
                      styles.buttonTextDisabled,
                  ]}
                >
                  Tiếp tục
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 20 }}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Tiết học xin nghỉ</Text>
                <Text style={styles.cardDate}>{uniqueDay} - 16/6/2025</Text>
                {selectedSlots.map((slot: any, idx: number) => (
                  <View key={idx} style={styles.lessonTag}>
                    <Text style={styles.lessonTagText}>{subjects[idx]}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Số điện thoại xác nhận</Text>
                <Text style={styles.confirmInput}>{phone}</Text>
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Lý do xin nghỉ</Text>
                <Text style={styles.confirmInput}>{reason}</Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Gửi yêu cầu</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <SuccessModal
          visible={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            router.back();
          }}
          title="Thành công"
          message={"Gửi yêu cầu xin nghỉ thành công!"}
          buttonText="Xác nhận"
        />
      </SafeAreaView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 15,
    color: "#22315B",
    textAlign: "center",
    marginBottom: 18,
  },
  inputBox: { marginBottom: 18 },
  label: { color: "#22315B", fontWeight: "bold", marginBottom: 6 },
  input: {
    borderWidth: 1.2,
    borderColor: "#B6C5E1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#22315B",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#22315B",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  buttonTextDisabled: { color: "#9CA3AF" },
  card: {
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22315B",
    marginBottom: 6,
  },
  cardDate: { color: "#22315B", marginBottom: 10 },
  lessonTag: {
    backgroundColor: "#FFD6B0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  lessonTagText: {
    color: "#22315B",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  confirmInputBox: {
    borderWidth: 2,
    borderColor: "#22315B",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    position: "relative",
  },
  confirmLabel: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    color: "#22315B",
    fontWeight: "bold",
    fontSize: 12,
    zIndex: 2,
  },
  confirmInput: {
    color: "#22315B",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
  },
});

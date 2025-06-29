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

export default function ConfirmMakeupLesson() {
  const [reason, setReason] = useState("");
  const [className, setClassName] = useState("10A3");
  const [showSuccess, setShowSuccess] = useState(false);
  const isValid = reason.trim().length > 0;

  // Dữ liệu mẫu, thực tế sẽ truyền từ trang trước
  const lessonNeedMakeup = "Sáng → Thứ 3 (13/6/2025) → Tiết 3 → Hóa học";
  const lessonMakeup = "Sáng → Thứ 6 (16/6/2025) → Tiết 5 → Trống";

  const handleSubmit = () => {
    if (isValid) {
      setShowSuccess(true);
    }
  };

  return (
    <HeaderLayout
      title="Xác nhận dạy bù"
      subtitle="Xác nhận lại thông tin dạy bù"
      onBack={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Tiết học cần bù</Text>
          <Text style={styles.inputTextOutline}>{lessonNeedMakeup}</Text>
        </View>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Tiết học sẽ dạy bù</Text>
          <Text style={styles.inputTextOutline}>{lessonMakeup}</Text>
        </View>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Lớp dạy bù</Text>
          <Text style={styles.inputTextOutline}>{className}</Text>
        </View>
        <View style={styles.outlineInputBox}>
          <Text style={styles.floatingLabel}>Lý do</Text>
          <TextInput
            style={styles.inputTextOutline}
            placeholder="Vui lòng nhập lý do yêu cầu dạy bù"
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
            // Quay lại trang trước hoặc trang chính
          }}
          title="Thành công"
          message={"Gửi yêu cầu dạy bù thành công.\nQuay lại trang trước đó?"}
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
    backgroundColor: "#22315B",
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

import { router } from "expo-router";
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

const TEACHERS = [
  "Thầy/Cô Nguyen Van C",
  "Thầy/Cô Nguyen Van D",
  "Thầy/Cô Nguyen Van F",
];

export default function SubstituteRequest() {
  const [reason, setReason] = useState("");
  const [teacher, setTeacher] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isValid = reason.trim() && teacher.trim();

  const handleSend = () => {
    if (isValid) {
      setShowSuccess(true);
    }
  };

  return (
    <HeaderLayout
      title="Yêu cầu dạy thay"
      subtitle="Hoàn thành mẫu yêu cầu dạy thay"
      onBack={() => router.replace("/")}
    >
      <View style={styles.container}>
        {/* Lý do */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>Lý do</Text>
            <TextInput
              style={styles.inputTextOutline}
              value={reason}
              onChangeText={setReason}
              placeholder="Vui lòng nhập lý do yêu cầu dạy thay"
              placeholderTextColor="#B6B6B6"
            />
          </View>
        </View>
        {/* Giáo viên thay thế */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Giáo viên thay thế <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.8}
            >
              <Text
                style={
                  teacher ? styles.dropdownText : styles.dropdownPlaceholder
                }
              >
                {teacher || "Chọn giáo viên thay thế"}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.modalContent}>
                {TEACHERS.map((t, idx) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.modalItem}
                    onPress={() => {
                      setTeacher(t);
                      setShowDropdown(false);
                    }}
                  >
                    <View style={styles.teacherRow}>
                      <Text style={styles.modalItemText}>{t}</Text>
                      {idx === 0 && (
                        <Text style={styles.suggestionTag}>Gợi ý chọn</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        {/* Nút gửi yêu cầu */}
        <TouchableOpacity
          style={[styles.sendBtn, !isValid && styles.sendBtnDisabled]}
          disabled={!isValid}
          onPress={handleSend}
        >
          <Text style={styles.sendBtnText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
        <SuccessModal
          visible={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            router.replace("/");
          }}
          title="Thành công"
          message={"Gửi yêu cầu dạy thay thành công.\nQuay lại trang trước đó?"}
          buttonText="Xác nhận"
        />
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
  },
  fieldWrap: {
    marginBottom: 16,
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
  },
  required: {
    color: "#E53935",
    fontSize: 16,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    borderRadius: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 22,
    marginTop: 18,
  },
  dropdownText: {
    color: "#25345D",
    fontSize: 15,
    fontWeight: "bold",
  },
  dropdownPlaceholder: {
    color: "#B6B6B6",
    fontSize: 15,
    fontWeight: "normal",
  },
  dropdownIcon: {
    color: "#A0A3BD",
    fontSize: 16,
    marginLeft: 8,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    minWidth: 220,
    elevation: 5,
    borderWidth: 1.2,
    borderColor: "#B6C5E1",
    marginTop: 4,
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#25345D",
  },
  sendBtn: {
    backgroundColor: "#22315B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    opacity: 1,
  },
  sendBtnDisabled: {
    backgroundColor: "#B6B6B6",
    opacity: 0.5,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1,
  },
  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestionTag: {
    fontSize: 12,
    color: "#22315B",
    marginLeft: 8,
    fontWeight: "500",
  },
});

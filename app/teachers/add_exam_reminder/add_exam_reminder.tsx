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

const EXAM_TYPES = ["Kiểm tra 15'", "Kiểm tra 1 tiết"];

const AddExamReminder = () => {
  const [examType, setExamType] = useState("");
  const [examTypeModal, setExamTypeModal] = useState(false);
  const [examContent, setExamContent] = useState("");
  const [reminder, setReminder] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const isValid = examType.trim() && examContent.trim();

  const handleSave = () => {
    if (isValid) {
      // TODO: Gọi API lưu dặn dò kiểm tra
      setShowSuccess(true);
    }
  };

  return (
    <HeaderLayout
      title="Dặn dò kiểm tra"
      subtitle="Tạo thông tin kiểm tra"
      onBack={() => {
        router.replace("/explore");
      }}
      style={{ fontSize: 20, fontWeight: "bold" }}
    >
      <View style={styles.container}>
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Kiểm tra <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setExamTypeModal(!examTypeModal)}
              activeOpacity={0.8}
            >
              <Text
                style={
                  examType ? styles.dropdownText : styles.dropdownPlaceholder
                }
              >
                {examType || "Chọn loại kiểm tra"}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            {examTypeModal && (
              <View style={styles.modalContent}>
                {EXAM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalItem}
                    onPress={() => {
                      setExamType(type);
                      setExamTypeModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Bài kiểm tra <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.inputTextOutline}
              value={examContent}
              onChangeText={setExamContent}
              placeholder=" "
              placeholderTextColor="#B6B6B6"
            />
          </View>
        </View>
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>Nhắc nhở</Text>
            <TextInput
              style={styles.inputTextOutline}
              value={reminder}
              onChangeText={setReminder}
              placeholder=" "
              placeholderTextColor="#B6B6B6"
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          disabled={!isValid}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Lưu</Text>
        </TouchableOpacity>
        <SuccessModal
          visible={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            router.replace("/explore");
          }}
          title="Thành công"
          message={
            "Tạo thông tin kiểm tra thành công.\nQuay lại trang trước đó?"
          }
          buttonText="Xác nhận"
        />
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
  },
  infoText: {
    color: "#25345D",
    fontWeight: "500",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    minWidth: 220,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#25345D",
  },
  saveBtn: {
    backgroundColor: "#25345D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    opacity: 1,
  },
  saveBtnDisabled: {
    backgroundColor: "#B6B6B6",
    opacity: 0.5,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default AddExamReminder;

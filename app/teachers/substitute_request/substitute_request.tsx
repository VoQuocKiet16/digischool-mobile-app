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
import { createSubstituteRequest, getAvailableTeachers } from "../../../services/substitute_request";

const TEACHERS = [
  "Thầy/Cô Nguyen Van C",
  "Thầy/Cô Nguyen Van D",
  "Thầy/Cô Nguyen Van F",
];

export default function SubstituteRequest() {
  const { lessonId } = useLocalSearchParams();
  const lessonIdStr = Array.isArray(lessonId) ? lessonId[0] : lessonId;
  const [reason, setReason] = useState("");
  const [teacher, setTeacher] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [reasonError, setReasonError] = useState("");

  console.log('LessonId nhận được:', lessonIdStr);

  const isValid = reason.trim() && selectedTeacherId.trim();

  const handleSend = async () => {
    if (isValid && lessonIdStr) {
      try {
        console.log('Dữ liệu gửi đi:', {
          lessonId: lessonIdStr,
          candidateTeachers: [selectedTeacherId],
          reason,
        });
        await createSubstituteRequest({
          lessonId: lessonIdStr,
          candidateTeachers: [selectedTeacherId],
          reason,
        });
        setShowSuccess(true);
      } catch (e) {
        console.error('Lỗi gửi yêu cầu dạy thay:', e);
        alert("Gửi yêu cầu thất bại. Vui lòng thử lại!");
      }
    }
  };

  const handleOpenDropdown = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && teachers.length === 0 && lessonIdStr) {
      try {
        const data = await getAvailableTeachers(lessonIdStr);
        setTeachers(data);
      } catch (e) {
        // Xử lý lỗi nếu cần
      }
    }
  };

  const validateReason = (text: string) => {
    if (!text.trim()) {
      setReasonError("Lý do không được để trống");
    } else if (text.trim().length < 10) {
      setReasonError("Lý do phải từ 10 ký tự trở lên");
    } else if (text.trim().length > 1000) {
      setReasonError("Lý do không được vượt quá 1000 ký tự");
    } else {
      setReasonError("");
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
              onChangeText={text => {
                setReason(text);
                validateReason(text);
              }}
              placeholder="Vui lòng nhập lý do yêu cầu dạy thay"
              placeholderTextColor="#B6B6B6"
            />
          </View>
          {reasonError ? (
            <Text style={{ color: 'red', marginTop: 4, fontSize: 13 }}>{reasonError}</Text>
          ) : null}
        </View>
        {/* Giáo viên thay thế */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Giáo viên thay thế <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={handleOpenDropdown}
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
                {teachers.length === 0 ? (
                  <Text>Không có giáo viên phù hợp</Text>
                ) : (
                  teachers.map((t, idx) => (
                    <TouchableOpacity
                      key={t.id}
                      style={styles.modalItem}
                      onPress={() => {
                        setTeacher(t.name);
                        setSelectedTeacherId(t.id);
                        setShowDropdown(false);
                      }}
                    >
                      <View style={styles.teacherRow}>
                        <Text style={styles.modalItemText}>{t.name}</Text>
                        {!t.hasConflict && idx === 0 && (
                          <Text style={styles.suggestionTag}>Gợi ý chọn</Text>
                        )}
                        {t.hasConflict && (
                          <Text style={{ color: "red", fontSize: 12 }}>
                           Giáo viên đang có lịch dạy
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
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
    backgroundColor: "#29375C",
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
    color: "#29375C",
    marginLeft: 8,
    fontWeight: "500",
  },
});

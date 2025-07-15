import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import LoadingModal from "../../../components/LoadingModal";
// Đã bỏ SuccessModal
import {
  createSubstituteRequest,
  getAvailableTeachers,
} from "../../../services/lesson_request.service";

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
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  useEffect(() => {
    if (lessonIdStr) {
      (async () => {
        try {
          const data = await getAvailableTeachers(lessonIdStr);
          setTeachers(data.availableTeachers || []);
        } catch (e) {
          // Xử lý lỗi nếu cần
        }
      })();
    }
  }, [lessonIdStr]);

  const isValid = reason.trim() && selectedTeacherId.trim();

  const handleSend = async () => {
    if (isValid && lessonIdStr) {
      setIsUpdating(true);
      setShowLoading(true);
      setLoadingSuccess(false);
      try {
        console.log("Dữ liệu gửi đi:", {
          lessonId: lessonIdStr,
          candidateTeachers: [selectedTeacherId],
          reason,
        });
        await createSubstituteRequest({
          lessonId: lessonIdStr,
          candidateTeacherIds: [selectedTeacherId],
          reason,
        });
        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          setIsUpdating(false);
          router.back();
        }, 1000);
      } catch (e) {
        setShowLoading(false);
        setIsUpdating(false);
        console.error("Lỗi gửi yêu cầu dạy thay:", e);
      }
    }
  };

  const handleOpenDropdown = async () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <HeaderLayout
      title="Yêu cầu dạy thay"
      subtitle="Hoàn thành mẫu yêu cầu dạy thay"
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        {/* Lý do */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Lý do <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.inputTextOutline}
              value={reason}
              onChangeText={setReason}
              placeholder="Vui lòng nhập lý do yêu cầu dạy thay"
              placeholderTextColor="#9CA3AF"
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
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="#29375C"
              />
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
          style={[
            styles.sendBtn,
            (!isValid || isUpdating) && styles.sendBtnDisabled,
          ]}
          disabled={!isValid || isUpdating}
          onPress={handleSend}
        >
          <Text style={styles.sendBtnText}>
            {isUpdating ? "Đang gửi..." : "Gửi yêu cầu"}
          </Text>
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
    padding: 20,
  },
  fieldWrap: {
    marginBottom: 16,
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
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    minHeight: 22,
  },
  dropdownText: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  modalContent: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    borderWidth: 0,
    marginTop: 0,
  },
  modalItem: {
    paddingVertical: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#29375C",
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

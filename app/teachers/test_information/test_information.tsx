import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import LoadingModal from "../../../components/LoadingModal";
import ConfirmDeleteModal from "../../../components/notifications_modal/ConfirmDeleteModal";
import {
  createTestInfo,
  deleteTestInfo,
  TestInfo,
  updateTestInfo,
} from "../../../services/test_info.service";

const EXAM_TYPES = ["Kiểm tra 15'", "Kiểm tra 1 tiết"];

const AddExamReminder = () => {
  const [examType, setExamType] = useState("");
  const [examTypeModal, setExamTypeModal] = useState(false);
  const [examContent, setExamContent] = useState("");
  const [reminder, setReminder] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { subtitle, lessonId, isEditing, testInfo } = useLocalSearchParams<{
    subtitle: string;
    lessonId: string;
    isEditing?: string;
    testInfo?: string;
  }>();

  const isEditMode = isEditing === "true";
  const existingTestInfo: TestInfo | null = testInfo
    ? JSON.parse(testInfo)
    : null;

  const isValid = Boolean(examType.trim() && examContent.trim());

  // Animation values
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const arrowRotation = useRef(new Animated.Value(0)).current;

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && existingTestInfo && !dataLoaded) {
      const testTypeMap: { [key: string]: string } = {
        kiemtra15: "Kiểm tra 15'",
        kiemtra1tiet: "Kiểm tra 1 tiết",
      };
      setExamType(
        testTypeMap[existingTestInfo.testType] || existingTestInfo.testType
      );
      setExamContent(existingTestInfo.content);
      setReminder(existingTestInfo.reminder || "");
      setDataLoaded(true);
    }
  }, [isEditMode, existingTestInfo, dataLoaded]);

  // Animate dropdown when modal state changes
  useEffect(() => {
    if (examTypeModal) {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [examTypeModal]);

  const handleSave = async () => {
    if (isValid && lessonId) {
      setIsUpdating(true);
      setShowLoading(true);
      setLoadingSuccess(false);
      setError("");
      try {
        const testTypeMap = {
          "Kiểm tra 15'": "kiemtra15",
          "Kiểm tra 1 tiết": "kiemtra1tiet",
        };
        const res = await createTestInfo(lessonId, {
          testType:
            testTypeMap[examType as keyof typeof testTypeMap] || "kiemtra15",
          content: examContent,
          reminder: reminder.trim() || undefined,
        });
        if (res && res.success) {
          setLoadingSuccess(true);
          setTimeout(() => {
            setShowLoading(false);
            setLoadingSuccess(false);
            setIsUpdating(false);
            router.back();
          }, 1000);
        } else {
          setError(res.message || "Tạo thông tin kiểm tra thất bại!");
          setShowLoading(false);
          setIsUpdating(false);
        }
      } catch (e) {
        setError("Tạo thông tin kiểm tra thất bại!");
        setShowLoading(false);
        setIsUpdating(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (isValid && existingTestInfo?._id) {
      setIsUpdating(true);
      setShowLoading(true);
      setLoadingSuccess(false);
      setError("");
      try {
        const testTypeMap = {
          "Kiểm tra 15'": "kiemtra15",
          "Kiểm tra 1 tiết": "kiemtra1tiet",
        };
        const res = await updateTestInfo(existingTestInfo._id, {
          testType:
            testTypeMap[examType as keyof typeof testTypeMap] || "kiemtra15",
          content: examContent,
          reminder: reminder.trim() || undefined,
        });
        if (res && res.success) {
          setLoadingSuccess(true);
          setTimeout(() => {
            setShowLoading(false);
            setLoadingSuccess(false);
            setIsUpdating(false);
            router.back();
          }, 1000);
        } else {
          setError(res.message || "Cập nhật thông tin kiểm tra thất bại!");
          setShowLoading(false);
          setIsUpdating(false);
        }
      } catch (e) {
        setError("Cập nhật thông tin kiểm tra thất bại!");
        setShowLoading(false);
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!existingTestInfo?._id) return;
    setIsDeleting(true);
    setShowLoading(true);
    setError("");
    try {
      const res = await deleteTestInfo(existingTestInfo._id);
      setShowDeleteModal(false);
      setShowLoading(false);
      setIsDeleting(false);
      if (res && res.success) {
        router.back();
      } else {
        setError(res.message || "Xóa thông tin kiểm tra thất bại!");
      }
    } catch (e) {
      setShowDeleteModal(false);
      setShowLoading(false);
      setIsDeleting(false);
      setError("Xóa thông tin kiểm tra thất bại!");
    }
  };

  const toggleDropdown = () => {
    setExamTypeModal(!examTypeModal);
  };

  const selectExamType = (type: string) => {
    setExamType(type);
    setExamTypeModal(false);
  };

  return (
    <HeaderLayout
      title={isEditMode ? "Cập nhật kiểm tra" : "Dặn dò kiểm tra"}
      subtitle={subtitle || "Tạo thông tin kiểm tra"}
      onBack={() => {
        router.back();
      }}
    >
      <View style={styles.container}>
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Kiểm tra <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={toggleDropdown}
              activeOpacity={0.8}
            >
              <Text
                style={
                  examType ? styles.dropdownText : styles.dropdownPlaceholder
                }
              >
                {examType || "Chọn loại kiểm tra"}
              </Text>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: arrowRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    },
                  ],
                }}
              >
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color="#29375C"
                />
              </Animated.View>
            </TouchableOpacity>
            {examTypeModal && (
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    opacity: dropdownAnimation,
                    transform: [
                      {
                        translateY: dropdownAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-5, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {EXAM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalItem}
                    onPress={() => selectExamType(type)}
                  >
                    <Text style={styles.modalItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
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
              placeholder="Nhập bài kiểm tra"
              placeholderTextColor="#9CA3AF"
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
              placeholder="Nhập nhắc nhở"
              placeholderTextColor="#9CA3AF"
              multiline={true}
            />
          </View>
        </View>
        {error ? (
          <Text
            style={{
              color: "red",
              textAlign: "center",
              marginBottom: 8,
              fontFamily: "Baloo2-Medium",
            }}
          >
            {error}
          </Text>
        ) : null}

        {isEditMode ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
              disabled={isDeleting}
              onPress={handleDelete}
            >
              <Text
                style={[
                  styles.deleteBtnText,
                  isDeleting && { color: "#29375C" },
                ]}
              >
                {isDeleting ? "Đang xóa..." : "Xóa bỏ"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.updateBtn,
                (!isValid || isUpdating) && styles.updateBtnDisabled,
              ]}
              disabled={!isValid || isUpdating}
              onPress={handleUpdate}
            >
              <Text style={styles.updateBtnText}>
                {isUpdating ? "Đang lưu..." : "Lưu"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!isValid || isUpdating) && styles.saveBtnDisabled,
            ]}
            disabled={!isValid || isUpdating}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>
              {isUpdating ? "Đang lưu..." : "Lưu"}
            </Text>
          </TouchableOpacity>
        )}

        <LoadingModal
          visible={showLoading}
          text={
            loadingSuccess
              ? isEditMode
                ? "Cập nhật thành công"
                : "Thành công"
              : isEditMode
              ? "Đang cập nhật thông tin kiểm tra..."
              : "Đang tạo thông tin kiểm tra..."
          }
          success={loadingSuccess}
        />

        <ConfirmDeleteModal
          visible={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Xác nhận xóa?"
          message={`Xóa bỏ sẽ không thể hoàn lại được!\nBạn chắc chắn muốn xóa bỏ?`}
        />
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  modalItem: {
    paddingVertical: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
  },
  saveBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  deleteBtn: {
    backgroundColor: "#FFA29D",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "45%",
  },
  deleteBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  deleteBtnText: {
    color: "#CF2020",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  updateBtn: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "45%",
  },
  updateBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  updateBtnText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
});

export default AddExamReminder;

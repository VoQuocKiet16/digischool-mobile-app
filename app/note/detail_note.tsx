import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import RemindPicker from "../../components/RemindPicker";
import { deleteNote, updateNote } from "../../services/note_lesson.service";
import { getLessonSubtitle } from "../../utils/lessonSubtitle";
import { fonts } from "../../utils/responsive";

const REMIND_OPTIONS = [
  "Trước 10 phút",
  "Trước 20 phút",
  "Trước 30 phút",
  "Trước 40 phút",
  "Trước 50 phút",
];
const ITEM_HEIGHT = 36;
const PADDING_COUNT = 2;

// Giới hạn ký tự
const TITLE_MAX_LENGTH = 50;
const CONTENT_MAX_LENGTH = 200;

const DetailNoteScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonData = params.lessonData
    ? JSON.parse(params.lessonData as string)
    : null;
  const [title, setTitle] = useState(
    typeof params.title === "string" ? params.title : ""
  );
  const [note, setNote] = useState(
    typeof params.content === "string" ? params.content : ""
  );
  const [remind, setRemind] = useState(
    typeof params.remindTime === "string" && params.remindTime !== ""
      ? true
      : false
  );
  // Map remindTime (có thể là số phút) sang option "Trước xx phút"
  let initialRemindTime = REMIND_OPTIONS[2];
  if (typeof params.remindTime === "string" && params.remindTime !== "") {
    // Nếu là số, map sang option
    const match = params.remindTime.match(/\d+/);
    if (match) {
      const found = REMIND_OPTIONS.find((opt) => opt.includes(match[0]!));
      if (found) initialRemindTime = found;
    } else if (REMIND_OPTIONS.includes(params.remindTime)) {
      initialRemindTime = params.remindTime;
    }
  }
  const [remindTime, setRemindTime] = useState(initialRemindTime);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  // Validation functions
  const validateTitle = (text: string) => {
    if (text.trim().length === 0) {
      setTitleError("Tiêu đề không được để trống");
      return false;
    }
    if (text.length > TITLE_MAX_LENGTH) {
      setTitleError(`Tiêu đề không được vượt quá ${TITLE_MAX_LENGTH} ký tự`);
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateContent = (text: string) => {
    if (text.trim().length === 0) {
      setContentError("Nội dung không được để trống");
      return false;
    }
    if (text.length > CONTENT_MAX_LENGTH) {
      setContentError(`Nội dung không được vượt quá ${CONTENT_MAX_LENGTH} ký tự`);
      return false;
    }
    setContentError("");
    return true;
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (titleError) validateTitle(text);
  };

  const handleContentChange = (text: string) => {
    setNote(text);
    if (contentError) validateContent(text);
  };

  const isValid = title.trim() && note.trim() && !titleError && !contentError;
  const id = typeof params.id === "string" ? params.id : undefined;

  const handleUpdate = async () => {
    if (!id) return;
    
    // Validate trước khi submit
    const isTitleValid = validateTitle(title);
    const isContentValid = validateContent(note);
    
    if (!isTitleValid || !isContentValid) {
      return;
    }

    setIsUpdating(true);
    setShowLoading(true);
    setLoadingSuccess(false);
    setError("");
    try {
      const data: any = { title, content: note };
      if (remind) {
        data.remindMinutes = Number(remindTime.match(/\d+/)?.[0]);
      } else {
        data.remindMinutes = undefined;
      }
      const res = await updateNote(id, data);
      if (res.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          setIsUpdating(false);
          router.back();
        }, 1000);
      } else {
        setError(res.message || "Cập nhật ghi chú thất bại!");
        setShowLoading(false);
        setIsUpdating(false);
      }
    } catch (e) {
      setError("Cập nhật ghi chú thất bại!");
      setShowLoading(false);
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa ghi chú này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: async () => {
            if (!id) return;
            setIsDeleting(true);
            setShowLoading(true);
            setError("");
            try {
              const res = await deleteNote(id);
              setShowLoading(false);
              setIsDeleting(false);
              if (res.success) {
                router.back();
              } else {
                setError(res.message || "Xoá ghi chú thất bại!");
              }
            } catch (e) {
              setShowLoading(false);
              setIsDeleting(false);
              setError("Xoá ghi chú thất bại!");
            }
          },
        },
      ]
    );
  };

  return (
    <HeaderLayout
      title="Chi tiết ghi chú"
      subtitle={getLessonSubtitle(lessonData)}
      onBack={() => router.back()}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* Tiêu đề ghi chú */}
              <View style={styles.fieldWrap}>
                <View style={[styles.outlineInputBox, titleError && styles.inputError]}>
                  <Text style={styles.floatingLabel}>
                    Tiêu đề ghi chú <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    value={title}
                    onChangeText={handleTitleChange}
                    onBlur={() => validateTitle(title)}
                    placeholder="Nhập tiêu đề ghi chú"
                    placeholderTextColor="#9CA3AF"
                    maxLength={TITLE_MAX_LENGTH}
                  />
                  <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>
                      {title.length}/{TITLE_MAX_LENGTH}
                    </Text>
                  </View>
                </View>
                {titleError ? (
                  <Text style={styles.errorText}>{titleError}</Text>
                ) : null}
              </View>
              {/* Ghi chú */}
              <View style={styles.fieldWrap}>
                <View style={[styles.outlineInputBox, contentError && styles.inputError]}>
                  <Text style={styles.floatingLabel}>
                    Ghi chú <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.inputTextOutline,
                      { minHeight: 48, marginBottom: 20 },
                    ]}
                    value={note}
                    onChangeText={handleContentChange}
                    onBlur={() => validateContent(note)}
                    placeholder="Nhập nội dung ghi chú"
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    blurOnSubmit={true}
                    maxLength={CONTENT_MAX_LENGTH}
                  />
                  <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>
                      {note.length}/{CONTENT_MAX_LENGTH}
                    </Text>
                  </View>
                </View>
                {contentError ? (
                  <Text style={styles.errorText}>{contentError}</Text>
                ) : null}
              </View>
              {/* Nhắc nhở */}
              <RemindPicker
                remind={remind}
                setRemind={setRemind}
                remindTime={remindTime}
                setRemindTime={setRemindTime}
                REMIND_OPTIONS={REMIND_OPTIONS}
                ITEM_HEIGHT={ITEM_HEIGHT}
                PADDING_COUNT={PADDING_COUNT}
              />
              {error ? (
                <Text
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginBottom: 8,
                    fontFamily: fonts.medium,
                  }}
                >
                  {error}
                </Text>
              ) : null}
              {/* Nút Xoá và Lưu */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
                  disabled={isDeleting}
                  onPress={handleDelete}
                >
                  <Text
                    style={[styles.deleteBtnText, isDeleting && { color: "#29375C" }]}
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa bỏ"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    (!isValid || isUpdating) && styles.saveBtnDisabled,
                  ]}
                  disabled={!isValid || isUpdating}
                  onPress={handleUpdate}
                >
                  <Text style={styles.saveBtnText}>
                    {isUpdating ? "Đang lưu..." : "Lưu"}
                  </Text>
                </TouchableOpacity>
              </View>
              <LoadingModal
                visible={showLoading}
                text={
                  loadingSuccess
                    ? "Cập nhật thành công"
                    : isDeleting
                    ? "Đang xóa ghi chú..."
                    : "Đang cập nhật ghi chú..."
                }
                success={loadingSuccess}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </HeaderLayout>
  );
};

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
  inputError: {
    borderColor: "#E53935",
  },
  floatingLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    zIndex: 2,
  },
  inputTextOutline: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  characterCount: {
    position: "absolute",
    bottom: 8,
    right: 15,
  },
  characterCountText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    fontFamily: fonts.regular,
    marginLeft: 15,
    marginTop: -20,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 36,
    gap: 16,
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
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "45%",
  },
  saveBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
});

export default DetailNoteScreen;

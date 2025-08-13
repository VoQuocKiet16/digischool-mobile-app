import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import ConfirmDeleteModal from "../../components/notifications_modal/ConfirmDeleteModal";
import RemindPicker from "../../components/RemindPicker";
import { deleteActivity, updateActivity } from "../../services/activity.service";
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
const DETAIL_MAX_LENGTH = 200;

// Danh sách tiết học mẫu (có thể lấy từ backend hoặc constants)
const TIME_SLOTS = [
  { period: 1, startTime: "07:00", endTime: "07:45" },
  { period: 2, startTime: "07:50", endTime: "08:35" },
  { period: 3, startTime: "08:40", endTime: "09:25" },
  { period: 4, startTime: "09:45", endTime: "10:30" },
  { period: 5, startTime: "10:35", endTime: "11:20" },
  { period: 6, startTime: "12:30", endTime: "13:15" },
  { period: 7, startTime: "13:20", endTime: "14:05" },
  { period: 8, startTime: "14:10", endTime: "14:55" },
  { period: 9, startTime: "15:00", endTime: "15:45" },
  { period: 10, startTime: "15:50", endTime: "16:35" },
];

function getActivitySubtitle({
  date,
  period,
}: {
  date?: string;
  period?: number;
}) {
  if (!date || !period) return "";
  const d = new Date(date);
  const weekday = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const dayStr = weekday[d.getDay()];
  const session = period <= 5 ? "Sáng" : "Chiều";
  const periodStr = `Tiết ${period}`;
  const slot = TIME_SLOTS.find((ts) => ts.period === period);
  const timeStr = slot ? `${slot.startTime} - ${slot.endTime}` : "";
  return `${session} • ${dayStr} • ${periodStr}${
    timeStr ? ` • ${timeStr}` : ""
  }`;
}

const DetailActivityScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [title, setTitle] = useState(
    typeof params.title === "string" ? params.title : ""
  );
  const [detail, setDetail] = useState(
    typeof params.content === "string" ? params.content : ""
  );
  // Chuẩn hóa khởi tạo RemindPicker
  let initialRemind = false;
  let initialRemindTime = REMIND_OPTIONS[2];
  if (typeof params.time === "number" && params.time > 0) {
    initialRemind = true;
    const found = REMIND_OPTIONS.find((opt) =>
      opt.includes(params.time.toString())
    );
    if (found) initialRemindTime = found;
  } else if (typeof params.time === "string" && params.time !== "") {
    const timeVal = Number(params.time);
    if (timeVal > 0) {
      initialRemind = true;
      const found = REMIND_OPTIONS.find((opt) =>
        opt.includes(timeVal.toString())
      );
      if (found) initialRemindTime = found;
    }
  }

  const [remind, setRemind] = useState(initialRemind);
  const [remindTime, setRemindTime] = useState(initialRemindTime);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [detailError, setDetailError] = useState("");

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

  const validateDetail = (text: string) => {
    if (text.trim().length === 0) {
      setDetailError("Chi tiết không được để trống");
      return false;
    }
    if (text.length > DETAIL_MAX_LENGTH) {
      setDetailError(`Chi tiết không được vượt quá ${DETAIL_MAX_LENGTH} ký tự`);
      return false;
    }
    setTitleError("");
    return true;
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (titleError) validateTitle(text);
  };

  const handleDetailChange = (text: string) => {
    setDetail(text);
    if (detailError) validateDetail(text);
  };

  const isValid = title.trim() && detail.trim() && !titleError && !detailError;
  const id = typeof params.id === "string" ? params.id : undefined;
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const period = params.period ? Number(params.period) : undefined;
  const periodParam = period ? period : undefined;

  // Function để thông báo TKB cần refresh
  const notifyScheduleRefresh = async (type: 'update' | 'delete', activityData?: any) => {
    try {
      const scheduleUpdate = {
        type: type === 'update' ? 'updated_activity' : 'deleted_activity',
        data: activityData || { _id: id, date: dateParam, period: periodParam },
        timestamp: Date.now(),
        needsRefresh: true
      };
      
      await AsyncStorage.setItem('scheduleNeedsRefresh', JSON.stringify(scheduleUpdate));
      console.log('📝 Schedule refresh notification saved:', scheduleUpdate);
    } catch (error) {
      console.error('Error saving schedule refresh notification:', error);
    }
  };

  const handleUpdate = async () => {
    // Validate trước khi submit
    const isTitleValid = validateTitle(title);
    const isDetailValid = validateDetail(detail);
    
    if (!isTitleValid || !isDetailValid) {
      return;
    }

    if (!id) {
      setError("Không tìm thấy id hoạt động!");
      return;
    }

    setIsUpdating(true);
    setShowLoading(true);
    setError("");
    try {
      const data: any = {
        title,
        content: detail,
      };
      if (remind) {
        data.remindMinutes = Number(remindTime.match(/\d+/)?.[0]);
      } else {
        data.remindMinutes = undefined;
      }
      const res = await updateActivity(id, data);
      if (res.success) {
        // Thông báo TKB cần refresh
        await notifyScheduleRefresh('update', {
          ...data,
          _id: id,
          date: dateParam,
          period: periodParam,
          updatedAt: new Date().toISOString()
        });
        
        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          setIsUpdating(false);
          router.back();
        }, 1000);
      } else {
        setError(res.message || "Cập nhật hoạt động thất bại!");
        setShowLoading(false);
        setIsUpdating(false);
      }
    } catch (e) {
      setError("Cập nhật hoạt động thất bại!");
      setShowLoading(false);
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!id) {
      setError("Không tìm thấy id hoạt động!");
      return;
    }
    setIsDeleting(true);
    setShowLoading(true);
    setError("");
    try {
      const res = await deleteActivity(id);
      setShowDeleteModal(false);
      setShowLoading(false);
      setIsDeleting(false);
      if (res.success) {
        // Thông báo TKB cần refresh
        await notifyScheduleRefresh('delete', {
          _id: id,
          date: dateParam,
          period: periodParam
        });
        
        router.back();
      } else {
        setError(res.message || "Xoá hoạt động thất bại!");
      }
    } catch (e) {
      setShowDeleteModal(false);
      setShowLoading(false);
      setIsDeleting(false);
      setError("Xoá hoạt động thất bại!");
    }
  };

  const subtitle = getActivitySubtitle({ date: dateParam, period });

  return (
    <HeaderLayout
      title="Chi tiết hoạt động"
      subtitle={subtitle}
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
              {/* Tiêu đề hoạt động */}
              <View style={styles.fieldWrap}>
                <View style={[styles.outlineInputBox, titleError && styles.inputError]}>
                  <Text style={styles.floatingLabel}>
                    Tiêu đề hoạt động <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    value={title}
                    onChangeText={handleTitleChange}
                    onBlur={() => validateTitle(title)}
                    placeholder="Nhập tiêu đề hoạt động"
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
              {/* Chi tiết */}
              <View style={styles.fieldWrap}>
                <View style={[styles.outlineInputBox, detailError && styles.inputError]}>
                  <Text style={styles.floatingLabel}>
                    Chi tiết <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.inputTextOutline,
                      { minHeight: 48, marginBottom: 20 },
                    ]}
                    value={detail}
                    onChangeText={handleDetailChange}
                    onBlur={() => validateDetail(detail)}
                    placeholder="Nhập nội dung hoạt động"
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    blurOnSubmit={true}
                    maxLength={DETAIL_MAX_LENGTH}
                  />
                  <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>
                      {detail.length}/{DETAIL_MAX_LENGTH}
                    </Text>
                  </View>
                </View>
                {detailError ? (
                  <Text style={styles.errorText}>{detailError}</Text>
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
                  isDeleting
                    ? "Đang xóa hoạt động..."
                    : "Đang cập nhật hoạt động..."
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
    bottom: 0,
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

export default DetailActivityScreen;

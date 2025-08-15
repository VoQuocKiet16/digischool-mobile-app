import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
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
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import RemindPicker from "../../components/RemindPicker";
import { createActivity } from "../../services/activity.service";
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

const AddActivityScreen = () => {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [remind, setRemind] = useState(true);
  const [remindTime, setRemindTime] = useState(REMIND_OPTIONS[2]);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [detailError, setDetailError] = useState("");
  const { periodIndex, date } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

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
    setDetailError("");
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
  const dateParam = Array.isArray(date) ? date[0] : date;
  const period = periodIndex ? Number(periodIndex) + 1 : undefined;
  const subtitle = getActivitySubtitle({ date: dateParam, period });

  // Function để thông báo TKB cần refresh
  const notifyScheduleRefresh = async (activityData: any) => {
    try {
      // Lưu hoạt động mới vào AsyncStorage
      const existingActivitiesStr = await AsyncStorage.getItem('personalActivities');
      let existingActivities = [];
      
      if (existingActivitiesStr) {
        try {
          existingActivities = JSON.parse(existingActivitiesStr);
        } catch (parseError) {
          console.error('Error parsing existing activities:', parseError);
        }
      }
      
      // Thêm hoạt động mới vào danh sách với format đúng
      const newActivity = {
        title: activityData.title,
        content: activityData.content,
        period: activityData.period,
        date: activityData.date,
        remindMinutes: activityData.remindMinutes,
        _id: activityData._id || `local_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      const updatedActivities = [...existingActivities, newActivity];
      await AsyncStorage.setItem('personalActivities', JSON.stringify(updatedActivities));
      
      // Lưu thông báo TKB cần refresh
      const scheduleUpdate = {
        type: 'new_activity',
        data: newActivity,
        timestamp: Date.now(),
        needsRefresh: true
      };
      
      await AsyncStorage.setItem('scheduleNeedsRefresh', JSON.stringify(scheduleUpdate));
      console.log('📝 Activity saved to AsyncStorage and schedule refresh notification sent:', newActivity);
    } catch (error) {
      console.error('Error saving activity to AsyncStorage:', error);
    }
  };

  return (
    <HeaderLayout
      title="Thêm hoạt động mới"
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
              {/* Nút Thêm */}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!isValid || loading) && styles.saveBtnDisabled,
                ]}
                disabled={!isValid || loading}
                onPress={async () => {
                  // Validate trước khi submit
                  const isTitleValid = validateTitle(title);
                  const isDetailValid = validateDetail(detail);
                  
                  if (!isTitleValid || !isDetailValid) {
                    return;
                  }

                  if (!periodIndex || !date) return;
                  setLoading(true);
                  setShowLoading(true);
                  const reqBody: any = {
                    title,
                    content: detail,
                    period: Number(periodIndex) + 1,
                    date,
                  };
                  if (remind) {
                    reqBody.remindMinutes = Number(remindTime.match(/\d+/)?.[0]);
                  }
                  
                  try {
                    const res = await createActivity(reqBody);
                    if (res.success) {
                      // Thông báo TKB cần refresh
                      await notifyScheduleRefresh({
                        ...reqBody,
                        _id: res.data?._id,
                        createdAt: new Date().toISOString()
                      });
                      
                      setShowSuccess(true);
                      setTimeout(() => {
                        setShowLoading(false);
                        setShowSuccess(false);
                        router.back();
                      }, 1200);
                    } else {
                      setShowLoading(false);
                      alert(res.message || "Tạo hoạt động thất bại");
                    }
                  } catch (error) {
                    console.error('Error creating activity:', error);
                    setShowLoading(false);
                    alert("Có lỗi xảy ra khi tạo hoạt động");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    (!isValid || loading) && { color: "#A0A0A0" },
                  ]}
                >
                  Thêm
                </Text>
              </TouchableOpacity>
              <LoadingModal
                visible={showLoading}
                text={
                  showSuccess
                    ? "Thêm thành công"
                    : "Đang thêm..."
                }
                success={showSuccess}
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
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
});

export default AddActivityScreen;

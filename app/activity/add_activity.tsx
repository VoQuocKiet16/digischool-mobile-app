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
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

const REMIND_OPTIONS = [
  "Trước 10 phút",
  "Trước 20 phút",
  "Trước 30 phút",
  "Trước 40 phút",
  "Trước 50 phút",
];
const ITEM_HEIGHT = 36;
const PADDING_COUNT = 2;

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
  const { periodIndex, date } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const isValid = title.trim() && detail.trim();
  const dateParam = Array.isArray(date) ? date[0] : date;
  const period = periodIndex ? Number(periodIndex) + 1 : undefined;
  const subtitle = getActivitySubtitle({ date: dateParam, period });

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
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Tiêu đề hoạt động <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nhập tiêu đề hoạt động"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              {/* Chi tiết */}
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Chi tiết <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.inputTextOutline,
                      { minHeight: 48, marginBottom: 20 },
                    ]}
                    value={detail}
                    onChangeText={setDetail}
                    placeholder="Nhập nội dung hoạt động"
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                  />
                </View>
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
                  const res = await createActivity(reqBody);
                  setLoading(false);
                  if (res.success) {
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

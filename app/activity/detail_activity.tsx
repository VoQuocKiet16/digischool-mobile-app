import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import ConfirmDeleteModal from "../../components/notifications_modal/ConfirmDeleteModal";
import RemindPicker from "../../components/RemindPicker";
import {
  deleteActivity,
  updateActivity,
} from "../../services/activity.service";

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
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isValid = title.trim() && detail.trim();
  const id = typeof params.id === "string" ? params.id : undefined;

  const handleUpdate = async () => {
    if (!id) {
      setError("Không tìm thấy id hoạt động!");
      return;
    }
    setIsUpdating(true);
    setShowLoading(true);
    setLoadingSuccess(false);
    setError("");
    try {
      const data: any = { title, content: detail };
      if (remind) {
        data.remindMinutes = Number(remindTime.match(/\d+/)?.[0]);
      } else {
        data.remindMinutes = undefined;
      }
      const res = await updateActivity(id, data);
      if (res.success) {
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

  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const period = params.period ? Number(params.period) : undefined;
  const subtitle = getActivitySubtitle({ date: dateParam, period });

  return (
    <HeaderLayout
      title="Chi tiết hoạt động"
      subtitle={subtitle}
      onBack={() => router.back()}
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
              blurOnSubmit={true}
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
    fontFamily: "Baloo2-SemiBold",
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
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
});

export default DetailActivityScreen;

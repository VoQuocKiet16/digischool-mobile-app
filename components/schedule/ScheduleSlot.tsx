import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../utils/responsive";
import ConflictModal from "./ConflictModal";

interface ScheduleSlotProps {
  text: string;
  dayIndex: number;
  periodIndex: number;
  onAddActivity?: (
    dayIndex: number,
    periodIndex: number,
    activity: string
  ) => void;
  onSlotPress?: (
    dayIndex: number,
    periodIndex: number,
    activity: string,
    lessonId?: string
  ) => void;
  activityText?: string;
  hasNotification?: boolean;
  isUserAdded?: boolean;
  isSelected?: boolean;
  onSlotPressLegacy?: (dayIndex: number, periodIndex: number) => void;
  cellStatus?: "taught" | "current" | "exchangeable" | "default";
  lessonId?: string;
  type?: string;
  slotData?: any;
  isSwapLesson?: boolean;
}

const ScheduleSlot: React.FC<ScheduleSlotProps> = ({
  text,
  dayIndex,
  periodIndex,
  onAddActivity,
  onSlotPress,
  activityText,
  hasNotification,
  isUserAdded,
  isSelected,
  cellStatus,
  onSlotPressLegacy,
  lessonId,
  type,
  slotData,
  isSwapLesson = false,
}) => {
  const router = useRouter();
  const [showConflictModal, setShowConflictModal] = useState(false);

  const isEmpty = text === "Thêm" || !text;

  const handleAdd = () => {
    // Xử lý slot có xung đột
    if (type === "conflict" && slotData?.hasConflict) {
      setShowConflictModal(true);
      return;
    }

    if (isEmpty && onAddActivity) {
      onAddActivity(dayIndex, periodIndex, text);
    } else if (!isEmpty && onSlotPress) {
      // Nếu là slot hoạt động cá nhân
      if (type === "user-activity") {
        // Truyền đủ params sang detail_activity
        router.push({
          pathname: "/activity/detail_activity",
          params: {
            id: slotData?.id, // truyền đúng id của activity
            title: text,
            content: slotData?.content || activityText,
            time:
              typeof slotData?.time === "number" ? slotData.time : undefined,
            remindAt: slotData?.remindAt,
            date: slotData?.date,
            period: periodIndex + 1,
          },
        });
      } else {
        onSlotPress(dayIndex, periodIndex, text, lessonId);
      }
    } else if (onSlotPressLegacy && !isEmpty) {
      onSlotPressLegacy(dayIndex, periodIndex);
    } else if (isEmpty) {
      router.push({
        pathname: "/activity/add_activity",
        params: { periodIndex },
      });
    }
  };

  const handleViewLesson = () => {
    setShowConflictModal(false);
    if (slotData?.lessonId) {
      // Chuyển đến chi tiết môn học
      router.push({
        pathname: "/students/lesson_information/lesson_detail",
        params: { lessonId: slotData.lessonId },
      });
    }
  };

  const handleViewActivity = () => {
    setShowConflictModal(false);
    if (slotData?.activityData?.id) {
      // Chuyển đến chi tiết hoạt động
      router.push({
        pathname: "/activity/detail_activity",
        params: {
          id: slotData.activityData.id,
          title: slotData.activityText,
          content: slotData.activityData.content,
          time: slotData.activityData.time,
          remindAt: slotData.activityData.remindAt,
          date: slotData.activityData.date,
          period: periodIndex + 1,
        },
      });
    }
  };

  let slotStyle = styles.filledSlot;
  let slotText = text;
  let textStyle = styles.filledSlotText;
  let showNotification = hasNotification;

  // Slot có xung đột
  if (type === "conflict") {
    slotStyle = styles.conflictSlot;
    textStyle = styles.conflictSlotText;
    showNotification = true; // Luôn hiển thị notification cho slot xung đột
  }
  // Slot hoạt động cá nhân
  else if (type === "user-activity") {
    slotStyle = styles.userActivitySlot;
    textStyle = styles.userActivitySlotText;
  }

  if (isEmpty) {
    slotStyle = styles.emptySlot as any;
    textStyle = styles.emptySlotText;
  } else if (isSelected) {
    slotStyle = styles.selectedSlot;
    slotText = "Đã chọn";
    textStyle = styles.selectedSlotText;
  } else if (cellStatus === "current") {
    slotStyle = styles.currentSlot;
    textStyle = styles.currentSlotText;
  } else if (cellStatus === "exchangeable") {
    if (isSwapLesson) {
      slotStyle = styles.filledSlot;
      textStyle = styles.filledSlotText;
    } else {
      slotStyle = styles.exchangeableSlot;
      textStyle = styles.exchangeableSlotText;
    }
  } else if (isUserAdded) {
    slotStyle = styles.userAddedSlot;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={slotStyle}
        onPress={handleAdd}
        activeOpacity={0.7}
      >
        <Text style={textStyle} numberOfLines={2} ellipsizeMode="tail">
          {slotText}
        </Text>
        {showNotification && (
          <View style={styles.notificationPin}>
            <FontAwesome
              name="exclamation"
              size={12}
              color="#fff"
              style={styles.notificationText}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Conflict Modal */}
      <ConflictModal
        visible={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        onViewLesson={handleViewLesson}
        onViewActivity={handleViewActivity}
        lessonText={slotData?.lessonText || "Môn học"}
        activityText={slotData?.activityText || "Hoạt động cá nhân"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  filledSlot: {
    backgroundColor: "#29375C",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  emptySlot: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "92%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  userAddedSlot: {
    backgroundColor: "#36a38f",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#36a38f",
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  filledSlotText: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
  emptySlotText: {
    color: "#A0A0A0",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
  taughtSlot: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B6B6B6",
    borderStyle: "dashed",
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  taughtSlotText: {
    color: "#B6B6B6",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
  currentSlot: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  currentSlotText: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
  exchangeableSlot: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F9B233",
    borderStyle: "dashed",
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  exchangeableSlotText: {
    color: "#29375C",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
  selectedSlot: {
    backgroundColor: "#F9B233",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selectedSlotText: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
  notificationPin: {
    position: "absolute",
    top: -6,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: "#F04438",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: fonts.semiBold,
  },
  userActivitySlot: {
    backgroundColor: "#229A89",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#229A89",
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  userActivitySlotText: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
  conflictSlot: {
    backgroundColor: "#F04438", // Màu đỏ cho xung đột
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "90%",
    height: 77,
    minHeight: 77,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  conflictSlotText: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.semiBold,
  },
});

export default ScheduleSlot;

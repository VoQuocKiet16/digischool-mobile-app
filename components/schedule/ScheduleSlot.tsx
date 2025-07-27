import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

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
}) => {
  const router = useRouter();

  const isEmpty = text === "Thêm" || !text;

  const handleAdd = () => {
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

  let slotStyle = styles.filledSlot;
  let slotText = text;
  let textStyle = styles.filledSlotText;
  let showNotification = hasNotification;

  // Slot hoạt động cá nhân
  if (type === "user-activity") {
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
    width: 14,
    height: 14,
    borderRadius: 10,
    backgroundColor: "#F04438",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
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
});

export default ScheduleSlot;

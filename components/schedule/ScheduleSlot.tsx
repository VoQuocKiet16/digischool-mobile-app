import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
}) => {
  const router = useRouter();

  const isEmpty = text === "Thêm" || !text;

  const handleAdd = () => {
    if (isEmpty && onAddActivity) {
      onAddActivity(dayIndex, periodIndex, text);
    } else if (!isEmpty && onSlotPress) {
      onSlotPress(dayIndex, periodIndex, text, lessonId);
    } else if (onSlotPressLegacy && !isEmpty) {
      onSlotPressLegacy(dayIndex, periodIndex);
    } else if (isEmpty) {
      router.push({
        pathname: "/activity/add_activity",
        params: { periodIndex },
      });
    }
  };

  if (cellStatus) {
    if (cellStatus === "taught") {
      return (
        <View style={styles.container}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              width: "90%",
              height: 77,
              minHeight: 77,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        </View>
      );
    }
    let slotStyle = styles.filledSlot;
    let slotText = text;
    let textStyle = styles.filledSlotText;
    let disabled = false;
    if (cellStatus === "current") {
      slotStyle = styles.currentSlot;
      textStyle = styles.currentSlotText;
      disabled = true;
    } else if (cellStatus === "exchangeable") {
      slotStyle = isSelected ? styles.selectedSlot : styles.exchangeableSlot;
      textStyle = isSelected
        ? styles.selectedSlotText
        : styles.exchangeableSlotText;
      slotText = isSelected ? "Đã chọn" : text;
      disabled = false;
    }
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={slotStyle}
          onPress={handleAdd}
          activeOpacity={disabled ? 1 : 0.7}
          disabled={disabled}
        >
          <Text style={textStyle} numberOfLines={2} ellipsizeMode="tail">
            {slotText}
          </Text>
        </TouchableOpacity>
        {hasNotification && (
          <View style={styles.notificationPin}>
            <FontAwesome
              name="exclamation"
              size={12}
              color="#fff"
              style={styles.notificationText}
            />
          </View>
        )}
      </View>
    );
  }

  let slotStyle = styles.filledSlot;
  let slotText = text;
  let textStyle = styles.filledSlotText;
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
      </TouchableOpacity>
      {hasNotification && (
        <View style={styles.notificationPin}>
          <FontAwesome
            name="exclamation"
            size={12}
            color="#fff"
            style={styles.notificationText}
          />
        </View>
      )}
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
    borderWidth: 2,
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
    fontFamily: "Baloo2-SemiBold",
  },
  emptySlotText: {
    color: "#A0A0A0",
    fontSize: 9,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: "Baloo2-SemiBold",
  },
  taughtSlot: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
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
    fontFamily: "Baloo2-SemiBold",
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
    fontFamily: "Baloo2-SemiBold",
  },
  exchangeableSlot: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
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
    fontFamily: "Baloo2-SemiBold",
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
    fontFamily: "Baloo2-SemiBold",
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
    borderWidth: 2,
    borderColor: "#fff",
  },
  notificationText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Baloo2-SemiBold",
  },
});

export default ScheduleSlot;
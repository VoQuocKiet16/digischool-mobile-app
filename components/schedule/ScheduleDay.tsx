import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Activity } from "../../app/students/schedule/schedule";
import ScheduleSlot from "./ScheduleSlot";

interface ScheduleDayProps {
  periods: string[];
  days: string[];
  onAddActivity: (
    dayIndex: number,
    periodIndex: number,
    activity: string
  ) => void;
  onSlotPress: (
    dayIndex: number,
    periodIndex: number,
    activity: string,
    lessonId?: string
  ) => void;
  scheduleData: Activity[][];
  selectedSlots?: { row: number; col: number }[];
  onSelectSlot?: (dayIndex: number, periodIndex: number) => void;
  cellStatusData?: ("taught" | "current" | "exchangeable" | "default")[][];
  currentDayIndex?: number;
  lessonIds?: string[][];
  hideNullSlot?: boolean;
}
const ScheduleDay: React.FC<ScheduleDayProps> = ({
  periods,
  days,
  onAddActivity,
  onSlotPress,
  scheduleData,
  selectedSlots = [],
  onSelectSlot,
  cellStatusData,
  currentDayIndex,
  lessonIds,
  hideNullSlot = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Các hàng tiết */}
      {periods.map((period, periodIndex) => (
        <View key={periodIndex} style={styles.row}>
          {/* Cột tiết */}
          <View style={styles.periodCell}>
            <Text style={styles.periodText}>{period}</Text>
          </View>
          {/* Các slot của từng ngày */}
          {days.map((_, dayIndex) => {
            const slotData =
              scheduleData[periodIndex] && scheduleData[periodIndex][dayIndex]
                ? scheduleData[periodIndex][dayIndex]
                : { text: "", type: "default", hasNotification: false };
            const isSelected = selectedSlots.some(
              (cell) => cell.row === periodIndex && cell.col === dayIndex
            );
            const cellStatus = cellStatusData
              ? cellStatusData[periodIndex][dayIndex]
              : undefined;
            const lessonId = lessonIds?.[periodIndex]?.[dayIndex];
            let slotText = slotData.text;
            if (
              cellStatus === "exchangeable" &&
              (!slotText || slotText === "")
            ) {
              slotText = "Trống";
            } else if (!slotText || slotText === "") {
              slotText = "Thêm hoạt động";
            }

            // Kiểm tra xem có phải cột của ngày hiện tại không
            const isCurrentDay =
              currentDayIndex !== undefined && currentDayIndex === dayIndex;

            // Nếu là leave_request và slot null thì không render gì
            if (hideNullSlot && (!slotData.text || slotData.text === "")) {
              return <View key={dayIndex} style={styles.slotWrapper}></View>;
            }

            return (
              <View
                key={dayIndex}
                style={[
                  styles.slotWrapper,
                  isCurrentDay && styles.currentDaySlot,
                ]}
              >
                <ScheduleSlot
                  text={slotText}
                  isUserAdded={slotData.type === "user-added"}
                  hasNotification={slotData.hasNotification}
                  dayIndex={dayIndex}
                  periodIndex={periodIndex}
                  isSelected={isSelected}
                  onAddActivity={onAddActivity}
                  {...(cellStatus && { cellStatus })}
                  onSlotPress={onSlotPress}
                  activityText={slotData.text}
                  lessonId={lessonId}
                  {...(onSelectSlot && {
                    onSlotPressLegacy: () =>
                      onSelectSlot(dayIndex, periodIndex),
                  })}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  row: { flexDirection: "row", alignItems: "center" },
  periodCell: {
    width: 60,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  periodText: {
    color: "#29375C",
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Baloo2-SemiBold",
  },
  slotWrapper: {
    flex: 1,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 0,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f7f7f7",
  },
  currentDaySlot: {
    backgroundColor: "#BACDDD",
  },
});

export default ScheduleDay;

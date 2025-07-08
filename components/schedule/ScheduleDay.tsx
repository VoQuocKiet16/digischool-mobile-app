import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { Activity } from "../../app/students/schedule/schedule";
import { useUserData } from "../../hooks/useUserData";
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

const DAY_COL_WIDTH = 90;
const PERIOD_COL_WIDTH = 60;

function getTodayIndex() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
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
  currentDayIndex: propCurrentDayIndex,
  lessonIds,
  hideNullSlot = false,
}) => {
  const [currentDay, setCurrentDay] = useState(getTodayIndex());
  const currentDayIndex =
    propCurrentDayIndex !== undefined ? propCurrentDayIndex : currentDay;
  const { width } = useWindowDimensions();
  const numCols = days.length + 1;
  const colWidth = width / numCols;
  const [menuVisible, setMenuVisible] = useState(false);
  const { userData } = useUserData();
  const router = useRouter();

  const toggleMenuVisibility = () => setMenuVisible(!menuVisible);
  const handleLeaveRequest = () => {
    setMenuVisible(false);
    const role = userData?.roleInfo?.type;
    if (role === "teacher") {
      router.push("/teachers/leave_request/leave_request");
    } else {
      router.push("/students/leave_request/leave_request");
    }
  };
  const handleExportSchedule = () => {
    setMenuVisible(false);
    // TODO: Thực hiện chức năng xuất TKB ở đây
    alert("Chức năng xuất TKB!");
  };

  return (
    <View style={styles.table}>
      {/* Hàng tiêu đề ngày */}
      <View style={styles.row}>
        <View
          style={[
            styles.dayHeaderCell,
            { width: colWidth, justifyContent: "center", alignItems: "center" },
          ]}
        >
          <TouchableOpacity
            style={styles.utilityButton}
            onPress={toggleMenuVisibility}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-drop-down" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Dải phân cách */}
        <View style={{ width: 0.1, height: 22, backgroundColor: "#f7f7f7" }} />
        {days.map((day, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.dayHeaderCell,
              { width: colWidth },
              currentDayIndex === idx && styles.selectedDayButton,
            ]}
            onPress={() => setCurrentDay(idx)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayHeaderText,
                currentDayIndex === idx && styles.selectedDayText,
                day === "CN" && !(currentDayIndex === idx) && styles.sundayText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Modal menu utilityButton */}
      <Modal
        transparent={true}
        statusBarTranslucent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={toggleMenuVisibility}
      >
        <TouchableWithoutFeedback onPress={toggleMenuVisibility}>
          <View style={{ flex: 1 }}>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleExportSchedule}
              >
                <Text style={styles.menuItemText}>Xuất TKB ra</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLeaveRequest}
              >
                <Text style={styles.menuItemText}>Xin phép nghỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Các hàng tiết */}
      {periods.map((period, periodIndex) => (
        <View key={periodIndex} style={styles.row}>
          <View style={[styles.periodCell, { width: colWidth }]}>
            <Text style={styles.periodText}>{period}</Text>
          </View>
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
              slotText = "Thêm";
            }
            const isCurrentDay = currentDayIndex === dayIndex;
            if (hideNullSlot && (!slotData.text || slotData.text === "")) {
              return (
                <View
                  key={dayIndex}
                  style={[styles.slotWrapper, { width: colWidth }]}
                ></View>
              );
            }
            return (
              <View
                key={dayIndex}
                style={[
                  styles.slotWrapper,
                  { width: colWidth },
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
  table: {
    flexDirection: "column",
  },
  row: { flexDirection: "row", alignItems: "center" },
  periodCell: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  utilityButton: {
    backgroundColor: "#29375C",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 30,
  },
  dayHeaderCell: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f7f7f7",
  },
  dayHeaderText: {
    color: "#22304A",
    fontSize: 12,
    fontFamily: "Baloo2-Bold",
    textAlign: "center",
  },
  selectedDayButton: {
    backgroundColor: "#29375C",
    borderRadius: 10,
  },
  selectedDayText: {
    color: "#fff",
  },
  sundayText: {
    color: "red",
  },
  menuContainer: {
    position: "absolute",
    top: 280,
    left: 10,
    backgroundColor: "#29375C",
    borderRadius: 8,
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    padding: 15,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  periodText: {
    color: "#29375C",
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Baloo2-SemiBold",
  },
  slotWrapper: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
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

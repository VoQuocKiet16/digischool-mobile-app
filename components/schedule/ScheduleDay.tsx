import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { useUserData } from "../../hooks/useUserData";
import { PDFService } from "../../services/pdfService";
import { Activity } from "../../types/schedule.types";
import { fonts, responsive } from "../../utils/responsive";
import MenuDropdown from "../MenuDropdown";
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
  scheduleData: (Activity | null)[][];
  // Thêm prop để nhận toàn bộ dữ liệu
  fullScheduleData?: (Activity | null)[][];
  selectedSlots?: { row: number; col: number }[];
  onSelectSlot?: (dayIndex: number, periodIndex: number) => void;
  cellStatusData?: ("taught" | "current" | "exchangeable" | "default")[][];
  currentDayIndex?: number;
  lessonIds?: string[][];
  hideNullSlot?: boolean;
  isSwapLesson?: boolean;
  dateRange?: { start: string; end: string } | null;
  showUtilityButton?: boolean;
}

const DAY_COL_WIDTH = 90;
const PERIOD_COL_WIDTH = 60;

function getTodayIndex() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

// Hàm tính toán ngày cụ thể dựa trên dateRange và dayIndex
function getSpecificDate(
  dateRange: { start: string; end: string },
  dayIndex: number
): Date {
  const startDate = new Date(dateRange.start);
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + dayIndex);
  return date;
}

// Hàm format ngày thành chuỗi tiếng Việt
function formatVietnameseDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("vi-VN", options);
}

const ScheduleDay: React.FC<ScheduleDayProps> = ({
  periods,
  days,
  onAddActivity,
  onSlotPress,
  scheduleData,
  fullScheduleData,
  selectedSlots = [],
  onSelectSlot,
  cellStatusData,
  currentDayIndex: propCurrentDayIndex,
  lessonIds,
  hideNullSlot = false,
  isSwapLesson = false,
  dateRange,
  showUtilityButton = false,
}) => {
  const [currentDay, setCurrentDay] = useState(getTodayIndex());
  const currentDayIndex =
    propCurrentDayIndex !== undefined ? propCurrentDayIndex : currentDay;
  const { width } = useWindowDimensions();
  const numCols = days.length + 1;
  const colWidth = width / numCols;
  const { userData } = useUserData();
  const router = useRouter();
  const [dateInfoModalVisible, setDateInfoModalVisible] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState("");

  const handleLeaveRequest = () => {
    const role = userData?.roleInfo?.type;
    if (role === "teacher" || role === "homeroom_teacher") {
      router.push("/teachers/leave_request/leave_request");
    } else {
      router.push("/students/leave_request/leave_request");
    }
  };

  const handleExportSchedule = async () => {
    try {
      Alert.alert(
        "Xuất TKB",
        "Chọn hành động",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Xuất Dạng Bảng",
            onPress: async () => {            
              const exportData = {
                periods: ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5", "Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"],
                days,
                scheduleData: fullScheduleData || scheduleData,
                dateRange,
              };
              
              // Tạo PDF trực tiếp trên thiết bị
              const localFilePath = await PDFService.generateSchedulePDF(exportData, 'table');
              
              if (localFilePath) {
                Alert.alert(
                  "Thành công!",
                  "TKB đã được xuất ra file PDF\nFile đã được lưu vào thiết bị",
                  [
                    { text: "OK" },
                    {
                      text: "Mở file",
                      onPress: async () => {
                        await PDFService.openPDF(localFilePath);
                      },
                    },
                    {
                      text: "Chia sẻ",
                      onPress: async () => {
                        await PDFService.openPDF(localFilePath);
                      },
                    },
                  ]
                );
              } else {
                Alert.alert("Lỗi", "Không thể tạo PDF. Vui lòng thử lại!");
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xuất TKB. Vui lòng thử lại!");
    }
  };

  const menuItems = [
    {
      id: "export",
      title: "Xuất TKB ra",
      onPress: handleExportSchedule,
    },
    {
      id: "leave",
      title: "Xin phép nghỉ",
      onPress: handleLeaveRequest,
    },
  ];

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
          {showUtilityButton && (
            <MenuDropdown
              items={menuItems}
              anchorIcon="arrow-drop-down"
              anchorIconSize={responsive.isIPad() ? 32 : 24}
              anchorIconColor="#fff"
              anchorStyle={styles.utilityButton}
            />
          )}
        </View>
        {/* Dải phân cách */}
        <View style={{ width: 0.1, height: 22, backgroundColor: "#f7f7f7" }} />
        {days.map((day, idx) => (
          <TouchableOpacity
            key={`day-header-${idx}`}
            style={[
              styles.dayHeaderCell,
              { width: colWidth },
              currentDayIndex === idx && styles.selectedDayButton,
            ]}
            onPress={() => {
              setCurrentDay(idx);
              if (dateRange) {
                const specificDate = getSpecificDate(dateRange, idx);
                const formattedDate = formatVietnameseDate(specificDate);
                setSelectedDateInfo(`${formattedDate}`);
                setDateInfoModalVisible(true);
              }
            }}
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

      {/* Modal thông tin ngày */}
      <Modal
        visible={dateInfoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateInfoModalVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback
          onPress={() => setDateInfoModalVisible(false)}
        >
          <View style={styles.dateInfoModalOverlay}>
            <View style={styles.dateInfoModalContent}>
              <Text style={styles.dateInfoTitle}>Thông tin ngày</Text>
              <Text style={styles.dateInfoText}>{selectedDateInfo}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Các hàng tiết */}
      {periods.map((period, periodIndex) => (
        <View key={`period-${periodIndex}`} style={styles.row}>
          <View style={[styles.periodCell, { width: colWidth }]}>
            <Text style={styles.periodText}>{period}</Text>
          </View>
          {days.map((_, dayIndex) => {
            const slotData =
              scheduleData[periodIndex] && scheduleData[periodIndex][dayIndex]
                ? scheduleData[periodIndex][dayIndex]
                : { text: "", type: "default", hasNotification: false };
            
            // Ẩn slot null (slot completed đã bị lọc)
            if (slotData === null) {
              return (
                <View
                  key={`slot-${periodIndex}-${dayIndex}-null`}
                  style={[styles.slotWrapper, { width: colWidth }]}
                />
              );
            }
            
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
                  key={`slot-${periodIndex}-${dayIndex}-empty`}
                  style={[styles.slotWrapper, { width: colWidth }]}
                ></View>
              );
            }
            // Ẩn luôn slot mặc định không có lesson (text rỗng, type 'default') chỉ cho swap_lesson
            if (
              isSwapLesson &&
              (!slotData.text || slotData.text === "") &&
              slotData.type === "default"
            ) {
              return (
                <View
                  key={`slot-${periodIndex}-${dayIndex}-swap`}
                  style={[styles.slotWrapper, { width: colWidth }]}
                />
              );
            }
            return (
              <View
                key={`slot-${periodIndex}-${dayIndex}`}
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
                  type={slotData.type}
                  slotData={slotData}
                  isSwapLesson={isSwapLesson}
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
      paddingVertical: responsive.isIPad() ? 4 : 4,
      paddingHorizontal: responsive.isIPad() ? 4 : 6,
      borderRadius: responsive.isIPad() ? 8 : 8,
      alignItems: "center",
      justifyContent: "center",
      height: responsive.isIPad() ? 25 : 20,
      width: responsive.isIPad() ? 25 : 20,
    },
  dayHeaderCell: {
    height: responsive.isIPad() ? 70 : 40,
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
    fontFamily: fonts.bold,
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
  periodText: {
    color: "#29375C",
    fontSize: 15,
    textAlign: "center",
    fontFamily: fonts.semiBold,
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
  dateInfoModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dateInfoModalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  dateInfoTitle: {
    color: "#29375C",
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 10,
  },
  dateInfoText: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: "#29375C",
  },
});

export default ScheduleDay;






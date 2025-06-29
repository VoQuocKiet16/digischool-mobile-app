import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import DaySelector from "../../../components/schedule/DaySelector";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import type { Activity } from "../../students/schedule/schedule";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const PERIODS = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
// Dữ liệu mẫu cho dạy bù: mỗi slot là 1 trạng thái
const MOCK_SCHEDULE = [
  ["Toán", "Lý", "Hóa", "Sinh", "Sử", "Địa", "GDCD"],
  ["Văn", "Anh", "Toán", "Lý", "Hóa", "Sinh", "Sử"],
  ["Địa", "GDCD", "Toán", "Lý", "Hóa", "Sinh", "Văn"],
  ["Anh", "Toán", "Lý", "Hóa", "Sinh", "Sử", "Địa"],
  ["GDCD", "Văn", "Anh", "Toán", "Lý", "Hóa", "Sinh"],
];
// Các slot đã được chọn để dạy bù (taken)
const TAKEN_SLOTS = [
  { row: 0, col: 0 },
  { row: 1, col: 1 },
  { row: 2, col: 2 },
  { row: 3, col: 3 },
  { row: 4, col: 4 },
];
// Slot hiện tại (giáo viên đang chọn để dạy bù vào slot khác)
const CURRENT_SLOT = { row: 1, col: 2 };

const TODAY_INDEX = 3; // Thứ 4 (index 3)
const CURRENT_PERIOD_INDEX = 1; // Tiết 2 (index 1)

export default function SelectMakeupLessonScreen() {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    null
  );
  const router = useRouter();

  // Xác định trạng thái từng cell
  const cellStatusData = PERIODS.map((_, rowIdx) =>
    DAYS.map((_, colIdx) => {
      // Disable các tiết đã qua (cột < hôm nay)
      if (colIdx < TODAY_INDEX) return "taught";
      // Disable các tiết trước tiết hiện tại trong cùng ngày
      if (colIdx === TODAY_INDEX && rowIdx < CURRENT_PERIOD_INDEX)
        return "taught";
      // Tiết hiện tại
      if (colIdx === TODAY_INDEX && rowIdx === CURRENT_PERIOD_INDEX)
        return "current";
      // Các slot đã được chọn để dạy bù (taken)
      if (TAKEN_SLOTS.some((s) => s.row === rowIdx && s.col === colIdx))
        return "taught";
      // Slot hiện tại (giáo viên đang chọn để dạy bù vào slot khác)
      if (CURRENT_SLOT.row === rowIdx && CURRENT_SLOT.col === colIdx)
        return "current";
      return "exchangeable";
    })
  );

  // Chỉ cho chọn 1 slot trống (exchangeable)
  const handleSelect = (dayIndex: number, periodIndex: number) => {
    const row = periodIndex;
    const col = dayIndex;
    if (cellStatusData[row][col] !== "exchangeable") return;
    setSelected({ row, col });
  };

  // scheduleData: đúng type Activity[][]
  const scheduleData: Activity[][] = PERIODS.map((_, rowIdx) =>
    DAYS.map((_, colIdx) => {
      let value = MOCK_SCHEDULE[rowIdx]?.[colIdx] || "";
      return { text: value, type: "default", hasNotification: false };
    })
  );

  const isContinueEnabled = !!selected;

  const handleContinue = () => {
    if (isContinueEnabled) {
      // Xử lý tiếp tục, ví dụ chuyển trang hoặc lưu slot đã chọn
    }
  };

  return (
    <HeaderLayout
      title="Chọn tiết dạy bù"
      subtitle="Chọn tiết học trống để dạy bù"
      onBack={() => router.replace("/explore")}
    >
      <View style={styles.container}>
        <ScheduleHeader
          title="Buổi sáng"
          dateRange="12/6 - 19/6"
          year="2025"
          onPressTitle={() => {}}
        />
        <DaySelector days={DAYS} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <ScheduleDay
            periods={PERIODS}
            days={DAYS}
            onAddActivity={() => {}}
            scheduleData={scheduleData}
            selectedSlots={selected ? [selected] : []}
            onSelectSlot={handleSelect}
            cellStatusData={cellStatusData}
          />
        </ScrollView>
        {/* Chú thích */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBox,
                {
                  borderColor: "#B6B6B6",
                  borderStyle: "dashed",
                  backgroundColor: "#fff",
                },
              ]}
            />
            <Text style={styles.legendText}>Đã được chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBox,
                { backgroundColor: "#E5E7EB", borderColor: "#E5E7EB" },
              ]}
            />
            <Text style={styles.legendText}>Tiết hiện tại</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBox,
                {
                  borderColor: "#F9B233",
                  borderStyle: "dashed",
                  backgroundColor: "#fff",
                },
              ]}
            />
            <Text style={styles.legendText}>Tiết sẽ đổi</Text>
          </View>
        </View>
        {/* Nút tiếp tục */}
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !isContinueEnabled && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isContinueEnabled}
        >
          <Text style={styles.continueBtnText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 6,
  },
  legendText: {
    color: "#22315B",
    fontSize: 13,
    fontWeight: "500",
  },
  continueBtn: {
    backgroundColor: "#22315B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    opacity: 1,
  },
  continueBtnDisabled: {
    backgroundColor: "#A0A3BD",
    opacity: 0.7,
  },
  continueBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

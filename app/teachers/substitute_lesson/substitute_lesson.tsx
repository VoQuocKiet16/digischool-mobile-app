import { router } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
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

type PeriodCell = { row: number; col: number };

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const PERIODS = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
const MOCK_SCHEDULE = [
  // Mỗi dòng là 1 tiết, mỗi cột là 1 ngày
  [
    "Sinh học",
    "Sinh học",
    "Sinh học",
    "Sinh học",
    "Sinh học",
    "Sinh học",
    "Sinh học",
  ],
  ["Lịch sử", "Lịch sử", "Lịch sử", "Lịch sử", "Lịch sử", "Lịch sử", "Lịch sử"],
  ["Địa lý", "Địa lý", "Địa lý", "Địa lý", "Địa lý", "Địa lý", "Địa lý"],
  ["Toán", "Toán", "Toán", "Toán", "Toán", "Toán", "Toán"],
  ["Trống", "Trống", "Trống", "Trống", "Trống", "Trống", "Trống"],
];
const TODAY_INDEX = 2; // Thứ 4 (index 2)
const CURRENT_PERIOD_INDEX = 1; // Tiết 2 (index 1)
const TAUGHT_PERIODS = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
];

export default function SubstituteLesson() {
  const [selected, setSelected] = useState<PeriodCell[]>([]);

  const isTaught = (row: number, col: number) =>
    TAUGHT_PERIODS.some((p) => p.row === row && p.col === col);
  const isCurrent = (row: number, col: number) =>
    row === CURRENT_PERIOD_INDEX && col === TODAY_INDEX;
  const isSelected = (row: number, col: number) =>
    selected.some((p) => p.row === row && p.col === col);

  // Tạo cellStatusData cho từng ô
  const cellStatusData = PERIODS.map((_, rowIdx) =>
    DAYS.map((_, colIdx) => {
      // Disable các tiết đã qua (cột < hôm nay)
      if (colIdx < TODAY_INDEX) return "taught";
      // Disable các tiết trước tiết hiện tại trong cùng ngày
      if (colIdx === TODAY_INDEX && rowIdx < CURRENT_PERIOD_INDEX)
        return "taught";
      // Tiết hiện tại (thứ 4, tiết 2)
      if (colIdx === TODAY_INDEX && rowIdx === CURRENT_PERIOD_INDEX)
        return "current";
      // Các ô còn lại là exchangeable
      return "exchangeable";
    })
  );

  // Chỉ cho phép chọn các ô exchangeable
  const handleSelect = (dayIndex: number, periodIndex: number) => {
    const row = periodIndex;
    const col = dayIndex;
    if (cellStatusData[row][col] !== "exchangeable") return;
    if (isSelected(row, col)) {
      setSelected([]);
    } else {
      setSelected([{ row, col }]);
    }
  };

  // Chuyển đổi dữ liệu cho ScheduleDay (không render 'Thêm hoạt động')
  const scheduleData = PERIODS.map((_, rowIdx) =>
    DAYS.map((_, colIdx) => {
      const value = MOCK_SCHEDULE[rowIdx]?.[colIdx];
      let type: "default" | "user-added" = "default";
      if (cellStatusData[rowIdx][colIdx] === "taught") type = "user-added";
      if (cellStatusData[rowIdx][colIdx] === "current") type = "default";
      // Không render 'Thêm hoạt động', chỉ để chuỗi rỗng nếu null
      return { text: value ? value : "", type };
    })
  );

  const isContinueEnabled = selected.length === 1;

  const handleContinue = () => {
    if (isContinueEnabled) {
      router.replace("/teachers/confirm_substitute/confirm_substitute");
    }
  };

  return (
    <HeaderLayout
      title="Tiết học thay thế"
      subtitle="Chọn tiết học thay thế cho tiết học hiện tại"
      onBack={() => router.replace("/")}
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
            onSlotPress={handleSelect}
            scheduleData={scheduleData}
            selectedSlots={selected}
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
            <Text style={styles.legendText}>Đã được dạy</Text>
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
        <SafeAreaView style={{ backgroundColor: '#fff', marginBottom: 30, paddingHorizontal: 16 }}>
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
        </SafeAreaView>
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

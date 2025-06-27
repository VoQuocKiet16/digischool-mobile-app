import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const PERIODS = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
const SESSIONS = ["Buổi sáng"];
const MOCK_SCHEDULE = [
  // Mỗi dòng là 1 tiết, mỗi cột là 1 ngày
  [null, null, "Sinh học", "Sinh học", null, null, null],
  [null, "Lịch sử", null, "Lịch sử", null, null, null],
  [null, null, "Địa lý", "Địa lý", null, null, null],
  [null, null, "Toán", "Toán", null, null, null],
  [null, null, "Trống", "Trống", null, null, null],
];
const CURRENT_PERIOD = { row: 3, col: 2 }; // Tiết 4, Thứ 4
const TAUGHT_PERIODS = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
];

type PeriodCell = { row: number; col: number };

export default function TietHocThayThe() {
  const [selected, setSelected] = useState<PeriodCell[]>([]);

  const isTaught = (row: number, col: number) =>
    TAUGHT_PERIODS.some((p) => p.row === row && p.col === col);
  const isCurrent = (row: number, col: number) =>
    row === CURRENT_PERIOD.row && col === CURRENT_PERIOD.col;
  const isSelected = (row: number, col: number) =>
    selected.some((p) => p.row === row && p.col === col);

  const handleSelect = (row: number, col: number) => {
    if (isTaught(row, col) || isCurrent(row, col)) return;
    if (isSelected(row, col)) {
      setSelected(selected.filter((p) => !(p.row === row && p.col === col)));
    } else {
      setSelected([...selected, { row, col }]);
    }
  };

  return (
    <HeaderLayout
      title="Tiết học thay thế"
      subtitle="Chọn tiết học thay thế cho tiết học hiện tại"
      onBack={() => router.replace("/explore")}
    >
      <View style={styles.container}>
        {/* Buổi sáng + chọn tuần */}
        <View style={styles.sessionRow}>
          <Text style={styles.sessionText}>Buổi sáng</Text>
          <View style={styles.weekPicker}>
            <TouchableOpacity style={styles.weekBtn}>
              <Text style={styles.weekBtnText}>12/6 - 19/6</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.weekBtn}>
              <Text style={styles.weekBtnText}>2025</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Bảng tiết học */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeaderRow}>
              <View style={styles.tableHeaderCell}>
                <Text></Text>
              </View>
              {DAYS.map((d, i) => (
                <View key={i} style={styles.tableHeaderCell}>
                  <Text
                    style={i === 6 ? styles.sunday : styles.tableHeaderText}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </View>
            {PERIODS.map((period, rowIdx) => (
              <View key={rowIdx} style={styles.tableRow}>
                <View style={styles.tablePeriodCell}>
                  <Text style={styles.periodText}>{period}</Text>
                </View>
                {DAYS.map((_, colIdx) => {
                  const value = MOCK_SCHEDULE[rowIdx]?.[colIdx];
                  const taught = isTaught(rowIdx, colIdx);
                  const current = isCurrent(rowIdx, colIdx);
                  const selectedCell = isSelected(rowIdx, colIdx);
                  let cellStyle = styles.cell;
                  if (taught)
                    cellStyle = { ...cellStyle, ...styles.cellTaught };
                  if (current)
                    cellStyle = { ...cellStyle, ...styles.cellCurrent };
                  if (selectedCell)
                    cellStyle = { ...cellStyle, ...styles.cellSelected };
                  return (
                    <TouchableOpacity
                      key={colIdx}
                      style={cellStyle}
                      onPress={() => handleSelect(rowIdx, colIdx)}
                      disabled={taught || current}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cellText}>{value || ""}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        {/* Chú thích */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBox,
                { backgroundColor: "#E5E7EB", borderColor: "#B6B6B6" },
              ]}
            />
            <Text style={styles.legendText}>Đã được dạy</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBox,
                { backgroundColor: "#fff", borderColor: "#22315B" },
              ]}
            />
            <Text style={styles.legendText}>Tiết hiện tại</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBox,
                { backgroundColor: "#fff", borderColor: "#F9B233" },
              ]}
            />
            <Text style={styles.legendText}>Tiết sẽ đổi</Text>
          </View>
        </View>
        {/* Nút tiếp tục */}
        <TouchableOpacity style={styles.continueBtn} onPress={() => {}}>
          <Text style={styles.continueBtnText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 10,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 8,
  },
  sessionText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22315B",
  },
  weekPicker: {
    flexDirection: "row",
    alignItems: "center",
  },
  weekBtn: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  weekBtnText: {
    color: "#22315B",
    fontWeight: "bold",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  tableHeaderCell: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#22315B",
    fontSize: 15,
  },
  sunday: {
    fontWeight: "bold",
    color: "#E53935",
    fontSize: 15,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  tablePeriodCell: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  periodText: {
    fontWeight: "bold",
    color: "#22315B",
    fontSize: 15,
  },
  cell: {
    minWidth: 48,
    minHeight: 48,
    borderWidth: 1.2,
    borderColor: "#B6B6B6",
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  cellTaught: {
    backgroundColor: "#E5E7EB",
    borderColor: "#B6B6B6",
    borderStyle: "dashed",
  },
  cellCurrent: {
    borderColor: "#22315B",
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  cellSelected: {
    borderColor: "#F9B233",
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  cellText: {
    color: "#22315B",
    fontWeight: "bold",
    fontSize: 15,
  },
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
    backgroundColor: "#A0A3BD",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    opacity: 1,
  },
  continueBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

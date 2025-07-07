import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Line, Text as SvgText } from 'react-native-svg';
import Header from '../components/Header';

const BLOCKS = ["Khối 10", "Khối 11", "Khối 12"];
const SEMESTERS = ["Học kỳ I", "Học kỳ II"];
const WEEKS = Array.from({ length: 20 }, (_, i) => `Tuần ${i + 1}`);

// Dữ liệu bảng cho từng khối
const TABLE_DATA = [
  // Khối 10
  [
    { subject: 'Toán', data: [3,3,3,3,3] },
    { subject: 'Ngữ Văn', data: [2,2,3,2,2] },
    { subject: 'Vật lý', data: [3,1,3,3,3] },
    { subject: 'Hóa học', data: [2,2,2,2,2] },
    { subject: 'Sinh học', data: [3,3,3,3,3] },
    { subject: 'Lịch sử', data: [2,2,2,2,2] },
    { subject: 'Địa lý', data: [3,1,1,3,3] },
    { subject: 'GDCD', data: [2,2,2,2,2] },
    { subject: 'Ngoại ngữ', data: [3,3,3,3,3] },
    { subject: 'Thể dục', data: [2,2,2,2,2] },
    { subject: 'Giáo dục quốc phòng và an ninh', data: [2,2,2,2,2] },
    { subject: 'Tin học', data: [2,2,2,2,2] },
    { subject: 'Công nghệ', data: [2,2,2,2,2] },
  ],
  // Khối 11
  [
    { subject: 'Toán', data: [2,2,2,2,2] },
    { subject: 'Ngữ Văn', data: [2,2,2,2,2] },
    { subject: 'Vật lý', data: [2,2,2,2,2] },
    { subject: 'Hóa học', data: [2,2,2,2,2] },
    { subject: 'Sinh học', data: [2,2,2,2,2] },
    { subject: 'Lịch sử', data: [2,2,2,2,2] },
    { subject: 'Địa lý', data: [2,2,2,2,2] },
    { subject: 'GDCD', data: [2,2,2,2,2] },
    { subject: 'Ngoại ngữ', data: [2,2,2,2,2] },
    { subject: 'Thể dục', data: [2,2,2,2,2] },
    { subject: 'Giáo dục quốc phòng và an ninh', data: [2,2,2,2,2] },
    { subject: 'Tin học', data: [2,2,2,2,2] },
    { subject: 'Công nghệ', data: [2,2,2,2,2] },
  ],
  // Khối 12
  [
    { subject: 'Toán', data: [1,2,2,2,2] },
    { subject: 'Ngữ Văn', data: [2,2,2,2,2] },
    { subject: 'Vật lý', data: [2,2,2,2,2] },
    { subject: 'Hóa học', data: [2,2,2,2,2] },
    { subject: 'Sinh học', data: [2,2,2,2,2] },
    { subject: 'Lịch sử', data: [2,2,2,2,2] },
    { subject: 'Địa lý', data: [2,2,2,2,2] },
    { subject: 'GDCD', data: [2,2,2,2,2] },
    { subject: 'Ngoại ngữ', data: [2,2,2,2,2] },
    { subject: 'Thể dục', data: [2,2,2,2,2] },
    { subject: 'Giáo dục quốc phòng và an ninh', data: [2,2,2,2,2] },
    { subject: 'Tin học', data: [2,2,2,2,2] },
    { subject: 'Công nghệ', data: [2,2,2,2,2] },
  ],
];
const CLASS_LIST = [
  ['10A1','10A2','10A3','10A4','10A5'],
  ['11A1','11A2','11A3','11A4','11A5'],
  ['12A1','12A2','12A3','12A4','12A5'],
];

export default function ManageProcess() {
  const [block, setBlock] = useState(0);
  const [semester, setSemester] = useState(0);
  const [week, setWeek] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightRow, setHighlightRow] = useState<number|null>(null);
  const [highlightCol, setHighlightCol] = useState<number|null>(null);

  const handleSelect = (sIdx: number, wIdx: number) => {
    setSemester(sIdx);
    setWeek(wIdx);
    setShowDropdown(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <Header title="Tiến trình" name="QL Nguyễn Văn A" />
      {/* Filter lớn */}
      <View style={styles.filterBlockWrap}>
        <TouchableOpacity
          onPress={() => setBlock((block + BLOCKS.length - 1) % BLOCKS.length)}
          style={styles.arrowBtn}
        >
          <MaterialIcons name="chevron-left" size={24} color="#22304A" />
        </TouchableOpacity>
        <Text style={styles.blockTitle}>{BLOCKS[block]}</Text>
        <TouchableOpacity
          onPress={() => setBlock((block + 1) % BLOCKS.length)}
          style={styles.arrowBtn}
        >
          <MaterialIcons name="chevron-right" size={24} color="#22304A" />
        </TouchableOpacity>
      </View>
      {/* Filter nhỏ */}
      <View style={styles.filterSmallWrap}>
        <TouchableOpacity
          style={styles.filterComboBtn}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.filterComboText}>
            {SEMESTERS[semester]} - {WEEKS[week]}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
      {/* Dropdown chọn học kỳ/tuần */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownBox}>
            <Text style={styles.dropdownTitle}>Chọn học kỳ & tuần</Text>
            <View style={{ flexDirection: "row", gap: 18 }}>
              {/* Cột học kỳ */}
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownColTitle}>Học kỳ</Text>
                {SEMESTERS.map((s, sIdx) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.dropdownItem,
                      semester === sIdx && styles.dropdownItemActive,
                    ]}
                    onPress={() => handleSelect(sIdx, 0)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        semester === sIdx && styles.dropdownItemTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Cột tuần */}
              <View style={{ flex: 2 }}>
                <Text style={styles.dropdownColTitle}>Tuần</Text>
                <ScrollView
                  style={{ maxHeight: 220 }}
                  showsVerticalScrollIndicator={false}
                >
                  {WEEKS.map((w, wIdx) => (
                    <TouchableOpacity
                      key={w}
                      style={[
                        styles.dropdownItem,
                        week === wIdx && styles.dropdownItemActive,
                      ]}
                      onPress={() => handleSelect(semester, wIdx)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          week === wIdx && styles.dropdownItemTextActive,
                        ]}
                      >
                        {w}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
      {/* Chú thích màu */}
      <View style={styles.legendRowTable}>
        <View style={styles.legendItemTable}>
          <View style={[styles.legendDotTable, {backgroundColor:'#F04438'}]} />
          <Text style={styles.legendTextTable}>Thiếu tiết</Text>
        </View>
        <View style={styles.legendItemTable}>
          <View style={[styles.legendDotTable, {backgroundColor:'#2CB654'}]} />
          <Text style={styles.legendTextTable}>Đủ tiết</Text>
        </View>
        <View style={styles.legendItemTable}>
          <View style={[styles.legendDotTable, {backgroundColor:'#F9A825'}]} />
          <Text style={styles.legendTextTable}>Dư tiết</Text>
        </View>
      </View>
      {/* Bảng thống kê tiết dạy */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{width: '100%'}}> 
        <ScrollView style={styles.tableWrap} contentContainerStyle={{paddingBottom: 24}} showsVerticalScrollIndicator={false}>
          {/* Header chéo */}
          <View style={styles.tableRow}>
            <View style={styles.tableCorner}>
              <Svg width={60} height={44}>
                <Line x1="0" y1="0" x2="60" y2="44" stroke="#444" strokeWidth="2" />
                <SvgText
                  x={6}
                  y={34}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#444"
                  fontFamily="Baloo2-Bold"
                >Môn</SvgText>
                <SvgText
                  x={36}
                  y={18}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#444"
                  fontFamily="Baloo2-Bold"
                >Lớp</SvgText>
              </Svg>
            </View>
            {CLASS_LIST[block].map((cls, colIdx) => (
              <TouchableOpacity
                key={cls}
                style={[styles.tableHeaderCell, highlightCol===colIdx && styles.tableColHighlight]}
                onPress={() => setHighlightCol(colIdx===highlightCol?null:colIdx)}
                activeOpacity={0.7}
              >
                <Text style={styles.tableHeaderText}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Dữ liệu mẫu */}
          {TABLE_DATA[block].map((row, rowIdx) => (
            <View style={[styles.tableRow, highlightRow===rowIdx && styles.tableRowHighlight]} key={row.subject}>
              <TouchableOpacity
                style={[styles.tableSubjectCell, highlightRow===rowIdx && styles.tableRowHighlight]}
                onPress={() => setHighlightRow(rowIdx===highlightRow?null:rowIdx)}
                activeOpacity={0.7}
              >
                <Text style={styles.tableSubjectText}>{row.subject}</Text>
              </TouchableOpacity>
              {row.data.map((val, colIdx) => {
                // Quy tắc màu: xanh (đủ), cam (dạy trước), đỏ (chưa đủ)
                let color = '#2CB654'; // xanh
                if ((row.subject==='Ngữ Văn' && colIdx===2 && val===3) || (row.subject==='Sinh học' && val===3) || (row.subject==='Toán' && val===3) || (row.subject==='Vật lý' && val===3) || (row.subject==='Ngoại ngữ' && val===3)) color = '#F9A825'; // cam
                if ((row.subject==='Vật lý' && colIdx===1 && val===1) || (row.subject==='Địa lý' && (colIdx===1||colIdx===2) && val===1)) color = '#F04438'; // đỏ
                if ((row.subject==='Ngữ Văn' && colIdx<2 && val===2) || (row.subject==='Hóa học' && val===2) || (row.subject==='Lịch sử' && val===2) || (row.subject==='GDCD' && val===2) || (row.subject==='Thể dục' && val===2) || (row.subject==='Giáo dục quốc phòng và an ninh' && val===2) || (row.subject==='Tin học' && val===2) || (row.subject==='Công nghệ' && val===2)) color = '#2CB654'; // xanh
                const highlight = highlightRow===rowIdx || highlightCol===colIdx;
                return (
                  <View style={[styles.tableCell, highlight && styles.tableCellHighlight]} key={colIdx}>
                    <Text style={[styles.tableCellText, {color}]}>{val}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 44,
    height: 44,
    resizeMode: "contain",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22304A",
    fontFamily: "Baloo2-Bold",
  },
  studentName: {
    fontSize: 14,
    color: "#22304A",
    marginTop: 2,
    fontFamily: "Baloo2-Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6eef2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  filterBlockWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22304A",
    fontFamily: "Baloo2-Bold",
    marginHorizontal: 18,
  },
  arrowBtn: {
    padding: 6,
  },
  filterSmallWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  filterComboBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22304A",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "center",
    marginTop: 0,
  },
  filterComboText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Baloo2-Bold",
    letterSpacing: 0.2,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  dropdownBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    minWidth: 220,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "flex-start",
    gap: 10,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22304A",
    marginBottom: 10,
    alignSelf: "center",
  },
  dropdownColTitle: {
    fontSize: 15,
    color: "#22304A",
    fontWeight: "bold",
    marginBottom: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  dropdownItemActive: {
    backgroundColor: "#22304A",
  },
  dropdownItemText: {
    color: "#22304A",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownItemTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  tableWrap: {
    marginTop: 18,
    width: 480,
    backgroundColor: '#F7F7F7',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tableCorner: {
    width: 60,
    height: 44,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  tableHeaderCell: {
    flex: 1,
    backgroundColor: '#BFC6D1',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  tableHeaderText: {
    fontSize: 16,
    color: '#444',
    fontWeight: 'bold',
  },
  tableSubjectCell: {
    width: 60,
    backgroundColor: '#E5E7EB',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  tableSubjectText: {
    fontSize: 10,
    color: '#444',
    fontWeight: 'bold',
    // alignContent:'center'
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  tableCellText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableRowHighlight: {
    backgroundColor: '#E3F2FD',
  },
  tableColHighlight: {
    backgroundColor: '#E3F2FD',
  },
  tableCellHighlight: {
    backgroundColor: '#E3F2FD',
  },
  legendRowTable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
    gap: 18,
  },
  legendItemTable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  legendDotTable: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  legendTextTable: {
    fontSize: 13,
    color: '#444',
  },
});

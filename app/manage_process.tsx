import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Line, Text as SvgText } from 'react-native-svg';
import Header from '../components/Header';
import { fonts } from "../utils/responsive";

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
    { subject: 'GDQP', data: [2,2,2,2,2] },
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
    { subject: 'GDQP', data: [2,2,2,2,2] },
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
    { subject: 'GDQP', data: [2,2,2,2,2] },
    { subject: 'Tin học', data: [2,2,2,2,2] },
    { subject: 'Công nghệ', data: [2,2,2,2,2] },
  ],
];

const CLASS_LIST = [
  ['10A1','10A2','10A3','10A4','10A5'],
  ['11A1','11A2','11A3','11A4','11A5'],
  ['12A1','12A2','12A3','12A4','12A5'],
];

// Dữ liệu yêu cầu số tiết cho từng môn học (data cứng)
const REQUIRED_LESSONS: { [key: string]: number } = {
  'Toán': 4,
  'Ngữ Văn': 4,
  'Vật lý': 3,
  'Hóa học': 2,
  'Sinh học': 3,
  'Lịch sử': 2,
  'Địa lý': 2,
  'GDCD': 2,
  'Ngoại ngữ': 3,
  'Thể dục': 2,
  'GDQP': 2,
  'Tin học': 2,
  'Công nghệ': 2,
};

export default function ManageProcess() {
  const [block, setBlock] = useState(0);
  const [semester, setSemester] = useState(0);
  const [week, setWeek] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [highlightRow, setHighlightRow] = useState<number|null>(null);
  const [highlightCol, setHighlightCol] = useState<number|null>(null);
  const [userName, setUserName] = useState("");
  const [configData, setConfigData] = useState<{ [key: string]: number }>(REQUIRED_LESSONS);

  useEffect(() => {
    AsyncStorage.getItem("userName").then(name => {
      if (name) setUserName(name);
    });
  }, []);

  const handleSelect = (sIdx: number, wIdx: number) => {
    setSemester(sIdx);
    setWeek(wIdx);
    setShowDropdown(false);
  };

  const handleConfigChange = (subject: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setConfigData(prev => ({
      ...prev,
      [subject]: numValue
    }));
  };

  const getCellColor = (subject: string, actualLessons: number) => {
    const required = configData[subject] || 0;
    
    if (actualLessons === required) {
      return '#2CB654'; // Xanh - đủ tiết
    } else if (actualLessons > required) {
      return '#F9A825'; // Vàng - dư tiết (dạy bù)
    } else {
      return '#F04438'; // Đỏ - thiếu tiết
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      {/* Header */}
      <Header title="Tiến trình" name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"} />
      
      {/* Filter lớn */}
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setBlock((block + BLOCKS.length - 1) % BLOCKS.length)}
            style={styles.arrowBtn}
          >
            <MaterialIcons name="chevron-left" size={24} color="#29375C" />
          </TouchableOpacity>
          <Text style={styles.title}>{BLOCKS[block]}</Text>
          <TouchableOpacity
            onPress={() => setBlock((block + 1) % BLOCKS.length)}
            style={styles.arrowBtn}
          >
            <MaterialIcons name="chevron-right" size={24} color="#29375C" />
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
          
          {/* Icon cấu hình */}
          <TouchableOpacity
            style={styles.configBtn}
            onPress={() => setShowConfigModal(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="settings" size={20} color="#fff" />
            <Text style={styles.configText}>Cấu hình</Text>
          </TouchableOpacity>
        </View>
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

      {/* Modal cấu hình số tiết */}
      <Modal
        visible={showConfigModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
      >
        <Pressable
          style={styles.configOverlay}
          onPress={() => {}} // Không làm gì khi nhấn overlay
        >
          <View style={styles.configBox}>
            {/* Header */}
            <View style={styles.configHeader}>
              <View style={styles.configTitleWrap}>
                <MaterialIcons name="settings" size={24} color="#29375C" />
                <Text style={styles.configTitle}>Cấu hình số tiết yêu cầu</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowConfigModal(false)}>
                <MaterialIcons name="close" size={24} color="#29375C" />
              </TouchableOpacity>
            </View>
            
            {/* Divider */}
            <View style={styles.configDivider} />
            
            {/* Content */}
            <ScrollView style={styles.configContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.configSubtitle}>
                Thiết lập số tiết tối thiểu cho từng môn học mỗi tuần
              </Text>
              
              <View style={styles.configGrid}>
                {Object.keys(configData).map((subject, index) => (
                  <View key={subject} style={styles.configItem}>
                    <View style={styles.configItemHeader}>
                      <Text style={styles.configSubjectText}>{subject}</Text>
                    </View>
                    <View style={styles.configInputWrap}>
                      <Text style={styles.configInputLabel}>Tiết/tuần</Text>
                      <TextInput
                        style={styles.configInput}
                        value={configData[subject].toString()}
                        onChangeText={(value) => handleConfigChange(subject, value)}
                        keyboardType="numeric"
                        maxLength={2}
                        textAlign="center"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            {/* Footer */}
            <View style={styles.configFooter}>
              <TouchableOpacity
                style={styles.configSaveBtn}
                onPress={() => {
                  // Lưu cấu hình vào AsyncStorage hoặc state
                  console.log('Đã lưu cấu hình:', configData);
                  // Có thể thêm logic lưu vào AsyncStorage ở đây
                }}
              >
                <Text style={styles.configSaveText}>Lưu cấu hình</Text>
              </TouchableOpacity>
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
                  // fontFamily=fonts.bold
                >Môn</SvgText>
                <SvgText
                  x={36}
                  y={18}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#444"
                  // fontFamily=fonts.bold
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
                const color = getCellColor(row.subject, val);
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
  container: {
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowBtn: {
    padding: 12,
  },
  title: {
    fontSize: 40,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    marginHorizontal: 12,
    letterSpacing: 2,
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
    backgroundColor: "#29375C",
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
    fontFamily: fonts.bold,
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
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  dropdownColTitle: {
    fontSize: 15,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    marginBottom: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 3,
    marginBottom: 4,
  },
  dropdownItemActive: {
    backgroundColor: "#D7DCE5",
  },
  dropdownItemText: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  dropdownItemTextActive: {
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
  },
  configBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29375C',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
    marginLeft: 10,
  },
  configText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginLeft: 5,
  },
  configOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  configBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  configTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  configTitle: {
    fontSize: 20,
    color: '#29375C',
    fontFamily: 'Baloo2-Bold',
  },
  closeBtn: {
    padding: 5,
  },
  configDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 15,
  },
  configContent: {
    marginBottom: 20,
    maxHeight: 300,
  },
  configSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    fontFamily: fonts.medium,
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  configItem: {
    width: '48%',
    borderRadius: 8,
    padding: 8,
  },
  configItemHeader: {
    marginBottom: 6,
  },
  configSubjectText: {
    fontSize: 14,
    color: '#29375C',
    fontFamily: 'Baloo2-SemiBold',
    marginBottom: 4,
  },
  configInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29375C',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  configInputLabel: {
    fontSize: 12,
    color: '#fff',
    fontFamily: fonts.medium,
    marginRight: 4,
  },
  configInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontFamily: fonts.bold,
    textAlign: 'right',
  },
  configFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  configCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  configCancelText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  configSaveBtn: {
    flex: 1,
    backgroundColor: '#29375C',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  configSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  tableWrap: {
    marginTop: 18,
    marginBottom: 100,
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
    fontFamily: "Baloo2-Bold",
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
    fontFamily: "Baloo2-Bold",
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
    fontFamily: "Baloo2-Bold",
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
    fontFamily: "Baloo2-Medium",
  },
});

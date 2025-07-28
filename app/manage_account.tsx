import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { fonts } from "../utils/responsive";

const FILTERS = ["Học sinh", "Giáo viên"];
const BLOCKS = ["Khối 10", "Khối 11", "Khối 12"];
const CLASSES = [
  ["10A1", "10A2", "10A3", "10A4", "10A5"],
  ["11A1", "11A2", "11A3", "11A4", "11A5"],
  ["12A1", "12A2", "12A3", "12A4", "12A5"],
];

export default function ManageAccount() {
  const navigation = useNavigation();
  const router = useRouter();
  const [filterIdx, setFilterIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [blockIdx, setBlockIdx] = useState<number|null>(null);
  const [classIdx, setClassIdx] = useState<number|null>(null);
  const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("userName").then(name => {
      if (name) setUserName(name);
    });
  }, []);

  // Dữ liệu mẫu
  const students = [
    { name: 'Nguyen Van A', class: '10A1', code: 'HS-101', avatar: require('../assets/images/avt_default.png') },
    { name: 'Nguyen Van B', class: '10A2', code: 'HS-102', avatar: require('../assets/images/avt_default.png') },
    { name: 'Nguyen Van C', class: '10A3', code: 'HS-103', avatar: require('../assets/images/avt_default.png') },
    { name: 'Nguyen Van D', class: '10A4', code: 'HS-104', avatar: require('../assets/images/avt_default.png') },
  ];
  const teachers = [
    { name: 'Tran Thi B', subject: 'Toán', code: 'GV-201', avatar: require('../assets/images/avt_default.png') },
    { name: 'Le Van C', subject: 'Vật lý', code: 'GV-202', avatar: require('../assets/images/avt_default.png') },
    { name: 'Pham Van D', subject: 'Ngữ Văn', code: 'GV-203', avatar: require('../assets/images/avt_default.png') },
    { name: 'Nguyen Thi E', subject: 'Hóa học', code: 'GV-204', avatar: require('../assets/images/avt_default.png') },
  ];
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <Header title="Tài khoản" name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"} />
      
      {/* Filter chọn Học sinh/Giáo viên */}
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => setFilterIdx((filterIdx - 1 + FILTERS.length) % FILTERS.length)}
          >
            <MaterialIcons name="chevron-left" size={24} color="#29375C" />
          </TouchableOpacity>
          <Text style={styles.title}>{FILTERS[filterIdx]}</Text>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => setFilterIdx((filterIdx + 1) % FILTERS.length)}
          >
            <MaterialIcons name="chevron-right" size={24} color="#29375C" />
          </TouchableOpacity>
        </View>
        
        {/* Search box và filter nâng cao */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#29375C" style={{marginLeft: 8, marginRight: 4}} />
            <TextInput
              style={styles.searchInput}
              placeholder={filterIdx === 0 ? "Tìm học sinh..." : "Tìm giáo viên..."}
              placeholderTextColor="#29375C99"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.advFilterBtn} onPress={() => setShowFilter(true)}>
            <MaterialIcons name="tune" size={22} color="#29375C" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Danh sách tài khoản */}
      <ScrollView 
        style={styles.accountListWrap} 
        contentContainerStyle={{paddingBottom: 64}} 
        showsVerticalScrollIndicator={false}
      >
        {filterIdx === 0
          ? filteredStudents.map((s, idx) => (
              <View style={styles.accountCard} key={idx}>
                <View style={styles.accountRow}>
                  <View style={styles.accountAvatarBox}>
                    <Image source={s.avatar} style={styles.accountAvatar} />
                  </View>
                  <View style={{flex:1, justifyContent:'center'}}>
                    <Text style={styles.accountName}>[HS] {s.name}</Text>
                    <Text style={styles.accountClass}>Lớp: {s.class}</Text>
                    <Text style={styles.accountCode}>Mã học sinh: {s.code}</Text>
                  </View>
                  <TouchableOpacity style={styles.accountDetailBtn} onPress={() => router.push('/manage/detail_account')}>
                    <Text style={styles.accountDetailText}>Xem chi tiết</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#29375C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          : filteredTeachers.map((t, idx) => (
              <View style={styles.accountCard} key={idx}>
                <View style={styles.accountRow}>
                  <View style={styles.accountAvatarBox}>
                    <Image source={t.avatar} style={styles.accountAvatar} />
                  </View>
                  <View style={{flex:1, justifyContent:'center'}}>
                    <Text style={styles.accountName}>[GV] {t.name}</Text>
                    <Text style={styles.accountClass}>Bộ môn: {t.subject}</Text>
                    <Text style={styles.accountCode}>Mã giáo viên: {t.code}</Text>
                  </View>
                  <TouchableOpacity style={styles.accountDetailBtn} onPress={() => router.push('/manage/detail_account')}>
                    <Text style={styles.accountDetailText}>Xem chi tiết</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#29375C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
      </ScrollView>
      
      {/* Nút thêm tài khoản (PlusIcon) */}
      <View style={styles.plusIconWrap}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.plusIconCircle} 
          onPress={() => router.push('/manage/add_account')}
        >
          <MaterialIcons name="add" size={36} color="#29375C" />
        </TouchableOpacity>
      </View>
      
      {/* Modal bộ lọc nâng cao */}
      <Modal visible={showFilter} transparent animationType="fade" statusBarTranslucent={true}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowFilter(false)} />
        <View style={styles.filterModalBox}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <MaterialIcons name="close" size={28} color="#29375C" />
            </TouchableOpacity>
          </View>
          <View style={styles.filterModalDivider} />
          
          {/* Filter khối */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Khối</Text>
              <TouchableOpacity 
                style={styles.dropdownTouchable}
                onPress={() => {setBlockDropdownOpen(v=>!v); setClassDropdownOpen(false);}}
              >
                <Text style={styles.dropdownText}>
                  {blockIdx!==null ? BLOCKS[blockIdx] : 'Chọn khối'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={22} color="#29375C" />
              </TouchableOpacity>
              {blockDropdownOpen && (
                <View style={styles.dropdownList}>
                  {BLOCKS.map((b, idx) => (
                    <TouchableOpacity 
                      key={b} 
                      style={styles.dropdownItem} 
                      onPress={() => {setBlockIdx(idx); setClassIdx(null); setBlockDropdownOpen(false);}}
                    >
                      <Text style={styles.dropdownItemText}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          {/* Filter lớp */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Lớp</Text>
              <TouchableOpacity
                style={[styles.dropdownTouchable, {opacity: blockIdx===null?0.5:1}]}
                disabled={blockIdx===null}
                onPress={() => {setClassDropdownOpen(v=>!v); setBlockDropdownOpen(false);}}
              >
                <Text style={styles.dropdownText}>
                  {blockIdx!==null && classIdx!==null ? CLASSES[blockIdx][classIdx] : 'Chọn lớp'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={22} color="#29375C" />
              </TouchableOpacity>
              {classDropdownOpen && blockIdx!==null && (
                <View style={styles.dropdownList}>
                  {CLASSES[blockIdx].map((c, idx) => (
                    <TouchableOpacity 
                      key={c} 
                      style={styles.dropdownItem} 
                      onPress={() => {setClassIdx(idx); setClassDropdownOpen(false);}}
                    >
                      <Text style={styles.dropdownItemText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          {/* Nút tìm kiếm */}
          <TouchableOpacity style={styles.filterModalBtn} onPress={() => setShowFilter(false)}>
            <Text style={styles.filterModalBtnText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 5,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D7DCE5",
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
    marginRight: 8,
    maxWidth: 280,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#29375C",
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontFamily: "Baloo2-Medium",
  },
  advFilterBtn: {
    backgroundColor: "#D7DCE5",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  accountListWrap: {
    marginTop: 10,
    marginHorizontal: 0,
  },
  accountCard: {
    marginTop: 12,
    marginBottom: 0,
    marginHorizontal: 0,
    padding: 16,
    flexDirection: "column",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountAvatarBox: {
    marginRight: 14,
  },
  accountAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E9EBF0",
  },
  accountName: {
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    fontSize: 15,
    marginBottom: 2,
  },
  accountClass: {
    color: "#29375C",
    fontSize: 13,
    marginBottom: 0,
    fontFamily: "Baloo2-Medium",
  },
  accountCode: {
    color: "#29375C",
    fontSize: 13,
    marginBottom: 0,
    fontFamily: "Baloo2-Medium",
  },
  accountDetailBtn: {
    backgroundColor: "#D7DCE5",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginLeft: 10,
  },
  accountDetailText: {
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 15,
    marginRight: 6,
  },
  plusIconWrap: {
    position: "absolute",
    right: 24,
    bottom: 120,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    opacity: 0.7,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 8,
  },
  filterModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.13)",
    zIndex: 1,
  },
  filterModalBox: {
    position: "absolute",
    top: "50%",
    left: "5%",
    right: "5%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    paddingHorizontal: 25,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -150 }],
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterModalTitle: {
    fontSize: 22,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
  },
  filterModalDivider: {
    height: 1,
    backgroundColor: "#29375C",
    marginBottom: 15,
    borderRadius: 10,
    width: "50%",
    alignSelf: "center",
  },
  filterModalLabel: {
    fontSize: 15,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    marginTop: 10,
    marginBottom: 4,
  },
  filterModalBtn: {
    backgroundColor: "#29375C",
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  filterModalBtnText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 17,
  },
  fieldWrap: {
    marginBottom: 15,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: "#fff",
    marginTop: 8,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    zIndex: 2,
  },
  dropdownTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dropdownText: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
  },
  dropdownList: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "108%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#29375C",
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
  },
});

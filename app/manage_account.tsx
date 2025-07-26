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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Tài khoản" name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"} />
      {/* Filter chọn Học sinh/Giáo viên */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setFilterIdx((filterIdx - 1 + FILTERS.length) % FILTERS.length)}>
          <MaterialIcons name="chevron-left" size={22} color="#22304A" />
        </TouchableOpacity>
        <Text style={styles.filterTitle}>{FILTERS[filterIdx]}</Text>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setFilterIdx((filterIdx + 1) % FILTERS.length)}>
          <MaterialIcons name="chevron-right" size={22} color="#22304A" />
        </TouchableOpacity>
      </View>
      {/* Search box và filter nâng cao */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#22304A" style={{marginLeft: 8, marginRight: 4}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm học sinh..."
            placeholderTextColor="#22304A99"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.advFilterBtn} onPress={() => setShowFilter(true)}>
          <MaterialIcons name="tune" size={22} color="#22304A" />
        </TouchableOpacity>
      </View>
      {/* Danh sách tài khoản */}
      <ScrollView style={styles.accountListWrap} contentContainerStyle={{paddingBottom: 64}} showsVerticalScrollIndicator={false}>
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
                    <MaterialIcons name="chevron-right" size={20} color="#fff" />
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
                    <MaterialIcons name="chevron-right" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
      </ScrollView>
      {/* Nút thêm tài khoản (PlusIcon) */}
      <View style={styles.plusIconWrap}>
        <TouchableOpacity activeOpacity={0.8} style={styles.plusIconCircle} onPress={() => router.push('/manage/add_account')}>
          <MaterialIcons name="add" size={36} color="#22304A" />
        </TouchableOpacity>
      </View>
      {/* Modal bộ lọc nâng cao */}
      <Modal visible={showFilter} transparent animationType="fade"
      statusBarTranslucent={true}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowFilter(false)} />
        <View style={styles.filterModalBox}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 8}}>
            <Text style={styles.filterModalTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <MaterialIcons name="close" size={28} color="#22304A" />
            </TouchableOpacity>
          </View>
          <View style={styles.filterModalDivider} />
          {/* Filter khối */}
          <Text style={styles.filterModalLabel}>Khối</Text>
          <View style={styles.filterModalDropdownWrap}>
            <TouchableOpacity style={styles.filterModalDropdown} onPress={() => {setBlockDropdownOpen(v=>!v); setClassDropdownOpen(false);}}>
              <Text style={styles.filterModalDropdownText}>{blockIdx!==null ? BLOCKS[blockIdx] : 'Chọn khối'}</Text>
              <MaterialIcons name="arrow-drop-down" size={22} color="#22304A" />
            </TouchableOpacity>
            {blockDropdownOpen && (
              <View style={styles.filterModalDropdownList}>
                {BLOCKS.map((b, idx) => (
                  <TouchableOpacity key={b} style={styles.filterModalDropdownItem} onPress={() => {setBlockIdx(idx); setClassIdx(null); setBlockDropdownOpen(false);}}>
                    <Text style={styles.filterModalDropdownItemText}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {/* Filter lớp */}
          <Text style={styles.filterModalLabel}>Lớp</Text>
          <View style={styles.filterModalDropdownWrap}>
            <TouchableOpacity
              style={[styles.filterModalDropdown, {opacity: blockIdx===null?0.5:1}]}
              disabled={blockIdx===null}
              onPress={() => {setClassDropdownOpen(v=>!v); setBlockDropdownOpen(false);}}
            >
              <Text style={styles.filterModalDropdownText}>{blockIdx!==null && classIdx!==null ? CLASSES[blockIdx][classIdx] : 'Chọn lớp'}</Text>
              <MaterialIcons name="arrow-drop-down" size={22} color="#22304A" />
            </TouchableOpacity>
            {classDropdownOpen && blockIdx!==null && (
              <View style={styles.filterModalDropdownList}>
                {CLASSES[blockIdx].map((c, idx) => (
                  <TouchableOpacity key={c} style={styles.filterModalDropdownItem} onPress={() => {setClassIdx(idx); setClassDropdownOpen(false);}}>
                    <Text style={styles.filterModalDropdownItemText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    gap: 8,
  },
  arrowBtn: {
    padding: 6,
  },
  filterTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22304A',
    fontFamily: fonts.bold,
    marginHorizontal: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#22304A',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  advFilterBtn: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountListWrap: {
    marginTop: 10,
    marginHorizontal: 0,
  },
  accountCard: {
    backgroundColor: '#F7F8FA',
    // borderRadius: 16,
    marginTop: 12,
    marginBottom: 0,
    marginHorizontal: 0,
    padding: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountAvatarBox: {
    marginRight: 14,
  },
  accountAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E9EBF0',
  },
  accountName: {
    fontWeight: 'bold',
    color: '#22304A',
    fontSize: 15,
    marginBottom: 2,
  },
  accountClass: {
    color: '#22304A',
    fontSize: 13,
    marginBottom: 0,
  },
  accountCode: {
    color: '#22304A',
    fontSize: 13,
    marginBottom: 0,
  },
  accountDetailBtn: {
    backgroundColor: '#7B859C',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginLeft: 10,
  },
  accountDetailText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 6,
  },
  filterModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.13)',
    zIndex: 1,
  },
  filterModalBox: {
    position: 'absolute',
    top: '18%',
    left: '5%',
    right: '5%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
  },
  filterModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22304A',
  },
  filterModalDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 8,
  },
  filterModalLabel: {
    fontSize: 15,
    color: '#22304A',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  filterModalDropdownWrap: {
    marginBottom: 8,
    position: 'relative',
  },
  filterModalDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#22304A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  filterModalDropdownText: {
    color: '#22304A',
    fontSize: 16,
    fontWeight: '500',
  },
  filterModalDropdownList: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#22304A',
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 8,
  },
  filterModalDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterModalDropdownItemText: {
    color: '#22304A',
    fontSize: 16,
  },
  filterModalBtn: {
    backgroundColor: '#7B859C',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  filterModalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  plusIconWrap: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
});

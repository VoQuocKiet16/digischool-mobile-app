import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import ManageService, { AccountData, AccountsResponse } from "../services/manage.service";

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
  const [loading, setLoading] = useState(false);
  
  // State cho dữ liệu từ API
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [classesByGrade, setClassesByGrade] = useState<string[]>([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State cho filter (không tự động apply)
  const [tempBlockIdx, setTempBlockIdx] = useState<number|null>(null);
  const [tempClassIdx, setTempClassIdx] = useState<number|null>(null);

  useEffect(() => {
    AsyncStorage.getItem("userName").then(name => {
      if (name) setUserName(name);
    });
    
    // Load dữ liệu ban đầu
    loadAccounts();
  }, []);

  // Load dữ liệu khi thay đổi filter (chỉ khi có thay đổi thực sự)
  useEffect(() => {
    setCurrentPage(1); // Reset về trang đầu khi thay đổi filter
    loadAccounts();
  }, [filterIdx, search, blockIdx, classIdx]);

  // Load dữ liệu khi thay đổi page
  useEffect(() => {
    if (currentPage > 1) {
      loadAccounts();
    }
  }, [currentPage]);

  // Load danh sách tài khoản
  const loadAccounts = async () => {
    try {
      setLoading(true);
      
      const role = filterIdx === 0 ? 'student' : 'teacher';
      const filters: any = {
        role,
        page: currentPage,
        limit: 20
      };
      
      if (search) filters.search = search;
      if (blockIdx !== null) filters.gradeLevel = 10 + blockIdx;
      if (classIdx !== null && blockIdx !== null) {
        filters.className = CLASSES[blockIdx][classIdx];
      }

      const data: AccountsResponse = await ManageService.getAccountsForManagement(filters);
      setAccounts(data.accounts);
      setTotalAccounts(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách lớp theo khối
  const loadClassesByGrade = async (gradeLevel: number) => {
    try {
      const classes = await ManageService.getClassesByGradeForManagement(gradeLevel);
      
      // Xử lý cả trường hợp trả về string[] hoặc object array
      if (classes && classes.length > 0) {
        if (typeof classes[0] === 'string') {
          setClassesByGrade(classes as string[]);
        } else {
          // Nếu là object array, extract className
          const classNames = classes.map((cls: any) => cls.className || cls.name || cls);
          setClassesByGrade(classNames);
        }
      } else {
        setClassesByGrade([]);
      }
    } catch (error) {
      setClassesByGrade([]);
    }
  };

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
          <TouchableOpacity 
            style={styles.advFilterBtn} 
            onPress={() => {
              // Khởi tạo temp state với giá trị hiện tại
              setTempBlockIdx(blockIdx);
              setTempClassIdx(classIdx);
              setShowFilter(true);
            }}
          >
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải danh sách tài khoản...</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Không tìm thấy tài khoản nào.</Text>
          </View>
        ) : (
          accounts.map((account, idx) => (
            <View style={styles.accountCard} key={account._id || idx}>
              <View style={styles.accountRow}>
                <View style={styles.accountAvatarBox}>
                  <Image 
                    source={account.avatar ? { uri: account.avatar } : require('../assets/images/avt_default.png')} 
                    style={styles.accountAvatar} 
                  />
                </View>
                <View style={{flex:1, justifyContent:'center'}}>
                  <Text style={styles.accountName}>
                    {filterIdx === 0 ? '[HS]' : '[GV]'} {account.name}
                  </Text>
                  {filterIdx === 0 ? (
                    <Text style={styles.accountClass}>
                      Lớp: {account.className || account.class || 'N/A'}
                    </Text>
                  ) : (
                    <Text style={styles.accountClass}>
                      Bộ môn: {account.subjectName || account.subject || 'N/A'}
                    </Text>
                  )}
                  <Text style={styles.accountCode}>
                    {filterIdx === 0 ? 'Mã học sinh' : 'Mã giáo viên'}: {account.studentId || account.teacherId || account.code || 'N/A'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.accountDetailBtn} 
                  onPress={() => {
                    const accountId = account.id || account._id;
                    if (accountId) {
                      router.push(`/manage/detail_account?id=${accountId}` as any);
                    } else {
                      Alert.alert('Lỗi', 'Không tìm thấy ID tài khoản.');
                    }
                  }}
                >
                  <Text style={styles.accountDetailText}>Xem chi tiết</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#29375C" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
                  {tempBlockIdx!==null ? BLOCKS[tempBlockIdx] : 'Chọn khối'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={22} color="#29375C" />
              </TouchableOpacity>
              {blockDropdownOpen && (
                <View style={styles.dropdownList}>
                  {BLOCKS.map((b, idx) => (
                    <TouchableOpacity 
                      key={b} 
                      style={styles.dropdownItem} 
                      onPress={() => {
                        setTempBlockIdx(idx); 
                        setTempClassIdx(null); 
                        setBlockDropdownOpen(false);
                        // Load classes cho khối được chọn
                        loadClassesByGrade(10 + idx);
                      }}
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
                style={[styles.dropdownTouchable, {opacity: tempBlockIdx===null?0.5:1}]}
                disabled={tempBlockIdx===null}
                onPress={() => {setClassDropdownOpen(v=>!v); setBlockDropdownOpen(false);}}
              >
                <Text style={styles.dropdownText}>
                  {tempBlockIdx!==null && tempClassIdx!==null && classesByGrade.length > 0 
                    ? classesByGrade[tempClassIdx] 
                    : 'Chọn lớp'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={22} color="#29375C" />
              </TouchableOpacity>
              {classDropdownOpen && tempBlockIdx!==null && (
                <View style={styles.dropdownList}>
                  {classesByGrade.length > 0 ? (
                    classesByGrade.map((className, idx) => (
                      <TouchableOpacity 
                        key={className} 
                        style={styles.dropdownItem} 
                        onPress={() => {setTempClassIdx(idx); setClassDropdownOpen(false);}}
                      >
                        <Text style={styles.dropdownItemText}>{className}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemText}>Không có lớp nào</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
          
          {/* Nút tìm kiếm */}
          <TouchableOpacity 
            style={styles.filterModalBtn} 
            onPress={() => {
              // Apply filter khi nhấn tìm kiếm
              setBlockIdx(tempBlockIdx);
              setClassIdx(tempClassIdx);
              setShowFilter(false);
            }}
          >
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
    marginBottom: 50,
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
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Baloo2-SemiBold',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#29375C',
    fontFamily: 'Baloo2-SemiBold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#29375C',
    fontFamily: 'Baloo2-SemiBold',
  },
});

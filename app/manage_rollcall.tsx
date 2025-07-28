import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import ManageService, { TeacherRollcallData, WeekDaysResponse } from "../services/manage.service";

const STATUS = ["Tất cả", "Chưa điểm danh", "Đã điểm danh", "Trễ"];

export default function ManageRollcall() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDay, setShowDay] = useState(false);
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [status, setStatus] = useState(STATUS[0]);
  const [showStatus, setShowStatus] = useState(false);
  const [subject, setSubject] = useState("Tất cả");
  const [showSubject, setShowSubject] = useState(false);
  const [userName, setUserName] = useState("");
  
  // State cho dữ liệu từ API
  const [rollcallData, setRollcallData] = useState<TeacherRollcallData[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDaysResponse | null>(null);
  const [subjects, setSubjects] = useState<string[]>(["Tất cả"]);
  const [loading, setLoading] = useState(false);
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number>(1);
  const [academicYear, setAcademicYear] = useState<string>("");
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);

  // Lấy ngày hiện tại
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Lấy số tuần hiện tại
  const getCurrentWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin user
        const name = await AsyncStorage.getItem("userName");
        if (name) setUserName(name);

        // Lấy số tuần hiện tại
        const weekNum = getCurrentWeekNumber();
        setCurrentWeekNumber(weekNum);
        setSelectedWeekNumber(weekNum);

        // Lấy danh sách môn học
        await loadSubjects();

        // Load ngày hiện tại trước
        const currentDate = getCurrentDate();
        setSelectedDate(currentDate);
        await loadRollcallData(currentDate);

      } catch (error) {
        console.error('Lỗi khi khởi tạo dữ liệu:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Load danh sách ngày trong tuần khi chọn tuần
  const loadWeekDays = async (weekNumber: number) => {
    try {
      setLoading(true);
      const weekData = await ManageService.getWeekDays(weekNumber);
      setWeekDays(weekData);
      setAcademicYear(weekData.academicYear);
      setShowWeekSelector(false);
      setShowDay(true); // Hiển thị dropdown chọn ngày
    } catch (error) {
      console.error('Lỗi khi load week days:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu tuần. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách môn học
  const loadSubjects = async () => {
    try {
      const subjectsList = await ManageService.getSubjects();
      setSubjects(["Tất cả", ...subjectsList]);
    } catch (error) {
      console.error('Lỗi khi load subjects:', error);
      // Giữ nguyên danh sách mặc định nếu API lỗi
    }
  };

  // Load dữ liệu điểm danh
  const loadRollcallData = async (date: string, currentSubject?: string, currentStatus?: string) => {
    try {
      setLoading(true);
      
      const filters: any = {};
      const subjectToUse = currentSubject !== undefined ? currentSubject : subject;
      const statusToUse = currentStatus !== undefined ? currentStatus : status;
      
      if (statusToUse !== 'Tất cả') filters.status = statusToUse;
      if (subjectToUse !== 'Tất cả') filters.subject = subjectToUse;
      if (selectedWeekNumber) filters.weekNumber = selectedWeekNumber;
      if (academicYear) filters.academicYear = academicYear;

      const data = await ManageService.getTeacherRollcall(date, filters);
      setRollcallData(data.rollcalls);
    } catch (error) {
      console.error('Lỗi khi load rollcall data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu điểm danh. Vui lòng thử lại.');
      setRollcallData([]); // Reset data nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  // Khi chọn tuần
  const handleSelectWeek = async (weekNumber: number) => {
    setSelectedWeekNumber(weekNumber);
    await loadWeekDays(weekNumber);
  };

  // Khi chọn ngày
  const handleSelectDay = async (date: string) => {
    setSelectedDate(date);
    setShowDay(false);
    await loadRollcallData(date);
  };

  // Khi thay đổi filter
  const handleFilterChange = async (newSubject?: string, newStatus?: string) => {
    if (selectedDate) {
      const currentSubject = newSubject !== undefined ? newSubject : subject;
      const currentStatus = newStatus !== undefined ? newStatus : status;
      await loadRollcallData(selectedDate, currentSubject, currentStatus);
    }
  };

  // Khi chọn trạng thái
  const handleSelectStatus = async (newStatus: string) => {
    setStatus(newStatus);
    setShowStatus(false);
    await handleFilterChange(undefined, newStatus);
  };

  // Khi chọn môn học
  const handleSelectSubject = async (newSubject: string) => {
    setSubject(newSubject);
    setShowSubject(false);
    await handleFilterChange(newSubject, undefined);
  };

  // Format thời gian từ HH:MM sang HH:MM
  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5); // Lấy HH:MM
  };

  // Convert date format từ dd/mm/yyyy sang yyyy-mm-dd
  const convertDateFormat = (date: string) => {
    if (!date) return '';
    const parts = date.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return date;
  };

  // Overlay tắt dropdown
  const showAnyDropdown = showDay || showStatus || showSubject || showWeekSelector;

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <Header title="Điểm danh" name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"} />
      
      {/* Filter hàng ngang */}
      <View style={styles.filterRowWrap}>
        {/* Filter ngày */}
        <View style={{position:'relative'}}>
          <TouchableOpacity 
            style={styles.filterBtn} 
            activeOpacity={0.8} 
            onPress={() => {
              setShowWeekSelector(v=>!v); 
              setShowDay(false); 
              setShowStatus(false); 
              setShowSubject(false);
            }}
            disabled={loading}
          >
            <Text style={styles.filterBtnText}>{selectedDate || "Chọn ngày..."}</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#29375C" style={{marginLeft: 2}} />
          </TouchableOpacity>
          
          {/* Dropdown chọn tuần */}
          {showWeekSelector && (
            <View style={[styles.dropdownList, {maxHeight: 180}]}> 
              <ScrollView showsVerticalScrollIndicator={false}>
                {Array.from({length: 52}, (_, i) => i + 1).map((weekNum) => (
                  <TouchableOpacity 
                    key={weekNum} 
                    style={styles.dropdownItem} 
                    onPress={() => handleSelectWeek(weekNum)}
                  >
                    <Text style={styles.dropdownItemText}>Tuần {weekNum}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Dropdown chọn ngày sau khi chọn tuần */}
          {showDay && weekDays && (
            <View style={[styles.dropdownList, {maxHeight: 180}]}> 
              <ScrollView showsVerticalScrollIndicator={false}>
                {weekDays.days.map((day, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.dropdownItem} 
                    onPress={() => handleSelectDay(day.formattedDate)}
                  >
                    <Text style={styles.dropdownItemText}>{day.formattedDate}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        {/* Filter trạng thái */}
        <View style={{position:'relative'}}>
          <TouchableOpacity 
            style={styles.filterBtn} 
            activeOpacity={0.8} 
            onPress={() => {setShowStatus(v=>!v); setShowDay(false); setShowSubject(false);}}
            disabled={loading}
          >
            <Text style={styles.filterBtnText}>{status}</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#29375C" style={{marginLeft: 2}} />
          </TouchableOpacity>
          {showStatus && (
            <View style={styles.dropdownList}>
              {STATUS.map(s => (
                <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => handleSelectStatus(s)}>
                  <Text style={styles.dropdownItemText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Filter bộ môn */}
        <View style={{position:'relative'}}>
          <TouchableOpacity 
            style={styles.filterBtn} 
            activeOpacity={0.8} 
            onPress={() => {setShowSubject(v=>!v); setShowDay(false); setShowStatus(false);}}
            disabled={loading}
          >
            <Text style={styles.filterBtnText}>{subject}</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#29375C" style={{marginLeft: 2}} />
          </TouchableOpacity>
          {showSubject && (
            <View style={[styles.dropdownList, {maxHeight: 220}]}> 
              <ScrollView showsVerticalScrollIndicator={false}>
                {subjects.map(sj => (
                  <TouchableOpacity key={sj} style={styles.dropdownItem} onPress={() => {
                    handleSelectSubject(sj);
                  }}>
                    <Text style={styles.dropdownItemText}>{sj}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
      
      {/* Overlay tắt dropdown */}
      {showAnyDropdown && (
        <Pressable style={styles.dropdownOverlay} onPress={() => {
          setShowDay(false); 
          setShowStatus(false); 
          setShowSubject(false);
          setShowWeekSelector(false);
        }} />
      )}
      
      {/* Danh sách điểm danh */}
      <ScrollView style={styles.rollcallListWrap} contentContainerStyle={{paddingBottom: 24}} showsVerticalScrollIndicator={false}>
        {/* Header bộ môn */}
        <View style={styles.rollcallHeaderSubject}>
          <Text style={styles.rollcallHeaderSubjectText}>
            {subject === 'Tất cả' ? 'Tất cả bộ môn' : `Bộ môn ${subject}`}
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="hourglass-empty" size={48} color="#29375C" style={{marginBottom: 12}} />
            <Text style={styles.emptyStateTitle}>Đang tải dữ liệu...</Text>
          </View>
        ) : rollcallData.length > 0 ? (
          rollcallData.map((item, idx) => (
            <View style={styles.rollcallCard} key={idx}>
              <View style={styles.rollcallRow}>
                <View style={styles.rollcallAvatarBox}>
                  <View style={styles.rollcallAvatarIcon}>
                    <MaterialIcons name="account-circle" size={32} color="#29375C" />
                  </View>
                </View>
                <View style={{flex:1, justifyContent:'center'}}>
                  <Text style={styles.rollcallName}>[GV] {item.teacherName}</Text>
                  <Text style={styles.rollcallClass}>Lớp: {item.class} | Tiết {item.period}</Text>
                  <View style={{flexDirection:'row', alignItems:'center', marginTop:2}}>
                    <MaterialIcons name="access-time" size={16} color="#29375C" style={{marginRight:2}} />
                    <Text style={styles.rollcallTime}>{formatTime(item.startTime)} - {formatTime(item.endTime)}</Text>
                  </View>
                </View>
                {/* Trạng thái */}
                {item.status === 'Đã điểm danh' && (
                  <View style={styles.rollcallStatusDone}>
                    <MaterialIcons name="check-circle" size={20} color="#fff" style={{marginRight:4}} />
                    <Text style={styles.rollcallStatusText}>Đã điểm danh</Text>
                  </View>
                )}
                {item.status === 'Trễ' && (
                  <View style={styles.rollcallStatusLate}>
                    <MaterialIcons name="warning" size={20} color="#fff" style={{marginRight:4}} />
                    <Text style={styles.rollcallStatusTextLate}>Trễ</Text>
                  </View>
                )}
                {item.status === 'Chưa điểm danh' && (
                  <View style={styles.rollcallStatusNotyet}>
                    <View style={styles.rollcallStatusNotyetIcon}>
                      <MaterialIcons name="close" size={18} color="#fff" />
                    </View>
                    <Text style={styles.rollcallStatusTextNotyet}>Chưa điểm danh</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="search-off" size={48} color="#29375C" style={{marginBottom: 12}} />
            <Text style={styles.emptyStateTitle}>Không tìm thấy dữ liệu</Text>
            <Text style={styles.emptyStateSubtitle}>
              Không có điểm danh nào phù hợp với bộ lọc hiện tại
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
    gap: 15,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7DCE5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    marginHorizontal: 0,
    zIndex: 10,
  },
  filterBtnText: {
    color: '#29375C',
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
    zIndex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 100,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
    marginTop: 2,
    maxHeight: 180,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  dropdownItemText: {
    color: '#29375C',
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
  },
  rollcallListWrap: {
    marginTop: 8,
    marginBottom: 100,
    marginHorizontal: 0,
  },
  rollcallHeaderSubject: {
    backgroundColor: '#D7DCE5',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rollcallHeaderSubjectText: {
    color: '#29375C',
    fontFamily: "Baloo2-SemiBold",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  rollcallCard: {
    backgroundColor: '#f7f7f7',
    marginBottom: 0,
    marginHorizontal: 0,
    padding: 16,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#fff',
  },
  rollcallRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rollcallAvatarBox: {
    marginRight: 12,
  },
  rollcallAvatarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollcallName: {
    fontFamily: "Baloo2-SemiBold",
    color: '#29375C',
    fontSize: 15,
    marginBottom: 2,
  },
  rollcallClass: {
    color: '#29375C',
    fontSize: 13,
    marginBottom: 0,
    fontFamily: "Baloo2-Medium",
  },
  rollcallTime: {
    color: '#29375C',
    fontSize: 13,
    marginLeft: 2,
    fontFamily: "Baloo2-Medium",
  },
  rollcallStatusDone: {
    backgroundColor: '#7ED957',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 10,
  },
  rollcallStatusText: {
    color: '#fff',
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
  },
  rollcallStatusLate: {
    backgroundColor: '#F9B233',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 10,
  },
  rollcallStatusTextLate: {
    color: '#fff',
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
  },
  rollcallStatusNotyet: {
    backgroundColor: '#E57373',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 10,
  },
  rollcallStatusNotyetIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  rollcallStatusTextNotyet: {
    color: '#fff',
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#f7f7f7',
  },
  emptyStateTitle: {
    color: '#29375C',
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#29375C',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: "Baloo2-Medium",
  },
});

import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";

const DAYS = [
  "25/06/2025",
  "24/06/2025",
  "23/06/2025",
  "22/06/2025",
  "21/06/2025",
  "20/06/2025",
];
const STATUS = ["Tất cả", "Chưa điểm danh", "Đã điểm danh", "Trễ"];
const SUBJECTS = [
  "Tất cả",
  "Toán",
  "Ngữ Văn",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Lịch sử",
  "Địa lý",
  "GDCD",
  "Ngoại ngữ",
  "Thể dục",
  "Giáo dục quốc phòng và an ninh",
  "Tin học",
  "Công nghệ",
];

export default function ManageRollcall() {
  const [day, setDay] = useState(DAYS[0]);
  const [showDay, setShowDay] = useState(false);
  const [status, setStatus] = useState(STATUS[0]);
  const [showStatus, setShowStatus] = useState(false);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [showSubject, setShowSubject] = useState(false);

  // Dữ liệu mẫu đủ trường
  const [allRollcalls] = useState([
    { name: 'Nguyen Van A', class: '10A1', period: 3, time: '08:30', status: 'Đã điểm danh', date: '25/06/2025', subject: 'Toán' },
    { name: 'Nguyen Van A', class: '10A1', period: 3, time: '08:30', status: 'Đã điểm danh', date: '25/06/2025', subject: 'Toán' },
    { name: 'Nguyen Van A', class: '10A1', period: 3, time: '08:30', status: 'Trễ', date: '25/06/2025', subject: 'Toán' },
    { name: 'Nguyen Van A', class: '10A1', period: 3, time: '08:30', status: 'Chưa điểm danh', date: '25/06/2025', subject: 'Toán' },
    { name: 'Nguyen Van B', class: '10A2', period: 2, time: '09:30', status: 'Đã điểm danh', date: '24/06/2025', subject: 'Vật lý' },
    { name: 'Nguyen Van C', class: '10A3', period: 1, time: '10:30', status: 'Trễ', date: '23/06/2025', subject: 'Ngữ Văn' },
    { name: 'Nguyen Van D', class: '10A4', period: 4, time: '11:30', status: 'Chưa điểm danh', date: '22/06/2025', subject: 'Toán' },
  ]);
  const [filteredRollcalls, setFilteredRollcalls] = useState(allRollcalls);

  const handleApply = () => {
    setFilteredRollcalls(
      allRollcalls.filter(item =>
        item.date === day &&
        (status === 'Tất cả' || item.status === status) &&
        (subject === 'Tất cả' || item.subject === subject)
      )
    );
  };

  // Overlay tắt dropdown
  const showAnyDropdown = showDay || showStatus || showSubject;

  // Khi chọn ngày, nếu trạng thái đang là 'Tất cả' thì chuyển về trạng thái đầu tiên không phải 'Tất cả'
  const handleSelectDay = (d: string) => {
    setDay(d);
    if (status === 'Tất cả') setStatus('Chưa điểm danh');
    setShowDay(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Điểm danh" studentName="QL Nguyễn Văn A" />
      {/* Filter hàng ngang */}
      <View style={styles.filterRowWrap}>
        {/* Filter ngày */}
        <View style={{position:'relative'}}>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => {setShowDay(v=>!v); setShowStatus(false); setShowSubject(false);}}>
            <Text style={styles.filterBtnText}>{day}</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#22304A" style={{marginLeft: 2}} />
          </TouchableOpacity>
          {showDay && (
            <View style={[styles.dropdownList, {maxHeight: 180}]}> 
              <ScrollView showsVerticalScrollIndicator={false}>
                {DAYS.map(d => (
                  <TouchableOpacity key={d} style={styles.dropdownItem} onPress={() => handleSelectDay(d)}>
                    <Text style={styles.dropdownItemText}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        {/* Filter trạng thái */}
        <View style={{position:'relative'}}>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => {setShowStatus(v=>!v); setShowDay(false); setShowSubject(false);}}>
            <Text style={styles.filterBtnText}>{status}</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#22304A" style={{marginLeft: 2}} />
          </TouchableOpacity>
          {showStatus && (
            <View style={styles.dropdownList}>
              {STATUS.map(s => (
                <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => {setStatus(s); setShowStatus(false);}}>
                  <Text style={styles.dropdownItemText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {/* Filter bộ môn */}
        <View style={{position:'relative'}}>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => {setShowSubject(v=>!v); setShowDay(false); setShowStatus(false);}}>
            <Text style={styles.filterBtnText}>{subject}</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#22304A" style={{marginLeft: 2}} />
          </TouchableOpacity>
          {showSubject && (
            <View style={[styles.dropdownList, {maxHeight: 220}]}> 
              <ScrollView showsVerticalScrollIndicator={false}>
                {SUBJECTS.map(sj => (
                  <TouchableOpacity key={sj} style={styles.dropdownItem} onPress={() => {setSubject(sj); setShowSubject(false);}}>
                    <Text style={styles.dropdownItemText}>{sj}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        {/* Nút áp dụng */}
        <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Áp dụng</Text>
        </TouchableOpacity>
      </View>
      {/* Overlay tắt dropdown */}
      {showAnyDropdown && (
        <Pressable style={styles.dropdownOverlay} onPress={() => {setShowDay(false); setShowStatus(false); setShowSubject(false);}} />
      )}
      {/* Danh sách điểm danh */}
      <ScrollView style={styles.rollcallListWrap} contentContainerStyle={{paddingBottom: 24}} showsVerticalScrollIndicator={false}>
        {/* Header bộ môn */}
        <View style={styles.rollcallHeaderSubject}>
          <Text style={styles.rollcallHeaderSubjectText}>
            {subject === 'Tất cả' ? 'Tất cả bộ môn' : `Bộ môn ${subject}`}
          </Text>
        </View>
        {filteredRollcalls.map((item, idx) => (
          <View style={styles.rollcallCard} key={idx}>
            <View style={styles.rollcallRow}>
              <View style={styles.rollcallAvatarBox}>
                <View style={styles.rollcallAvatarIcon}>
                  <MaterialIcons name="account-circle" size={32} color="#22304A" />
                </View>
              </View>
              <View style={{flex:1, justifyContent:'center'}}>
                <Text style={styles.rollcallName}>[GV] {item.name}</Text>
                <Text style={styles.rollcallClass}>Lớp: {item.class} | Tiết {item.period}</Text>
                <View style={{flexDirection:'row', alignItems:'center', marginTop:2}}>
                  <MaterialIcons name="access-time" size={16} color="#22304A" style={{marginRight:2}} />
                  <Text style={styles.rollcallTime}>{item.time}'</Text>
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
                  <MaterialIcons name="warning" size={20} color="#F9A825" style={{marginRight:4}} />
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
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9EBF0',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 6,
    minWidth: 40,
    marginHorizontal: 0,
    zIndex: 10,
  },
  filterBtnText: {
    color: '#22304A',
    fontSize: 12,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: '#22304A',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginLeft: 2,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.2,
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
    color: '#22304A',
    fontSize: 14,
    fontWeight: '500',
  },
  rollcallListWrap: {
    marginTop: 8,
    marginHorizontal: 0,
  },
  rollcallHeaderSubject: {
    backgroundColor: '#BFC6D1',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rollcallHeaderSubjectText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rollcallCard: {
    backgroundColor: '#DFE3EA',
    // borderRadius: 12,
    marginTop: 18,
    marginBottom: 0,
    marginHorizontal: 0,
    padding: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#E9EBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollcallName: {
    fontWeight: 'bold',
    color: '#22304A',
    fontSize: 15,
    marginBottom: 2,
  },
  rollcallClass: {
    color: '#22304A',
    fontSize: 13,
    marginBottom: 0,
  },
  rollcallTime: {
    color: '#22304A',
    fontSize: 13,
    marginLeft: 2,
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  rollcallStatusLate: {
    backgroundColor: '#FFF6E0',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: '#F9A825',
  },
  rollcallStatusTextLate: {
    color: '#F9A825',
    fontWeight: 'bold',
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
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  rollcallStatusTextNotyet: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

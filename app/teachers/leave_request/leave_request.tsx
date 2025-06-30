import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderLayout from '../../../components/layout/HeaderLayout';
import DaySelector from '../../../components/schedule/DaySelector';
import ScheduleDay from '../../../components/schedule/ScheduleDay';
import ScheduleHeader from '../../../components/schedule/ScheduleHeader';
import { Activity } from '../schedule/schedule';

const defaultActivity = (text: string, hasNotification = false): Activity => ({
  text,
  type: 'default',
  hasNotification,
});

const initialScheduleData: Activity[][] = [
  // Tiết 1
  [
    defaultActivity("10A3"), // Thứ 2
    defaultActivity("11A1"), // Thứ 3
    defaultActivity("10A3"), // Thứ 4 (dạy 2 lớp)
    defaultActivity(""), // Thứ 5
    defaultActivity("12A2"), // Thứ 6
    defaultActivity(""), // Thứ 7
    defaultActivity(""), // CN
  ],
  // Tiết 2
  [
    defaultActivity("10A2"),
    defaultActivity("10A3"),
    defaultActivity("11A1"),
    defaultActivity(""),
    defaultActivity("12A2"),
    defaultActivity(""),
    defaultActivity(""),
  ],
  // ... các tiết khác
];

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const morningPeriods = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5'];
const afternoonPeriods = ['Tiết 6', 'Tiết 7', 'Tiết 8', 'Tiết 9', 'Tiết 10'];

export default function TeacherLeaveRequestScreen() {
  const router = useRouter();
  const [session, setSession] = useState<'Buổi sáng' | 'Buổi chiều'>('Buổi sáng');
  const [selected, setSelected] = useState<{row: number, col: number}[]>([]);
  const [scheduleData] = useState<Activity[][]>(initialScheduleData);

  const periods = session === 'Buổi sáng' ? morningPeriods : afternoonPeriods;
  const displayedData = session === 'Buổi sáng'
    ? scheduleData.slice(0, morningPeriods.length)
    : scheduleData.slice(morningPeriods.length, morningPeriods.length + afternoonPeriods.length);

  // Hàm chọn tiết xin nghỉ
  const handleSelectSlot = (dayIndex: number, periodIndex: number) => {
    const isExist = selected.some(cell => cell.row === periodIndex && cell.col === dayIndex);
    if (isExist) {
      setSelected(selected.filter(cell => !(cell.row === periodIndex && cell.col === dayIndex)));
    } else {
      setSelected([...selected, {row: periodIndex, col: dayIndex}]);
    }
  };

  return (
    <HeaderLayout title="Tiết dạy xin nghỉ" subtitle="Chọn các tiết dạy bạn muốn xin phép nghỉ" onBack={() => router.back()}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flex: 1 }}>
          <ScheduleHeader
            title={session}
            dateRange="12/6 - 19/6"
            year="2025"
            onPressTitle={() => setSession(session === 'Buổi sáng' ? 'Buổi chiều' : 'Buổi sáng')}
          />
          <DaySelector days={days} />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <ScheduleDay
              periods={periods}
              days={days}
              onAddActivity={handleSelectSlot}
              scheduleData={displayedData}
              selectedSlots={selected}
              onSelectSlot={handleSelectSlot}
              onSlotPress={handleSelectSlot}
            />
          </ScrollView>
          {/* Chú thích màu sắc */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={styles.legendBox}/><Text style={styles.legendText}>Tiết dạy hiện tại</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendBox, styles.legendBoxSelected]}/><Text style={styles.legendText}>Tiết dạy xin nghỉ</Text></View>
          </View>
        </View>
        {/* Nút tiếp tục cố định dưới cùng */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
            disabled={selected.length === 0}
            onPress={() => {
              if (selected.length > 0) {
                // Lấy tên môn dạy thực tế cho từng slot đã chọn
                const subjects = selected.map(({ row, col }) => displayedData[row][col]?.text || '');
                router.push({
                  pathname: '/teachers/leave_request/leave_request_info',
                  params: {
                    selectedSlots: JSON.stringify(selected),
                    subjects: JSON.stringify(subjects),
                    days: JSON.stringify(days),
                  }
                });
              }
            }}
          >
            <Text style={[styles.buttonText, selected.length === 0 && styles.buttonTextDisabled]}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  slot: { width: 54, height: 48, backgroundColor: '#22315B', borderRadius: 8, margin: 2, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  slotEmpty: { backgroundColor: 'transparent' },
  slotSelected: { backgroundColor: '#FFA726' },
  slotText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  slotTextSelected: { color: '#fff' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', position: 'absolute', top: 6, right: 8 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  legendBox: { width: 20, height: 20, backgroundColor: '#22315B', borderRadius: 5, marginRight: 6 },
  legendBoxSelected: { backgroundColor: '#FFA726' },
  legendText: { color: '#22315B', fontSize: 13 },
  button: { backgroundColor: '#22315B', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  buttonTextDisabled: { color: '#9CA3AF' },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
}); 
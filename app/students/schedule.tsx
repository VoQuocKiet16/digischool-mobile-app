import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import DaySelector from '../../components/schedule/DaySelector';
import ScheduleDay from '../../components/schedule/ScheduleDay';
import ScheduleHeader from '../../components/schedule/ScheduleHeader';

export default function ScheduleScreen() {
  const [session, setSession] = useState<'Buổi sáng' | 'Buổi chiều'>('Buổi sáng');
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  
  const morningPeriods = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5'];
  const afternoonPeriods = ['Tiết 6', 'Tiết 7', 'Tiết 8', 'Tiết 9', 'Tiết 10'];
  const periods = session === 'Buổi sáng' ? morningPeriods : afternoonPeriods;

  const handleAddActivity = (dayIndex: number, periodIndex: number, activity: string) => {
    console.log(`Thêm hoạt động "${activity}" tại ${days[dayIndex]}, ${periods[periodIndex]}`);
    // Logic lưu dữ liệu (ví dụ: AsyncStorage hoặc state quản lý)
  };

  const handleSessionToggle = () => {
    setSession(current => (current === 'Buổi sáng' ? 'Buổi chiều' : 'Buổi sáng'));
  };

  return (
    <ScrollView style={styles.container}>
      <ScheduleHeader 
        title={session} 
        dateRange="12/6 - 19/6" 
        year="2025"
        onPressTitle={handleSessionToggle} 
      />
      <DaySelector days={days} />
      <ScheduleDay periods={periods} days={days} onAddActivity={handleAddActivity} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import DaySelector from '../../../components/schedule/DaySelector';
import ScheduleDay from '../../../components/schedule/ScheduleDay';
import ScheduleHeader from '../../../components/schedule/ScheduleHeader';

export interface Activity {
  text: string;
  type: 'default' | 'user-added';
  hasNotification?: boolean;
}

const defaultActivity = (text: string, hasNotification = false): Activity => ({
  text,
  type: 'default',
  hasNotification,
});

const initialScheduleData: Activity[][] = [
  // Morning Periods
  [ defaultActivity('Chào cờ', true), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity(''), ],
  [ defaultActivity('Toán'), defaultActivity('Văn'), defaultActivity(''), defaultActivity('Lý'), defaultActivity('Hóa'), defaultActivity(''), defaultActivity(''), ],
  [ defaultActivity('Anh'), defaultActivity(''), defaultActivity('Sử'), defaultActivity('Địa'), defaultActivity(''), defaultActivity('GDCD'), defaultActivity(''), ],
  [ defaultActivity(''), defaultActivity('Sinh'), defaultActivity('Công nghệ'), defaultActivity(''), defaultActivity('Thể dục'), defaultActivity('Thể dục'), defaultActivity(''), ],
  [ defaultActivity('Mỹ thuật'), defaultActivity(''), defaultActivity(''), defaultActivity('Âm nhạc'), defaultActivity('Toán'), defaultActivity(''), defaultActivity(''), ],
  // Afternoon Periods
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
];

export default function ScheduleScreen() {
  const [session, setSession] = useState<'Buổi sáng' | 'Buổi chiều'>('Buổi sáng');
  const [scheduleData, setScheduleData] = useState<Activity[][]>(initialScheduleData);

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const morningPeriods = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5'];
  const afternoonPeriods = ['Tiết 6', 'Tiết 7', 'Tiết 8', 'Tiết 9', 'Tiết 10'];
  const periods = session === 'Buổi sáng' ? morningPeriods : afternoonPeriods;

  const handleAddActivity = (dayIndex: number, periodIndex: number, activityText: string) => {
    setScheduleData(currentData => {
      const newData = [...currentData.map(row => [...row])];
      const absolutePeriodIndex = session === 'Buổi sáng' ? periodIndex : periodIndex + morningPeriods.length;
      newData[absolutePeriodIndex][dayIndex] = { text: activityText, type: 'user-added' };
      return newData;
    });
    console.log(`Thêm hoạt động "${activityText}" tại ${days[dayIndex]}, ${periods[periodIndex]}`);
  };

  const handleSessionToggle = () => {
    setSession(current => (current === 'Buổi sáng' ? 'Buổi chiều' : 'Buổi sáng'));
  };

  const displayedData = session === 'Buổi sáng' 
    ? scheduleData.slice(0, morningPeriods.length)
    : scheduleData.slice(morningPeriods.length, morningPeriods.length + afternoonPeriods.length);

  return (
    <View style={styles.container}>
      <ScheduleHeader
        title={session}
        dateRange="12/6 - 19/6"
        year="2025"
        onPressTitle={handleSessionToggle}
      />
      <DaySelector days={days} />
      <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
        <ScheduleDay
          periods={periods}
          days={days}
          onAddActivity={handleAddActivity}
          scheduleData={displayedData}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
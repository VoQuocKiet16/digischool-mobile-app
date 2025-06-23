import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScheduleSlot from './ScheduleSlot';

interface ScheduleRowProps {
  period: string;
  days: string[];
  periodIndex: number;
  onAddActivity: (dayIndex: number, periodIndex: number, activity: string) => void;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({ period, days, periodIndex, onAddActivity }) => {
  // Dữ liệu mẫu, có thể thay bằng API/state
  const sampleData = [
    'Chào cờ',
    'Chào cờ',
    'Chào cờ',
    'Chào cờ',
    'Chào cờ',
    'Chào cờ',
    '',
  ];
  const notificationData = [false, false, true, false, false, false, false];

  // Just for demonstration, using different data for other periods.
  const otherData = ['', 'Toán', 'Lý', 'Hóa', '', 'Văn', ''];

  const rowData = periodIndex === 0 ? sampleData : otherData;

  return (
    <View style={styles.row}>
      <View style={styles.periodContainer}>
        <Text style={styles.periodText}>{period}</Text>
      </View>
      <View style={styles.slotsContainer}>
        {days.map((_, dayIndex) => (
          <View key={dayIndex} style={styles.slotWrapper}>
            <ScheduleSlot
              text={rowData[dayIndex] || 'Thêm hoạt động'}
              hasNotification={periodIndex === 0 && notificationData[dayIndex]}
              dayIndex={dayIndex}
              periodIndex={periodIndex}
              onAddActivity={onAddActivity}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  periodContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  periodText: {
    fontWeight: 'bold',
    color: '#3A546D',
    fontSize: 14,
  },
  slotsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  slotWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
});

export default ScheduleRow;
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity } from '../../app/students/schedule/schedule';
import ScheduleSlot from './ScheduleSlot';

interface ScheduleDayProps {
  periods: string[];
  days: string[];
  onAddActivity: (dayIndex: number, periodIndex: number, activity: string) => void;
  scheduleData: Activity[][];
}

const ScheduleDay: React.FC<ScheduleDayProps> = ({ periods, days, onAddActivity, scheduleData }) => {
  return (
    <View style={styles.container}>
      {/* Các hàng tiết */}
      {periods.map((period, periodIndex) => (
        <View key={periodIndex} style={styles.row}>
          {/* Cột tiết */}
          <View style={styles.periodCell}>
            <Text style={styles.periodText}>{period}</Text>
          </View>
          {/* Các slot của từng ngày */}
          {days.map((_, dayIndex) => {
            const slotData =
              scheduleData[periodIndex] && scheduleData[periodIndex][dayIndex]
                ? scheduleData[periodIndex][dayIndex]
                : { text: '', type: 'default', hasNotification: false };
            return (
              <View key={dayIndex} style={styles.slotWrapper}>
                <ScheduleSlot
                  text={slotData.text || 'Thêm hoạt động'}
                  isUserAdded={slotData.type === 'user-added'}
                  hasNotification={slotData.hasNotification}
                  dayIndex={dayIndex}
                  periodIndex={periodIndex}
                  onAddActivity={onAddActivity}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  periodCell: {
    width: 60,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodText: { fontWeight: 'bold', color: '#3A546D', fontSize: 13, textAlign: 'center' },
  slotWrapper: {
    flex: 1,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

export default ScheduleDay; 
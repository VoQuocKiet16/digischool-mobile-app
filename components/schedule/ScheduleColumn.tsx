import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Activity } from '../../app/students/schedule';
import ScheduleSlot from './ScheduleSlot';

interface ScheduleColumnProps {
  dayIndex: number;
  columnData: Activity[];
  onAddActivity: (dayIndex: number, periodIndex: number, activity: string) => void;
  periods: string[];
}

const ScheduleColumn: React.FC<ScheduleColumnProps> = ({ dayIndex, columnData, onAddActivity, periods }) => {
  return (
    <View style={styles.column}>
      {periods.map((_, periodIndex) => {
        const slotData =
          columnData && columnData[periodIndex]
            ? columnData[periodIndex]
            : { text: '', type: 'default', hasNotification: false };
        return (
          <View key={periodIndex} style={styles.slotWrapper}>
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
  );
};

const styles = StyleSheet.create({
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  slotWrapper: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 0,
    marginVertical: 6,
  },
});

export default ScheduleColumn; 
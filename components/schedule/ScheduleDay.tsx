import React from 'react';
import { View } from 'react-native';
import ScheduleRow from './ScheduleRow';

interface ScheduleDayProps {
  periods: string[];
  days: string[];
  onAddActivity: (dayIndex: number, periodIndex: number, activity: string) => void;
}

const ScheduleDay: React.FC<ScheduleDayProps> = ({ periods, days, onAddActivity }) => {
  return (
    <View>
      {periods.map((period, index) => (
        <ScheduleRow
          key={index}
          period={period}
          days={days}
          periodIndex={index}
          onAddActivity={onAddActivity}
        />
      ))}
    </View>
  );
};

export default ScheduleDay; 
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RefreshableScrollView from "../../../components/RefreshableScrollView";
import DaySelector from "../../../components/schedule/DaySelector";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getStudentSchedule } from "../../../services/schedule.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function ScheduleStudentsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">(
    "Buổi sáng"
  );
  const [scheduleData, setScheduleData] =
    useState<Activity[][]>(initialScheduleData);
  const [lessonIds, setLessonIds] = useState<string[][]>(
    Array.from({ length: 10 }, () => Array.from({ length: 7 }, () => ""))
  );
  const [year, setYear] = useState("2024-2025");
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
    label: string;
  }>(() => {
    const weeks = getWeekRangesByYear("2024-2025");
    return weeks[1];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const days = defaultDays;
  const weekList = getWeekRangesByYear(year);

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStudentSchedule({
        className: (await AsyncStorage.getItem("userClass")) || "",
        academicYear: year,
        startOfWeek: dateRange.start,
        endOfWeek: dateRange.end,
      });
      const { schedule, lessonIds: newLessonIds } = mapApiToScheduleData(data);
      setScheduleData(schedule);
      setLessonIds(newLessonIds);
    } catch (err) {
      setError("Lỗi tải thời khóa biểu");
      setScheduleData(initialScheduleData);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const morningPeriods = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5'];
  const afternoonPeriods = ['Tiết 6', 'Tiết 7', 'Tiết 8', 'Tiết 9', 'Tiết 10'];
  const periods = session === 'Buổi sáng' ? morningPeriods : afternoonPeriods;

  const handleAddActivity = (dayIndex: number, periodIndex: number, activityText: string) => {
    router.push({
      pathname: '/activity/add_activity',
      params: { periodIndex }
    });
  };

  const handleSlotDetail = (dayIndex: number, periodIndex: number, activityText: string) => {
    console.log('Slot detail:', activityText);
    router.push('/students/lesson_information/lesson_detail');
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
          scheduleData={displayedData}
          onAddActivity={handleAddActivity}
          onSlotPress={handleSlotDetail}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
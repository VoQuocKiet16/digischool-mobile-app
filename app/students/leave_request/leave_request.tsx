import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import DaySelector from "../../../components/schedule/DaySelector";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getStudentSchedule } from "../../../services/schedule.service";
import { Activity } from "../schedule/schedule";

const defaultActivity = (text: string, hasNotification = false): Activity => ({
  text,
  type: 'default',
  hasNotification,
});

const initialScheduleData: Activity[][] = [
  [ defaultActivity('Chào cờ', true), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity('Chào cờ'), defaultActivity(''), ],
  [ defaultActivity('Toán'), defaultActivity('Văn'), defaultActivity(''), defaultActivity('Lý'), defaultActivity('Hóa'), defaultActivity(''), defaultActivity(''), ],
  [ defaultActivity('Anh'), defaultActivity(''), defaultActivity('Sử'), defaultActivity('Địa'), defaultActivity(''), defaultActivity('GDCD'), defaultActivity(''), ],
  [ defaultActivity(''), defaultActivity('Sinh'), defaultActivity('Công nghệ'), defaultActivity(''), defaultActivity('Thể dục'), defaultActivity('Thể dục'), defaultActivity(''), ],
  [ defaultActivity('Mỹ thuật'), defaultActivity(''), defaultActivity(''), defaultActivity('Âm nhạc'), defaultActivity('Toán'), defaultActivity(''), defaultActivity(''), ],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
  [defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity(''),defaultActivity('')],
];

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const morningPeriods = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5'];
const afternoonPeriods = ['Tiết 6', 'Tiết 7', 'Tiết 8', 'Tiết 9', 'Tiết 10'];

export default function LeaveRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [session, setSession] = useState<'Buổi sáng' | 'Buổi chiều'>('Buổi sáng');
  const [selected, setSelected] = useState<{row: number, col: number}[]>([]);
  const [scheduleData, setScheduleData] = useState<Activity[][]>(initialScheduleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lessonDetails, setLessonDetails] = useState<any[][]>([]);
  const [lessonIds, setLessonIds] = useState<string[]>([]);
  const [year, setYear] = useState("2025");
  const [dateRange, setDateRange] = useState({ start: "12/6", end: "19/6" });

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getStudentSchedule({
          className: "12A1",
          academicYear: year,
          startOfWeek: dateRange.start,
          endOfWeek: dateRange.end,
        });
        const { schedule, lessonIds: newLessonIds } =
          mapApiToScheduleData(data);
        setScheduleData(schedule);
        setLessonIds(newLessonIds);
        const details = Array.from({ length: 10 }, () =>
          Array.from({ length: 7 }, () => null)
        );
        const scheduleData = data?.data?.schedule || [];
        scheduleData.forEach((dayData: any) => {
          const dayOfWeek = dayData.dayOfWeek;
          const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const date = dayData.date;
          dayData.lessons?.forEach((lesson: any) => {
            const periodIndex = (lesson.period || 1) - 1;
            if (periodIndex >= 0 && periodIndex < 10) {
              details[periodIndex][dayIndex] = {
                ...lesson,
                date: date,
              };
            }
          });
        });
        setLessonDetails(details);
      } catch (err) {
        setError("Lỗi tải thời khoá biểu");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [year, dateRange]);

  useEffect(() => {
    if (params.selectedSlots) {
      try {
        setSelected(JSON.parse(params.selectedSlots as string));
      } catch {}
    }
  }, [params.selectedSlots]);

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
    <HeaderLayout title="Tiết học xin nghỉ" subtitle="Chọn các tiết học bạn muốn xin phép nghỉ" onBack={() => router.back()}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flex: 1 }}>
          <ScheduleHeader
            title={session}
            dateRange={`${dateRange.start} - ${dateRange.end}`}
            year={year}
            onPressTitle={() => setSession(session === 'Buổi sáng' ? 'Buổi chiều' : 'Buổi sáng')}
          />
          <DaySelector days={days} />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <ScheduleDay
              periods={session === 'Buổi sáng' ? morningPeriods : afternoonPeriods}
              days={days}
              onAddActivity={handleSelectSlot}
              scheduleData={scheduleData}
              selectedSlots={selected}
              onSelectSlot={handleSelectSlot}
            />
          </ScrollView>
          {/* Chú thích màu sắc */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={styles.legendBox}/><Text style={styles.legendText}>Tiết học hiện tại</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendBox, styles.legendBoxSelected]}/><Text style={styles.legendText}>Tiết học xin nghỉ</Text></View>
          </View>
        </View>
        {/* Nút tiếp tục cố định dưới cùng */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
            disabled={selected.length === 0}
            onPress={() => {
              if (selected.length > 0) {
                // Lấy tên môn học thực tế cho từng slot đã chọn
                const subjects = selected.map(({ row, col }) => scheduleData[row][col]?.text || '');
                router.push({
                  pathname: '/students/leave_request/leave_request_info',
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

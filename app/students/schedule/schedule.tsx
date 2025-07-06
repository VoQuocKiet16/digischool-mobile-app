import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import DaySelector from '../../../components/schedule/DaySelector';
import ScheduleDay from '../../../components/schedule/ScheduleDay';
import ScheduleHeader from '../../../components/schedule/ScheduleHeader';

export interface Activity {
  text: string;
  type: "default" | "user-added";
  hasNotification?: boolean;
}

const defaultActivity = (text: string, hasNotification = false): Activity => ({
  text,
  type: "default",
  hasNotification,
});

const initialScheduleData: Activity[][] = Array.from({ length: 10 }, () =>
  Array.from({ length: 7 }, () => ({ text: "", type: "user-added" }))
);

const defaultDays = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "CN",
];
const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];

const academicYears = ["2024-2025", "2025-2026"];

function getFirstMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 1 ? 0 : (8 - day) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekRangesByYear(year: string) {
  const [startYear, endYear] = year.split("-").map(Number);
  const startDate = new Date(startYear, 7, 1);
  const endDate = new Date(endYear, 4, 31);
  let current = getFirstMonday(startDate);
  const weeks = [];
  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
    weeks.push({
      start: weekStart.toISOString().slice(0, 10),
      end: weekEnd.toISOString().slice(0, 10),
      label:
        `${weekStart.getDate().toString().padStart(2, "0")}/${(
          weekStart.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}` +
        " - " +
        `${weekEnd.getDate().toString().padStart(2, "0")}/${(
          weekEnd.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`,
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

function mapApiToScheduleData(apiData: any): {
  schedule: Activity[][];
  lessonIds: string[][];
} {
  const schedule: Activity[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => ({ text: "", type: "user-added" }))
  );
  const lessonIds: string[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => "")
  );

  const scheduleData = apiData?.data?.schedule || [];

  scheduleData.forEach((dayData: any) => {
    const dayOfWeek = dayData.dayOfWeek;
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    dayData.lessons?.forEach((lesson: any) => {
      const periodIndex = (lesson.period || 1) - 1;
      if (periodIndex >= 0 && periodIndex < 10) {
        let text = "";

        if (lesson.type === "fixed" && lesson.fixedInfo) {
          text = lesson.fixedInfo.description || "";
        } else if (lesson.subject) {
          text = lesson.subject.name || "";
        } else if (lesson.type === "empty") {
          text = "";
        }

        schedule[periodIndex][dayIndex] = {
          text,
          type: "default",
        };

        if (lesson._id) {
          lessonIds[periodIndex][dayIndex] = lesson._id;
        }
      }
    });
  });

  return { schedule, lessonIds };
}

export default function ScheduleStudentsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<'Buổi sáng' | 'Buổi chiều'>('Buổi sáng');
  const [scheduleData, setScheduleData] = useState<Activity[][]>(initialScheduleData);
  const [year, setYear] = useState<string>(academicYears[0]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string; label: string }>(getWeekRangesByYear(year)[0]);
  const [showYearModal, setShowYearModal] = useState<boolean>(false);
  const [showWeekModal, setShowWeekModal] = useState<boolean>(false);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [weekList, setWeekList] = useState(getWeekRangesByYear(year));
  const [lessonIds, setLessonIds] = useState<string[][]>(Array.from({ length: 10 }, () => Array.from({ length: 7 }, () => "")));

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const morningPeriods = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5'];
  const afternoonPeriods = ['Tiết 6', 'Tiết 7', 'Tiết 8', 'Tiết 9', 'Tiết 10'];
  const periods = session === 'Buổi sáng' ? morningPeriods : afternoonPeriods;

  const handleAddActivity = (
    dayIndex: number,
    periodIndex: number,
    activityText: string
  ) => {
    router.push({
      pathname: "/activity/add_activity",
      params: { periodIndex },
    });
  };

  const handleSlotDetail = (
    dayIndex: number,
    periodIndex: number,
    activityText: string,
    lessonId?: string
  ) => {
    if (lessonId) {
      router.push({
        pathname: "/students/lesson_information/lesson_detail",
        params: { lessonId },
      });
    } else {
      router.push("/students/lesson_information/lesson_detail");
    }
  };

  const displayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5)
      : scheduleData.slice(5, 10);

  const handleChangeYear = () => setShowYearModal(true);
  const handleSelectYear = (selected: string) => {
    setYear(selected);
    const weeks = getWeekRangesByYear(selected);
    setDateRange(weeks[0]);
    setShowYearModal(false);
    setWeekList(weeks);
  };

  const handleChangeDateRange = () => setShowWeekModal(true);
  const handleSelectWeek = (selected: {
    start: string;
    end: string;
    label: string;
  }) => {
    setDateRange(selected);
    setShowWeekModal(false);
  };

  const handleSessionToggle = () => {
    setSession((current) =>
      current === "Buổi sáng" ? "Buổi chiều" : "Buổi sáng"
    );
  };

  const fetchSchedule = () => {
    setLoading(true);
    // Giả sử có hàm fetch dữ liệu từ API
    // fetchDataFromApi().then((data) => {
    //   const { schedule, lessonIds } = mapApiToScheduleData(data);
    //   setScheduleData(schedule);
    //   setLessonIds(lessonIds);
    //   setLoading(false);
    // }).catch((err) => {
    //   setError(err.message);
    //   setLoading(false);
    // });
  };

  return (
    <View style={styles.container}>
      <ScheduleHeader
        title={session}
        dateRange={dateRange.label}
        year={year}
        onPressTitle={handleSessionToggle}
        onChangeYear={handleChangeYear}
        onChangeDateRange={handleChangeDateRange}
      />
      <DaySelector days={days} onCurrentDayChange={setCurrentDayIndex} />
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3A546D"
          style={{ marginTop: 30 }}
        />
      ) : error ? (
        <View style={{ alignItems: "center", marginTop: 30 }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={{ flex: 1 }}>
            <ScheduleDay
              periods={periods}
              days={days}
              scheduleData={displayedData}
              onAddActivity={handleAddActivity}
              onSlotPress={handleSlotDetail}
              currentDayIndex={currentDayIndex}
              lessonIds={
                session === "Buổi sáng"
                  ? lessonIds.slice(0, 5)
                  : lessonIds.slice(5, 10)
              }
            />
          </View>
        </ScrollView>
      )}
      <Modal visible={showYearModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowYearModal(false)}
        >
          <View style={styles.modalContent}>
            {academicYears.map((y) => (
              <TouchableOpacity
                key={y}
                style={styles.modalItem}
                onPress={() => handleSelectYear(y)}
              >
                <Text style={styles.modalItemText}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={showWeekModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowWeekModal(false)}
        >
          <View style={[styles.modalContent, { maxHeight: 400 }]}>
            <FlatList
              data={weekList}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectWeek(item)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#3A546D",
    textAlign: "center",
  },
});

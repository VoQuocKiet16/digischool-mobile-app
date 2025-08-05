import AsyncStorage from "@react-native-async-storage/async-storage";
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
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getStudentSchedule } from "../../../services/schedule.service";

export interface Activity {
  text: string;
  type: "default" | "user-added" | "user-activity" | "conflict";
  content?: string;
  time?: number;
  remindAt?: string;
  date?: string;
  lessonId?: string;
  subject?: any;
  teacher?: any;
  isMakeupLesson?: boolean;
  lessonText?: string;
  activityText?: string;
  activityData?: {
    content?: string;
    time?: number;
    remindAt?: string;
    date?: string;
    id?: string;
  };
  hasConflict?: boolean;
  [key: string]: any;
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

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

function getCurrentWeekNumber(): number {
  return getWeekNumber(new Date());
}

function mapApiToScheduleData(apiData: any): {
  schedule: Activity[][];
  lessonIds: string[][];
  academicYear?: string;
  weekNumber?: number;
} {
  // 10 periods x 7 days
  const schedule: Activity[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => ({ text: "", type: "user-added" }))
  );
  const lessonIds: string[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => "")
  );

  // Lấy dữ liệu từ response mới
  const lessons = apiData?.data?.weeklySchedule?.lessons || [];
  const academicYear = apiData?.data?.academicYear;
  const weekNumber = apiData?.data?.weeklySchedule?.weekNumber;

  // Map môn học vào slot
  lessons.forEach((lesson: any) => {
    const dayNumber = lesson.dayNumber || 1; // 1-7 (Thứ 2 = 1, CN = 7)
    const dayIndex = dayNumber === 7 ? 6 : dayNumber - 1; // Chuyển về index 0-6
    // Lấy period từ timeSlot
    const periodIndex = (lesson.timeSlot?.period || 1) - 1;
    if (periodIndex >= 0 && periodIndex < 10) {
      let text = "";
      text = lesson.subject?.subjectName || "";
      schedule[periodIndex][dayIndex] = {
        text,
        type: "default",
        lessonId: lesson._id,
        subject: lesson.subject,
        teacher: lesson.teacher,
        isMakeupLesson: lesson.isMakeupLesson || false, // Thêm flag để nhận diện tiết dạy bù
      };
      if (lesson._id) {
        lessonIds[periodIndex][dayIndex] = lesson._id;
      }
    }
  });

  // Map các hoạt động cá nhân vào slot và xử lý xung đột
  const activities = apiData?.data?.studentPersonalActivities || [];
  activities.forEach((activity: any) => {
    const date = new Date(activity.date);
    const startDate = new Date(apiData?.data?.weeklySchedule?.startDate);
    const dayIndex = Math.floor(
      (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    const periodIndex = (activity.period || 1) - 1;
    if (periodIndex >= 0 && periodIndex < 10 && dayIndex >= 0 && dayIndex < 7) {
      const existingSlot = schedule[periodIndex][dayIndex];
      
      // Kiểm tra xung đột: nếu slot đã có môn học
      if (existingSlot && existingSlot.type === "default" && existingSlot.text) {
        // Tạo slot xung đột với thông tin cả môn học và hoạt động
        schedule[periodIndex][dayIndex] = {
          text: `${existingSlot.text} + ${activity.title}`,
          type: "conflict", // Loại slot mới để xử lý xung đột
          lessonText: existingSlot.text,
          activityText: activity.title,
          lessonId: existingSlot.lessonId,
          subject: existingSlot.subject,
          teacher: existingSlot.teacher,
          isMakeupLesson: existingSlot.isMakeupLesson,
          activityData: {
            content: activity.content,
            time: activity.time,
            remindAt: activity.remindAt,
            date: activity.date,
            id: activity._id,
          },
          hasConflict: true, // Flag để UI biết có xung đột
        };
      } else {
        // Không có xung đột, thêm hoạt động bình thường
        schedule[periodIndex][dayIndex] = {
          text: activity.title,
          type: "user-activity",
          content: activity.content,
          time: activity.time,
          remindAt: activity.remindAt,
          date: activity.date,
          id: activity._id,
        };
      }
    }
  });

  return { schedule, lessonIds, academicYear, weekNumber };
}

function getTodayIndex() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

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
  const [year, setYear] = useState("2025-2026"); // Mặc định năm học hiện tại
  const [weekNumber, setWeekNumber] = useState(1); // Mặc định tuần 1
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(getTodayIndex());
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // State để lưu danh sách năm học và tuần có sẵn
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  const days = defaultDays;

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const userClassStr = (await AsyncStorage.getItem("userClass")) || "";

      // Parse userClass từ JSON string
      let className = "";
      try {
        const userClassObj = JSON.parse(userClassStr);
        className = userClassObj.className || userClassObj.id || "";
      } catch (parseError) {
        // Nếu không parse được, dùng trực tiếp
        className = userClassStr;
      }

      const data = await getStudentSchedule({
        className,
        academicYear: year,
        weekNumber,
      });

      const {
        schedule,
        lessonIds: newLessonIds,
        academicYear: responseYear,
        weekNumber: responseWeek,
      } = mapApiToScheduleData(data);

      setScheduleData(schedule);
      setLessonIds(newLessonIds);

      // Lấy startDate và endDate từ response
      const startDate = data?.data?.weeklySchedule?.startDate;
      const endDate = data?.data?.weeklySchedule?.endDate;
      if (startDate && endDate)
        setDateRange({ start: startDate, end: endDate });

      // Cập nhật năm học và tuần từ response nếu có
      if (responseYear && !availableYears.includes(responseYear)) {
        setAvailableYears((prev) => [...prev, responseYear]);
      }
      if (responseWeek && !availableWeeks.includes(responseWeek)) {
        setAvailableWeeks((prev) => [...prev, responseWeek]);
      }
    } catch (err) {
      setError("Lỗi tải thời khóa biểu");
      setScheduleData(initialScheduleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [year, weekNumber]);

  const handleAddActivity = (
    dayIndex: number,
    periodIndex: number,
    activityText: string
  ) => {
    // Tính ngày cụ thể từ dateRange và dayIndex
    let date = "";
    if (dateRange) {
      const startDate = new Date(dateRange.start);
      const slotDate = new Date(startDate);
      slotDate.setDate(startDate.getDate() + dayIndex);
      date = slotDate.toISOString();
    }
    router.push({
      pathname: "/activity/add_activity",
      params: { periodIndex, date },
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

  // Hiển thị dữ liệu theo buổi sáng hoặc chiều
  const displayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5)
      : scheduleData.slice(5, 10);
  const periods = session === "Buổi sáng" ? morningPeriods : afternoonPeriods;

  // Modal chọn năm học
  const handleChangeYear = () => setShowYearModal(true);
  const handleSelectYear = (selected: string) => {
    setYear(selected);
    setWeekNumber(1); // Đổi năm thì về tuần đầu tiên
    setShowYearModal(false);
  };

  // Modal chọn tuần
  const handleChangeWeek = () => setShowWeekModal(true);
  const handleSelectWeek = (selected: {
    weekNumber: number;
    label: string;
  }) => {
    setWeekNumber(selected.weekNumber);
    setShowWeekModal(false);
  };

  // Chuyển buổi sáng/chiều
  const handleSessionToggle = () => {
    setSession((current) =>
      current === "Buổi sáng" ? "Buổi chiều" : "Buổi sáng"
    );
  };

  return (
    <View style={styles.container}>
      <ScheduleHeader
        title={session}
        dateRange={`Tuần ${weekNumber}`}
        year={year}
        onPressTitle={handleSessionToggle}
        onChangeYear={handleChangeYear}
        onChangeDateRange={handleChangeWeek}
      />
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
        <RefreshableScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onRefresh={fetchSchedule}
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
              dateRange={dateRange}
              showUtilityButton={true}
            />
          </View>
        </RefreshableScrollView>
      )}
      {/* Modal chọn năm học */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowYearModal(false)}
        >
          <View style={styles.modalContent}>
            {availableYears.length > 0 ? (
              availableYears.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={styles.modalItem}
                  onPress={() => handleSelectYear(y)}
                >
                  <Text style={styles.modalItemText}>{y}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.modalItemText}>Không có dữ liệu</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Modal chọn tuần */}
      <Modal
        visible={showWeekModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowWeekModal(false)}
        >
          <View style={[styles.modalContent, { maxHeight: 400 }]}>
            {availableWeeks.length > 0 ? (
              <FlatList
                data={availableWeeks.map((week) => ({
                  weekNumber: week,
                  label: `Tuần ${week}`,
                }))}
                keyExtractor={(item) => item.weekNumber.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectWeek(item)}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.modalItemText}>Không có dữ liệu</Text>
            )}
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
    minWidth: 120,
    maxWidth: 200,
    minHeight: 80,
    maxHeight: 200,
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

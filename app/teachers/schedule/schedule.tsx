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
import { getAvailableAcademicYearsAndWeeks, getTeacherSchedule } from "../../../services/schedule.service";
import { Activity } from "../../../types/schedule.types";

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

function mapApiToTeacherScheduleData(apiData: any): {
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

  // Lấy dữ liệu từ response của API giáo viên
  const lessons = apiData?.data?.lessons || [];
  const academicYear = apiData?.data?.academicYear;
  const weekNumber = apiData?.data?.weekNumber;

  lessons.forEach((lesson: any) => {
    const dayNumber = lesson.dayNumber || 1; // 1-7 (Thứ 2 = 1, CN = 7)
    const dayIndex = dayNumber === 7 ? 6 : dayNumber - 1; // Chuyển về index 0-6
    // Lấy period từ timeSlot
    const periodIndex = (lesson.timeSlot?.period || 1) - 1;
    if (periodIndex >= 0 && periodIndex < 10) {
      let text = "";
      text = `${lesson.class?.className || ""} - ${lesson.subject?.subjectName}`;
      
      // Kiểm tra các trường boolean để thêm hasNotification
      const hasNotification = lesson.hasTestInfo || lesson.hasTeacherLeaveRequest || 
                             lesson.hasSubstituteRequest || lesson.hasSwapRequest || 
                             lesson.hasMakeupRequest;
      
      if (text) {
        schedule[periodIndex][dayIndex] = {
          text,
          type: "default",
          status: lesson.status || "scheduled", // Thêm status từ API
          hasNotification: hasNotification, // Thêm hasNotification dựa trên các trường boolean
        };
        if (lesson._id) {
          lessonIds[periodIndex][dayIndex] = lesson._id;
        }
      }
    }
  });

  // Map các hoạt động cá nhân của giáo viên vào slot
  const activities = apiData?.data?.teacherPersonalActivities || [];
  const startDate = apiData?.data?.startDate
    ? new Date(apiData.data.startDate)
    : null;
  activities.forEach((activity: any) => {
    if (!startDate) return;
    const date = new Date(activity.date);
    const dayIndex = Math.floor(
      (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    const periodIndex = (activity.period || 1) - 1;
    if (periodIndex >= 0 && periodIndex < 10 && dayIndex >= 0 && dayIndex < 7) {
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
  });

  return { schedule, lessonIds, academicYear, weekNumber };
}

export default function ScheduleTeachersScreen() {
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
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  });

  // State để lưu danh sách năm học và tuần có sẵn
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const days = defaultDays;

  // Function để lấy danh sách năm học và tuần có sẵn
  const fetchAvailableData = async () => {
    try {
      const response = await getAvailableAcademicYearsAndWeeks();
      if (response.success && response.data) {
        const { availableAcademicYears, currentAcademicYear } = response.data;
        
        // Lấy danh sách năm học
        const years = availableAcademicYears.map((year: any) => year.name);
        setAvailableYears(years);
        
        // Nếu có năm học hiện tại, set làm mặc định
        if (currentAcademicYear && years.includes(currentAcademicYear.name)) {
          setYear(currentAcademicYear.name);
          
          // Lấy tuần đầu tiên có sẵn của năm học hiện tại
          const currentYearData = availableAcademicYears.find((year: any) => year.name === currentAcademicYear.name);
          if (currentYearData && currentYearData.weekNumbers.length > 0) {
            setWeekNumber(currentYearData.weekNumbers[0]);
            setAvailableWeeks(currentYearData.weekNumbers);
          }
        } else if (years.length > 0) {
          // Nếu không có năm học hiện tại, dùng năm đầu tiên có sẵn
          setYear(years[0]);
          const firstYearData = availableAcademicYears.find((year: any) => year.name === years[0]);
          if (firstYearData && firstYearData.weekNumbers.length > 0) {
            setWeekNumber(firstYearData.weekNumbers[0]);
            setAvailableWeeks(firstYearData.weekNumbers);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching available data:", err);
      // Fallback: giữ nguyên giá trị mặc định
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeacherSchedule({
        teacherId: (await AsyncStorage.getItem("userTeacherId")) || "",
        academicYear: year,
        weekNumber,
      });

      const {
        schedule,
        lessonIds: newLessonIds,
        academicYear: responseYear,
        weekNumber: responseWeek,
      } = mapApiToTeacherScheduleData(data);

      setScheduleData(schedule);
      setLessonIds(newLessonIds);

      // Lấy startDate và endDate từ response
      const startDate = data?.data?.startDate;
      const endDate = data?.data?.endDate;
      if (startDate && endDate)
        setDateRange({ start: startDate, end: endDate });

      // Cập nhật danh sách tuần có sẵn cho năm học hiện tại
      if (responseYear) {
        try {
          const availableData = await getAvailableAcademicYearsAndWeeks();
          if (availableData.success && availableData.data) {
            const currentYearData = availableData.data.availableAcademicYears.find(
              (yearData: any) => yearData.name === responseYear
            );
            if (currentYearData) {
              setAvailableWeeks(currentYearData.weekNumbers);
            }
          }
        } catch (err) {
          console.error("Error updating available weeks:", err);
        }
      }
    } catch (err) {
      setError("Lỗi tải thời khóa biểu");
      setScheduleData(initialScheduleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableData();
  }, []);

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
        pathname: "/teachers/lesson_information/lesson_detail",
        params: { lessonId },
      });
    } else {
      router.push("/teachers/lesson_information/lesson_detail");
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
  const handleSelectYear = async (selected: string) => {
    setYear(selected);
    setWeekNumber(1); // Đổi năm thì về tuần đầu tiên
    
    // Cập nhật danh sách tuần có sẵn cho năm học mới
    try {
      const availableData = await getAvailableAcademicYearsAndWeeks();
      if (availableData.success && availableData.data) {
        const selectedYearData = availableData.data.availableAcademicYears.find(
          (yearData: any) => yearData.name === selected
        );
        if (selectedYearData) {
          setAvailableWeeks(selectedYearData.weekNumbers);
          // Set tuần đầu tiên có sẵn
          if (selectedYearData.weekNumbers.length > 0) {
            setWeekNumber(selectedYearData.weekNumbers[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error updating weeks for new year:", err);
    }
    
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
      <Modal visible={showYearModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowYearModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn năm học</Text>
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
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Không có dữ liệu năm học</Text>
                <Text style={styles.noDataSubText}>Vui lòng thử lại sau</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Modal chọn tuần */}
      <Modal visible={showWeekModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowWeekModal(false)}
        >
          <View style={[styles.modalContent, { maxHeight: 400 }]}>
            <Text style={styles.modalTitle}>Chọn tuần</Text>
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
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Không có dữ liệu tuần</Text>
                <Text style={styles.noDataSubText}>Vui lòng chọn năm học khác</Text>
              </View>
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
    minWidth: 110,
    maxWidth: 200,
    minHeight: 80,
    maxHeight: 200,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    textAlign: "center",
    marginBottom: 16,
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
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

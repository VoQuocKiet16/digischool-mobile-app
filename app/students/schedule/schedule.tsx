import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { getAvailableAcademicYearsAndWeeks, getStudentSchedule } from "../../../services/schedule.service";
import { buildScheduleKey, useScheduleStore } from "../../../stores/schedule.store";
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
      
      // Kiểm tra các trường boolean để thêm hasNotification
      const hasNotification = lesson.hasTestInfo || lesson.hasStudentLeaveRequest;
      
      schedule[periodIndex][dayIndex] = {
        text,
        type: "default",
        lessonId: lesson._id,
        subject: lesson.subject,
        teacher: lesson.teacher,
        isMakeupLesson: lesson.isMakeupLesson || false, // Thêm flag để nhận diện tiết dạy bù
        status: lesson.status || "scheduled", // Thêm status từ API
        hasNotification: hasNotification, // Thêm hasNotification dựa trên các trường boolean
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
          hasNotification: existingSlot.hasNotification, // Giữ nguyên hasNotification từ lesson
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
  const yearRef = useRef(year);
  const weekNumberRef = useRef(weekNumber);
  const getCache = useScheduleStore((s) => s.getCache);
  const setCache = useScheduleStore((s) => s.setCache);

  // State để lưu danh sách năm học và tuần có sẵn
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

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

  const fetchSchedule = useCallback(async (forceRefresh = false) => {
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

      // Đọc cache trước
      const cacheKey = buildScheduleKey({ role: "student", userKey: className, academicYear: yearRef.current, weekNumber: weekNumberRef.current });
      const cached = getCache(cacheKey);
      if (cached) {
        setScheduleData(cached.schedule as any);
        setLessonIds(cached.lessonIds);
        setDateRange(cached.dateRange || null);
        setAvailableYears(cached.availableYears || []);
        setAvailableWeeks(cached.availableWeeks || []);
      }

      // TTL: 45 phút - chỉ áp dụng khi không force refresh
      if (!forceRefresh) {
        const staleTimeMs = 45 * 60 * 1000;
        const isFresh = cached && Date.now() - cached.updatedAt < staleTimeMs;
        if (isFresh) {
          setLoading(false);
          return;
        }
      }

      const data = await getStudentSchedule({
        className,
        academicYear: yearRef.current,
        weekNumber: weekNumberRef.current,
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
      const nextDateRange = startDate && endDate ? { start: startDate, end: endDate } : null;
      if (nextDateRange) setDateRange(nextDateRange);

      // Lấy availableYears và availableWeeks từ response trước khi lưu cache
      const years = data?.data?.availableYears || data?.data?.weeklySchedule?.availableYears || [];
      const weeks = data?.data?.availableWeeks || data?.data?.weeklySchedule?.availableWeeks || [];
      
      // Cập nhật state
      if (Array.isArray(years) && years.length > 0) setAvailableYears(years);
      if (Array.isArray(weeks) && weeks.length > 0) setAvailableWeeks(weeks);

      // Cập nhật cache với dữ liệu mới
      setCache(cacheKey, { 
        schedule, 
        lessonIds: newLessonIds, 
        dateRange: nextDateRange,
        availableYears: years,
        availableWeeks: weeks
      });
      
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
      // Không overwrite dữ liệu nếu đã có cache
      if (!scheduleData?.length) setScheduleData(initialScheduleData);
    } finally {
      setLoading(false);
    }
  }, []); // Không cần dependency array vì sử dụng refs và store functions

  // Handler cho pull-to-refresh
  const handleRefresh = async () => {
    await fetchSchedule(true); // Force refresh bỏ qua TTL
  };

  useEffect(() => {
    fetchAvailableData();
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, []); // fetchSchedule được wrap trong useCallback với empty dependency array

  // Tự động refresh khi màn hình được focus (sau khi thêm hoạt động)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Student Schedule: Screen focused, checking if refresh needed...');
      
      const checkAndRefreshIfNeeded = async () => {
        try {
          // Kiểm tra xem có cần refresh TKB không
          const scheduleRefreshStr = await AsyncStorage.getItem('scheduleNeedsRefresh');
          if (scheduleRefreshStr) {
            try {
              const refreshData = JSON.parse(scheduleRefreshStr);
              console.log('🔄 Found schedule refresh notification:', refreshData);
              
              // Kiểm tra xem update có thuộc tuần hiện tại không
              if (dateRange?.start && dateRange?.end) {
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                const activityDate = new Date(refreshData.data.date);
                
                if (activityDate >= startDate && activityDate <= endDate) {
                  console.log('🔄 Refresh notification belongs to current week, refreshing schedule...');
                  // Refresh TKB để hiển thị hoạt động mới
                  await fetchSchedule(true);
                  
                  // Xóa notification đã xử lý
                  await AsyncStorage.removeItem('scheduleNeedsRefresh');
                  console.log('🔄 Schedule refreshed and notification removed');
                }
              }
            } catch (parseError) {
              console.error('Error parsing schedule refresh notification:', parseError);
              await AsyncStorage.removeItem('scheduleNeedsRefresh');
            }
          }
          
          const userClassStr = (await AsyncStorage.getItem("userClass")) || "";
          let className = "";
          try {
            const userClassObj = JSON.parse(userClassStr);
            className = userClassObj.className || userClassObj.id || "";
          } catch (parseError) {
            className = userClassStr;
          }

          const cacheKey = buildScheduleKey({ role: "student", userKey: className, academicYear: yearRef.current, weekNumber: weekNumberRef.current });
          
          // Kiểm tra cache hiện tại
          const cached = getCache(cacheKey);
          
          if (cached) {
            // Luôn load dữ liệu từ cache trước để hiển thị ngay lập tức
            console.log('🔄 Student Schedule: Loading data from cache...');
            setScheduleData(cached.schedule as any);
            setLessonIds(cached.lessonIds);
            setDateRange(cached.dateRange || null);
            setAvailableYears(cached.availableYears || []);
            setAvailableWeeks(cached.availableWeeks || []);
            
            // Kiểm tra xem cache có còn fresh không
            if (Date.now() - cached.updatedAt > 45 * 60 * 1000) {
              console.log('🔄 Student Schedule: Cache expired, refreshing in background...');
              // Refresh trong background, không block UI
              fetchSchedule(true);
            } else {
              console.log('🔄 Student Schedule: Cache still fresh, no refresh needed');
            }
          } else {
            console.log('🔄 Student Schedule: No cache found, fetching from API...');
            await fetchSchedule(true);
          }
        } catch (error) {
          console.error('🔄 Student Schedule: Error checking refresh:', error);
        }
      };
      
      checkAndRefreshIfNeeded();
    }, [dateRange]) // Chỉ cần dateRange
  );

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
          onRefresh={handleRefresh}
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
            <Text style={styles.modalTitle}>Chọn năm học</Text>
            {availableYears.length > 0 ? (
              availableYears.map((y) => (
                <TouchableOpacity
                  key={`year-${y}`}
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
    minWidth: 120,
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

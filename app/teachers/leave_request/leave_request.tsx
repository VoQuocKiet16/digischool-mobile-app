import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getAvailableAcademicYearsAndWeeks, getCurrentWeek, getTeacherSchedule } from "../../../services/schedule.service";
import { Activity } from "../../../types/schedule.types";
import { fonts } from "../../../utils/responsive";

const defaultActivity = (text: string, hasNotification = false): Activity => ({
  text,
  type: "default",
  hasNotification,
});

const initialScheduleData: Activity[][] = [
  // Tiết 1
  [
    defaultActivity("10A3"), // Thứ 2
    defaultActivity("11A1"), // Thứ 3
    defaultActivity("10A3"), // Thứ 4 (dạy 2 lớp)
    defaultActivity(""), // Thứ 5
    defaultActivity("12A2"), // Thứ 6
    defaultActivity(""), // Thứ 7
    defaultActivity(""), // CN
  ],
  // Tiết 2
  [
    defaultActivity("10A2"),
    defaultActivity("10A3"),
    defaultActivity("11A1"),
    defaultActivity(""),
    defaultActivity("12A2"),
    defaultActivity(""),
    defaultActivity(""),
  ],
  // ... các tiết khác
];

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];

function mapApiToTeacherScheduleData(apiData: any): {
  schedule: Activity[][];
  lessonIds: string[][];
  academicYear?: string;
  weekNumber?: number;
} {
  const schedule: Activity[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => ({ text: "", type: "user-added" }))
  );
  const lessonIds: string[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => "")
  );
  const lessons = apiData?.data?.lessons || [];
  const academicYear = apiData?.data?.academicYear;
  const weekNumber = apiData?.data?.weekNumber;
  lessons.forEach((lesson: any) => {
    const dayNumber = lesson.dayNumber || 1;
    const dayIndex = dayNumber === 7 ? 6 : dayNumber - 1;
    const periodIndex = (lesson.timeSlot?.period || 1) - 1;
    if (periodIndex >= 0 && periodIndex < 10) {
      let text = "";
      text = `${lesson.class?.className || ""} - ${
        lesson.subject.subjectName
      }`;
      
      // Kiểm tra nếu lesson đã có leave request thì bỏ qua (ẩn lesson)
      if (lesson.hasTeacherLeaveRequest) {
        // Không thêm lesson này vào schedule để ẩn nó
        return;
      }
      
      if (text) {
        schedule[periodIndex][dayIndex] = { 
          text, 
          type: "default",
          status: lesson.status || "scheduled", // Thêm status từ API
          hasNotification: lesson.hasTestInfo || lesson.hasTeacherLeaveRequest || 
                          lesson.hasSubstituteRequest || lesson.hasSwapRequest || 
                          lesson.hasMakeupRequest, // Thêm hasNotification
        };
        if (lesson._id) {
          lessonIds[periodIndex][dayIndex] = lesson._id;
        }
      }
    }
  });
  return { schedule, lessonIds, academicYear, weekNumber };
}

export default function TeacherLeaveRequestScreen() {
  const router = useRouter();
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">(
    "Buổi sáng"
  );
  const [selected, setSelected] = useState<
    {
      row: number;
      col: number;
      lessonId: string;
      session: "Buổi sáng" | "Buổi chiều";
      week: number;
    }[]
  >([]);
  const [scheduleData, setScheduleData] = useState<Activity[][]>(
    Array.from({ length: 10 }, () =>
      Array.from({ length: 7 }, () => ({ text: "", type: "user-added" }))
    )
  );
  const [lessonIds, setLessonIds] = useState<string[][]>(
    Array.from({ length: 10 }, () => Array.from({ length: 7 }, () => ""))
  );
  const [year, setYear] = useState("2025-2026");
  const [weekNumber, setWeekNumber] = useState(1);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true); // Bắt đầu với loading = true
  const [error, setError] = useState("");
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  
  // Flag để tránh gọi API trùng lặp
  const [isInitialized, setIsInitialized] = useState(false);

  // Function để lấy danh sách năm học và tuần có sẵn, đồng thời xác định tuần hiện tại
  const fetchAvailableData = async () => {
    setLoading(true); // Bắt đầu loading
    try {
      // Gọi 2 API song song để tối ưu thời gian
      const [currentWeekResponse, availableWeeksResponse] = await Promise.all([
        getCurrentWeek(),
        getAvailableAcademicYearsAndWeeks()
      ]);
      
      if (currentWeekResponse.success && availableWeeksResponse.success) {
        const { academicYear, weekNumber: currentWeekNumber } = currentWeekResponse.data;
        const { availableAcademicYears, currentAcademicYear } = availableWeeksResponse.data;
        
        // Lấy danh sách năm học
        const years = availableAcademicYears.map((year: any) => year.name);
        setAvailableYears(years);
        
        // Sử dụng thông tin tuần hiện tại từ API mới
        if (academicYear && currentWeekNumber) {
          setYear(academicYear);
          setWeekNumber(currentWeekNumber);
          
          // Lấy danh sách tuần có sẵn cho năm học hiện tại
          const currentYearData = availableAcademicYears.find(
            (year: any) => year.name === academicYear
          );
          if (currentYearData) {
            setAvailableWeeks(currentYearData.weekNumbers);
          }
        } else if (currentAcademicYear && years.includes(currentAcademicYear.name)) {
          // Fallback: nếu không có currentWeek, dùng currentAcademicYear
          setYear(currentAcademicYear.name);
          
          // Lấy tuần đầu tiên có sẵn của năm học hiện tại
          const currentYearData = availableAcademicYears.find((year: any) => year.name === currentAcademicYear.name);
          if (currentYearData && currentYearData.weekNumbers.length > 0) {
            setWeekNumber(currentYearData.weekNumbers[0]);
            setAvailableWeeks(currentYearData.weekNumbers);
          }
        } else if (years.length > 0) {
          // Fallback cuối cùng: dùng năm đầu tiên có sẵn
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
      const teacherId = (await AsyncStorage.getItem("userTeacherId")) || "";
      const data = await getTeacherSchedule({
        teacherId,
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
      // Lấy availableYears, availableWeeks từ response nếu có
      const years = data?.data?.availableYears || [];
      if (Array.isArray(years) && years.length > 0) setAvailableYears(years);
      const weeks = data?.data?.availableWeeks || [];
      if (Array.isArray(weeks) && weeks.length > 0) setAvailableWeeks(weeks);
      // Cập nhật năm học và tuần từ response nếu có
      if (responseYear && responseYear !== year) {
        setYear(responseYear);
      }
      if (responseWeek && responseWeek !== weekNumber) {
        setWeekNumber(responseWeek);
      }
    } catch (err) {
      setError("Lỗi tải thời khoá biểu");
      setScheduleData(
        Array.from({ length: 10 }, () =>
          Array.from({ length: 7 }, () => ({ text: "", type: "user-added" }))
        )
      );
      setLessonIds(
        Array.from({ length: 10 }, () => Array.from({ length: 7 }, () => ""))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeSchedule = async () => {
      if (isInitialized) return; // Tránh gọi lại nếu đã khởi tạo
      
      // 1. Đầu tiên lấy thông tin năm học và tuần hiện tại
      await fetchAvailableData();
      
      setIsInitialized(true);
    };
    
    initializeSchedule();
  }, [isInitialized]); // Chỉ chạy khi isInitialized thay đổi

  // Tự động fetch schedule khi year hoặc weekNumber thay đổi
  useEffect(() => {
    if (isInitialized && year && weekNumber) {
      fetchSchedule();
    }
  }, [year, weekNumber, isInitialized]);

  // Modal chọn năm học/tuần học
  const handleChangeYear = () => setShowYearModal(true);
  const handleSelectYear = (selected: string) => {
    setYear(selected);
    setWeekNumber(1); // Reset về tuần 1 khi đổi năm
    setShowYearModal(false);
  };
  const handleChangeWeek = () => setShowWeekModal(true);
  const handleSelectWeek = (selected: {
    weekNumber: number;
    label: string;
  }) => {
    setWeekNumber(selected.weekNumber);
    setShowWeekModal(false);
  };

  // Logic chọn slot xin nghỉ giữ nguyên
  const handleSelectSlot = (dayIndex: number, periodIndex: number) => {
    const isExist = selected.some(
      (cell) =>
        cell.row === periodIndex &&
        cell.col === dayIndex &&
        cell.session === session &&
        cell.week === weekNumber
    );
    if (isExist) {
      setSelected(
        selected.filter(
          (cell) =>
            !(
              cell.row === periodIndex &&
              cell.col === dayIndex &&
              cell.session === session &&
              cell.week === weekNumber
            )
        )
      );
    } else {
      setSelected([
        ...selected,
        {
          row: periodIndex,
          col: dayIndex,
          lessonId: lessonIds[periodIndex][dayIndex] || "",
          session,
          week: weekNumber,
        },
      ]);
    }
  };

  // Hiển thị dữ liệu theo session và lọc bỏ tiết completed
  const displayedData: (Activity | null)[][] =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5).map(row => 
          row.map(slot => 
            slot && slot.status === "completed" 
              ? null 
              : slot
          )
        )
      : scheduleData.slice(5, 10).map(row => 
          row.map(slot => 
            slot && slot.status === "completed" 
              ? null 
              : slot
          )
        );
  const periods = session === "Buổi sáng" ? morningPeriods : afternoonPeriods;

  return (
    <HeaderLayout
      title="Tiết dạy xin nghỉ"
      subtitle="Chọn các tiết dạy bạn muốn xin phép nghỉ"
      onBack={() => router.back()}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScheduleHeader
            title={session}
            dateRange={`Tuần ${weekNumber}`}
            year={year}
            onPressTitle={() =>
              setSession(session === "Buổi sáng" ? "Buổi chiều" : "Buổi sáng")
            }
            // Không cho phép thay đổi năm học và tuần
            onChangeYear={undefined}
            onChangeDateRange={undefined}
          />
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#3A546D"
              style={{ marginTop: 30 }}
            />
          ) : error ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "red" }}>{error}</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <ScheduleDay
                periods={periods}
                days={days}
                onAddActivity={handleSelectSlot}
                scheduleData={displayedData}
                selectedSlots={selected.filter(
                  (cell) => cell.session === session && cell.week === weekNumber
                )}
                onSelectSlot={handleSelectSlot}
                onSlotPress={handleSelectSlot}
                hideNullSlot={true}
                showUtilityButton={false}
              />
            </ScrollView>
          )}
          {/* Không hiển thị modal chọn năm học và tuần */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={styles.legendBox} />
              <Text style={styles.legendText}>Tiết dạy hiện tại</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxSelected]} />
              <Text style={styles.legendText}>Tiết dạy xin nghỉ</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              selected.length === 0 && styles.buttonDisabled,
            ]}
            disabled={selected.length === 0}
            onPress={() => {
              if (selected.length > 0) {
                const subjects = selected.map(
                  ({ row, col }) => displayedData[row][col]?.text || ""
                );
                const lessonIdsSelected = selected.map(
                  ({ row, col }) => lessonIds[row][col]
                );
                router.push({
                  pathname: "/teachers/leave_request/leave_request_info",
                  params: {
                    selectedSlots: JSON.stringify(selected),
                    subjects: JSON.stringify(subjects),
                    days: JSON.stringify(days),
                    lessonIds: JSON.stringify(lessonIdsSelected),
                  },
                });
              }
            }}
          >
            <Text
              style={[
                styles.buttonText,
                selected.length === 0 && styles.buttonTextDisabled,
              ]}
            >
              Tiếp tục
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 54,
    height: 48,
    backgroundColor: "#29375C",
    borderRadius: 8,
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  slotEmpty: { backgroundColor: "transparent" },
  slotSelected: { backgroundColor: "#FFA726" },
  slotText: { color: "#f7f7f7", fontWeight: "bold", fontSize: 13 },
  slotTextSelected: { color: "#f7f7f7" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    position: "absolute",
    top: 6,
    right: 8,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    backgroundColor: "#29375C",
    borderRadius: 5,
    marginRight: 6,
  },
  legendBoxSelected: { backgroundColor: "#FFA726" },
  legendText: { color: "#29375C", fontSize: 13 },
  button: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
  },
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: {
    color: "#f7f7f7",
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#f7f7f7",
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

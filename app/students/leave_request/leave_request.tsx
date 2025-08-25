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
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getAvailableAcademicYearsAndWeeks, getCurrentWeek, getStudentSchedule } from "../../../services/schedule.service";
import { Activity } from "../../../types/schedule.types";
import { fonts } from "../../../utils/responsive";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];

function mapApiToScheduleData(apiData: any): {
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
  const lessons = apiData?.data?.weeklySchedule?.lessons || [];
  const academicYear = apiData?.data?.academicYear;
  const weekNumber = apiData?.data?.weeklySchedule?.weekNumber;
  lessons.forEach((lesson: any) => {
    const dayNumber = lesson.dayNumber || 1;
    const dayIndex = dayNumber === 7 ? 6 : dayNumber - 1;
    const periodIndex = (lesson.timeSlot?.period || 1) - 1;
    if (periodIndex >= 0 && periodIndex < 10) {
      let text = "";
      text = lesson.subject?.subjectName || "";
      
      // Kiểm tra nếu lesson đã có leave request thì bỏ qua (ẩn lesson)
      if (lesson.hasStudentLeaveRequest) {
        // Không thêm lesson này vào schedule để ẩn nó
        return;
      }
      
      schedule[periodIndex][dayIndex] = { 
        text, 
        type: "default",
        status: lesson.status || "scheduled", // Thêm status từ API
        hasNotification: lesson.hasTestInfo || lesson.hasStudentLeaveRequest, // Thêm hasNotification
      };
      if (lesson._id) {
        lessonIds[periodIndex][dayIndex] = lesson._id;
      }
    }
  });
  return { schedule, lessonIds, academicYear, weekNumber };
}

export default function LeaveRequestScreen() {
  const router = useRouter();
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">("Buổi sáng");
  const [selected, setSelected] = useState<
    {
      row: number;
      col: number;
      lessonId: string;
      session: "Buổi sáng" | "Buổi chiều";
      week: number;
      date?: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function để lấy danh sách năm học và tuần có sẵn, đồng thời xác định tuần hiện tại
  const fetchAvailableData = async () => {
    setLoading(true);
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
      const userClassStr = (await AsyncStorage.getItem("userClass")) || "";
      let className = "";
      try {
        const userClassObj = JSON.parse(userClassStr);
        className = userClassObj.className || userClassObj.id || "";
      } catch (parseError) {
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
      
      // Lấy availableYears, availableWeeks từ response nếu có
      const years =
        data?.data?.availableYears ||
        data?.data?.weeklySchedule?.availableYears ||
        [];
      if (Array.isArray(years) && years.length > 0) setAvailableYears(years);
      const weeks =
        data?.data?.availableWeeks ||
        data?.data?.weeklySchedule?.availableWeeks ||
        [];
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
      if (isInitialized) return;
      
      await fetchAvailableData();
      setIsInitialized(true);
    };
    
    initializeSchedule();
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && year && weekNumber) {
      fetchSchedule();
    }
  }, [year, weekNumber, isInitialized]);

  // Modal chọn năm học/tuần học
  const handleChangeYear = () => setShowYearModal(true);
  const handleSelectYear = (selected: string) => {
    setYear(selected);
    setWeekNumber(1);
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

  // Logic chọn slot xin nghỉ
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
      const actualPeriodIndex = session === "Buổi sáng" ? periodIndex : periodIndex + 5;
      const lessonId = lessonIds[actualPeriodIndex][dayIndex] || "";
      
      setSelected([
        ...selected,
        {
          row: periodIndex,
          col: dayIndex,
          lessonId,
          session,
          week: weekNumber,
        },
      ]);
    }
  };

  // Logic chọn cả ngày - được gọi từ ScheduleDay component
  const handleSelectDay = (dayIndex: number) => {
    const daySlots = [];
    
    // Kiểm tra xem ngày này có đủ tất cả tiết học không
    for (let periodIndex = 0; periodIndex < 10; periodIndex++) {
      const actualPeriodIndex = periodIndex;
      const lessonId = lessonIds[actualPeriodIndex]?.[dayIndex];
      
      // Chỉ thêm slot nếu có lessonId hợp lệ
      if (lessonId && typeof lessonId === 'string' && lessonId.trim() !== "") {
        daySlots.push({
          row: periodIndex,
          col: dayIndex,
          lessonId,
          session: (periodIndex < 5 ? "Buổi sáng" : "Buổi chiều") as "Buổi sáng" | "Buổi chiều",
          week: weekNumber,
        });
      }
    }

    if (daySlots.length === 0) {
      console.warn(`Ngày ${dayIndex} không có tiết học nào`);
      return;
    }

    // Kiểm tra xem ngày này có slot nào có thể chọn không (không bị ẩn do leave request)
    const availableSlotsInDay = daySlots.filter(slot => {
      const actualPeriodIndex = slot.row;
      const slotData = scheduleData[actualPeriodIndex]?.[dayIndex];
      // Chỉ cho phép chọn nếu slot không bị ẩn (có text và không phải empty)
      return slotData && slotData.text && slotData.text.trim() !== "";
    });

    if (availableSlotsInDay.length === 0) {
      console.warn(`Ngày ${dayIndex} đã nghỉ hết tất cả tiết học (tất cả lesson đã bị ẩn)`);
      return;
    }

    console.log(`Chọn cả ngày ${dayIndex}:`, availableSlotsInDay);

    // Kiểm tra xem đã chọn hết chưa
    const alreadySelectedAll = availableSlotsInDay.every(slot => 
      selected.some(selectedSlot => 
        selectedSlot.row === slot.row && 
        selectedSlot.col === slot.col && 
        selectedSlot.week === slot.week
      )
    );

    if (alreadySelectedAll) {
      setSelected(selected.filter(slot => 
        !(slot.col === dayIndex && slot.week === weekNumber)
      ));
    } else {
      const newSelected = selected.filter(slot => 
        !(slot.col === dayIndex && slot.week === weekNumber)
      );
      setSelected([...newSelected, ...availableSlotsInDay]);
    }
  };

  // Kiểm tra xem một ngày có được chọn toàn bộ không
  const isDayFullySelected = (dayIndex: number) => {
    // Lấy tất cả slot có lessonId hợp lệ trong ngày này
    const validDaySlots = Array.from({ length: 10 }, (_, periodIndex) => {
      const actualPeriodIndex = periodIndex;
      const lessonId = lessonIds[actualPeriodIndex]?.[dayIndex];
      return lessonId && typeof lessonId === 'string' && lessonId.trim() !== "";
    }).filter(Boolean);

    if (validDaySlots.length === 0) return false;

    // Lọc ra các slot có thể chọn (không bị ẩn do leave request)
    const availableSlotsInDay = validDaySlots.filter((_, periodIndex) => {
      const actualPeriodIndex = periodIndex;
      const slotData = scheduleData[actualPeriodIndex]?.[dayIndex];
      // Chỉ cho phép chọn nếu slot không bị ẩn (có text và không phải empty)
      return slotData && slotData.text && slotData.text.trim() !== "";
    });

    if (availableSlotsInDay.length === 0) return false;

    // Đếm số slot đã được chọn trong ngày này
    const selectedDaySlots = selected.filter(slot => 
      slot.col === dayIndex && 
      slot.week === weekNumber &&
      slot.lessonId && 
      typeof slot.lessonId === 'string' && 
      slot.lessonId.trim() !== ""
    );

    return selectedDaySlots.length === availableSlotsInDay.length;
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

  // Validation cho form
  const canProceed = () => selected.length > 0;

  // Xử lý tiếp tục
  const handleContinue = () => {
    if (selected.length > 0) {
      try {
        // Phân loại các slot theo ngày
        const slotsByDay: Record<number, any[]> = {};
        selected.forEach(slot => {
          if (!slotsByDay[slot.col]) slotsByDay[slot.col] = [];
          slotsByDay[slot.col].push(slot);
        });

        // Tạo danh sách các yêu cầu
        const requests: Array<{
          type: "lesson" | "day";
          dayIndex: number;
          slots: any[];
          lessonIds: string[];
          subjects: string[];
        }> = [];

        Object.entries(slotsByDay).forEach(([dayIndexStr, daySlots]) => {
          const dayIndex = parseInt(dayIndexStr);
          
          // Lọc ra các slot có lessonId hợp lệ
          const validDaySlots = daySlots.filter(slot => 
            slot.lessonId && 
            typeof slot.lessonId === 'string' && 
            slot.lessonId.trim() !== ""
          );

          if (validDaySlots.length === 0) {
            console.warn(`Không có lessonId hợp lệ cho ngày ${dayIndex}`);
            return;
          }

          // Đếm tổng số slot có lessonId hợp lệ trong ngày này
          const totalValidSlotsInDay = Array.from({ length: 10 }, (_, periodIndex) => {
            const actualPeriodIndex = periodIndex;
            const lessonId = lessonIds[actualPeriodIndex]?.[dayIndex];
            return lessonId && typeof lessonId === 'string' && lessonId.trim() !== "";
          }).filter(Boolean).length;

          // Đếm tổng số slot có thể chọn (không bị ẩn do leave request) trong ngày này
          const totalAvailableSlotsInDay = Array.from({ length: 10 }, (_, periodIndex) => {
            const actualPeriodIndex = periodIndex;
            const lessonId = lessonIds[actualPeriodIndex]?.[dayIndex];
            if (!lessonId || typeof lessonId !== 'string' || lessonId.trim() === "") return false;
            
            const slotData = scheduleData[actualPeriodIndex]?.[dayIndex];
            // Chỉ cho phép chọn nếu slot không bị ẩn (có text và không phải empty)
            return slotData && slotData.text && slotData.text.trim() !== "";
          }).filter(Boolean).length;

          if (validDaySlots.length === totalAvailableSlotsInDay && totalAvailableSlotsInDay > 0) {
            // Nghỉ cả ngày - chỉ khi chọn đủ tất cả slot có thể chọn
            requests.push({
              type: "day",
              dayIndex,
              slots: validDaySlots,
              lessonIds: validDaySlots.map(slot => slot.lessonId).filter(Boolean),
              subjects: validDaySlots.map(slot => {
                const actualPeriodIndex = slot.row + (slot.session === "Buổi chiều" ? 5 : 0);
                return scheduleData[actualPeriodIndex]?.[slot.col]?.text || "";
              }).filter(Boolean)
            });
          } else {
            // Nghỉ từng tiết
            requests.push({
              type: "lesson",
              dayIndex,
              slots: validDaySlots,
              lessonIds: validDaySlots.map(slot => slot.lessonId).filter(Boolean),
              subjects: validDaySlots.map(slot => {
                const actualPeriodIndex = slot.row + (slot.session === "Buổi chiều" ? 5 : 0);
                return scheduleData[actualPeriodIndex]?.[slot.col]?.text || "";
              }).filter(Boolean)
            });
          }
        });

        if (requests.length === 0) {
          console.error("Không có request hợp lệ nào được tạo");
          return;
        }

        // Chuyển sang trang info với thông tin đã phân loại
        router.push({
          pathname: "/students/leave_request/leave_request_info",
          params: {
            requests: JSON.stringify(requests),
            days: JSON.stringify(days),
          },
        });
      } catch (error) {
        console.error("Lỗi khi xử lý dữ liệu:", error);
        // Có thể hiển thị thông báo lỗi cho user
      }
    }
  };

  return (
    <HeaderLayout
      title="Xin nghỉ phép"
      subtitle="Chọn tiết hoặc ngày để nghỉ"
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
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
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
                  (cell) => {
                    // Hiển thị tất cả slot đã chọn trong tuần hiện tại
                    // Không phân biệt session để user thấy được tất cả slot đã chọn
                    return cell.week === weekNumber;
                  }
                )}
                onSelectSlot={handleSelectSlot}
                onSlotPress={handleSelectSlot}
                hideNullSlot={true}
                hidePastSlots={true}
                lessonIds={lessonIds}
                fullScheduleData={scheduleData}
                onDayHeaderPress={handleSelectDay}
                isDayFullySelected={isDayFullySelected}
              />
            </ScrollView>
          )}
          
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={styles.legendBox} />
              <Text style={styles.legendText}>Tiết học hiện tại</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxSelected]} />
              <Text style={styles.legendText}>Tiết học xin nghỉ</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxDay]} />
              <Text style={styles.legendText}>Nghỉ cả ngày</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              !canProceed() && styles.buttonDisabled,
            ]}
            disabled={!canProceed()}
            onPress={handleContinue}
          >
            <Text
              style={[
                styles.buttonText,
                !canProceed() && styles.buttonTextDisabled,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
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
  slotText: { color: "#fff", fontFamily: fonts.semiBold, fontSize: 13 },
  slotTextSelected: { color: "#fff", fontFamily: fonts.semiBold },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    flexWrap: 'wrap',
    gap: 16,
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
  legendBoxDay: { backgroundColor: "#3B82F6" },
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
    color: "#fff",
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

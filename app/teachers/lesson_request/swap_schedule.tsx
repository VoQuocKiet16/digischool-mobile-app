import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
// import DaySelector from "../../../components/schedule/DaySelector";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getAvailableAcademicYearsAndWeeks, getCurrentWeek, getStudentSchedule } from "../../../services/schedule.service";
import { fonts } from "../../../utils/responsive";

type PeriodCell = { row: number; col: number };

const TODAY_INDEX = 2; // Thứ 4 (index 2)
const CURRENT_PERIOD_INDEX = 1; // Tiết 2 (index 1)
const TAUGHT_PERIODS = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
];

export default function SwapLesson() {
  const params = useLocalSearchParams();
  const className = params.className as string | undefined;
  const lessonId = params.lessonId as string | undefined;
  const lessonFrom = params.lessonFrom
    ? JSON.parse(params.lessonFrom as string)
    : null;

  // State selected lưu theo tuần và session
  const [selected, setSelected] = useState<
    { row: number; col: number; week: number; session: string }[]
  >([]);
  const [scheduleData, setScheduleData] = useState<(any | null)[][]>([]);
  const [loading, setLoading] = useState(true); // Bắt đầu với loading = true
  const [error, setError] = useState("");
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">(
    "Buổi sáng"
  );
  const lessonDate = params.lessonDate as string | undefined;
  const lessonYear = params.lessonYear as string | undefined;
  const [year, setYear] = useState("2025-2026"); // Mặc định năm học hiện tại
  const [weekNumber, setWeekNumber] = useState(1); // Mặc định tuần 1
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  
  // Flag để tránh gọi API trùng lặp
  const [isInitialized, setIsInitialized] = useState(false);
  const yearRef = useRef(year);
  const weekNumberRef = useRef(weekNumber);

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
          
          // Cập nhật refs để fetchSchedule sử dụng
          yearRef.current = academicYear;
          weekNumberRef.current = currentWeekNumber;
          
          // Lấy danh sách tuần có sẵn cho năm học hiện tại
          const currentYearData = availableAcademicYears.find(
            (year: any) => year.name === academicYear
          );
          if (currentYearData) {
            // Chỉ lấy các tuần hiện tại và tương lai, không lấy tuần quá khứ
            const validWeeks = currentYearData.weekNumbers.filter(
              (week: number) => week >= currentWeekNumber
            );
            setAvailableWeeks(validWeeks);
          }
        } else if (currentAcademicYear && years.includes(currentAcademicYear.name)) {
          // Fallback: nếu không có currentWeek, dùng currentAcademicYear
          setYear(currentAcademicYear.name);
          
          // Lấy tuần đầu tiên có sẵn của năm học hiện tại
          const currentYearData = availableAcademicYears.find((year: any) => year.name === currentAcademicYear.name);
          if (currentYearData && currentYearData.weekNumbers.length > 0) {
            const firstWeek = currentYearData.weekNumbers[0];
            setWeekNumber(firstWeek);
            weekNumberRef.current = firstWeek; // Cập nhật ref
            setAvailableWeeks(currentYearData.weekNumbers);
          }
        } else if (years.length > 0) {
          // Fallback cuối cùng: dùng năm đầu tiên có sẵn
          setYear(years[0]);
          const firstYearData = availableAcademicYears.find((year: any) => year.name === years[0]);
          if (firstYearData && firstYearData.weekNumbers.length > 0) {
            const firstWeek = firstYearData.weekNumbers[0];
            setWeekNumber(firstWeek);
            weekNumberRef.current = firstWeek; // Cập nhật ref
            setAvailableWeeks(firstYearData.weekNumbers);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching available data:", err);
      // Fallback: giữ nguyên giá trị mặc định
    }
  };

  // Function để lọc tuần hợp lệ (chỉ tuần hiện tại và tương lai)
  const filterValidWeeks = (weeks: number[], currentWeek: number) => {
    return weeks.filter(week => week >= currentWeek);
  };

  // Function để cập nhật danh sách tuần có sẵn với logic lọc
  const updateAvailableWeeks = (weeks: number[], currentWeek: number) => {
    const validWeeks = filterValidWeeks(weeks, currentWeek);
    setAvailableWeeks(validWeeks);
    
    // Nếu tuần hiện tại không còn hợp lệ, tự động chuyển về tuần hợp lệ đầu tiên
    if (validWeeks.length > 0 && !validWeeks.includes(currentWeek)) {
      const firstValidWeek = validWeeks[0];
      setWeekNumber(firstValidWeek);
      weekNumberRef.current = firstValidWeek;
    }
  };

  const isTaught = (row: number, col: number) =>
    TAUGHT_PERIODS.some((p) => p.row === row && p.col === col);
  const isCurrent = (row: number, col: number) =>
    row === CURRENT_PERIOD_INDEX && col === TODAY_INDEX;
  const isSelected = (row: number, col: number) =>
    selected.some((p) => p.row === row && p.col === col);

  // Lấy lessonId hiện tại từ params
  const currentLessonId = lessonId;

  // Tạo cellStatusData: chỉ cho phép chọn slot hợp lệ (type: 'regular' hoặc 'makeup', status: 'scheduled')
  const periodOffset = session === "Buổi sáng" ? 0 : 5;
  const cellStatusData = Array.from({ length: 5 }, (__, periodIdx) =>
    Array.from({ length: 7 }, (___, dayIdx) => {
      const slot = scheduleData[periodIdx + periodOffset]?.[dayIdx];
      if (!slot) return "default";
      if (slot.status === "completed") return "default"; // Ẩn slot completed
      if (slot._id && slot._id === currentLessonId) return "current";
      // Chỉ cho phép chọn slot hợp lệ
      if (
        (slot.type === "regular" || slot.type === "makeup") &&
        slot.status === "scheduled"
      ) {
        return "exchangeable";
      }
      return "default";
    })
  );

  // Định nghĩa lại các biến này nếu đã bị xóa
  const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
  const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];
  const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  // Tính todayIndex và currentPeriodIndex theo ngày hệ thống
  function getTodayIndex() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }
  const todayIndex = getTodayIndex();
  // currentPeriodIndex: tiết hiện tại trong buổi (0-4), mặc định là 0 (Tiết 1)
  const now = new Date();
  let currentPeriodIndex = 0;
  // Nếu muốn chính xác hơn, có thể lấy theo giờ hiện tại (ví dụ 7h-8h là tiết 1, ...)
  // Ở đây mặc định là tiết 1

  // Filter dữ liệu để ẩn slot trong quá khứ
  const filteredDisplayedData: (any | null)[][] =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5).map((row, periodIdx) =>
          row.map((slot, dayIdx) => {
            if (!slot) return null;
            if (slot.status === "completed") return null; // Ẩn slot đã dạy
            
            // Ẩn slot ở quá khứ
            if (dayIdx < todayIndex) {
              return null; // Ẩn tất cả slot của các ngày đã qua
            }
            if (dayIdx === todayIndex && periodIdx < currentPeriodIndex) {
              return null; // Ẩn slot của tiết đã qua trong ngày hiện tại
            }
            
            return slot; // Giữ lại slot hợp lệ
          })
        )
      : scheduleData.slice(5, 10).map((row, periodIdx) =>
          row.map((slot, dayIdx) => {
            if (!slot) return null;
            if (slot.status === "completed") return null; // Ẩn slot đã dạy
            
            // Ẩn slot ở quá khứ
            if (dayIdx < todayIndex) {
              return null; // Ẩn tất cả slot của các ngày đã qua
            }
            if (dayIdx === todayIndex && periodIdx < currentPeriodIndex) {
              return null; // Ẩn slot của tiết đã qua trong ngày hiện tại
            }
            
            return slot; // Giữ lại slot hợp lệ
          })
        );

  // Chỉ cho phép chọn các ô exchangeable
  const handleSelect = (dayIndex: number, periodIndex: number) => {
    const row = periodIndex;
    const col = dayIndex;
    if (cellStatusData[row][col] !== "exchangeable") return;
    const week = weekNumber; // number
    const sessionValue = session;
    const isExist = selected.some(
      (cell) =>
        cell.row === row &&
        cell.col === col &&
        cell.week === week &&
        cell.session === sessionValue
    );
    if (isExist) {
      setSelected([]);
    } else {
      setSelected([{ row, col, week, session: sessionValue }]);
    }
  };

  const isContinueEnabled = selected.length === 1;

  const handleContinue = () => {
    if (isContinueEnabled && selected.length === 1) {
      const { row, col } = selected[0];
      const periodOffset = session === "Buổi sáng" ? 0 : 5;
      const slot = scheduleData[row + periodOffset][col];
      // Đảm bảo truyền đủ thông tin lessonTo
      const lessonTo = {
        _id: slot._id,
        period: slot.period,
        subject: slot.subject,
        text: slot.text,
        fixedInfo: slot.fixedInfo,
        scheduledDate: slot.scheduledDate,
        teacherName: slot.teacherName,
        session: slot.timeSlot?.session,
        status: slot.status,
        type: slot.type,
      };
      router.replace({
        pathname: "/teachers/lesson_request/swap_request",
        params: {
          lessonFrom: lessonFrom ? JSON.stringify(lessonFrom) : null,
          lessonTo: JSON.stringify(lessonTo),
        },
      });
    }
  };

  const handleSessionToggle = () => {
    setSession((current) =>
      current === "Buổi sáng" ? "Buổi chiều" : "Buổi sáng"
    );
  };

  const handleChangeYear = () => setShowYearModal(true);
  const handleSelectYear = async (selected: string) => {
    setYear(selected);
    yearRef.current = selected; // Cập nhật ref
    
    // Cập nhật danh sách tuần có sẵn cho năm học mới
    try {
      const availableData = await getAvailableAcademicYearsAndWeeks();
      if (availableData.success && availableData.data) {
        const selectedYearData = availableData.data.availableAcademicYears.find(
          (yearData: any) => yearData.name === selected
        );
        if (selectedYearData) {
          // Nếu đang chọn năm học hiện tại, chỉ lấy tuần hiện tại và tương lai
          if (selected === year) {
            const currentWeek = weekNumberRef.current;
            updateAvailableWeeks(selectedYearData.weekNumbers, currentWeek);
          } else {
            // Nếu chọn năm học khác, lấy tất cả tuần (có thể là năm học tương lai)
            setAvailableWeeks(selectedYearData.weekNumbers);
          }
          
          // Set tuần đầu tiên có sẵn
          if (selectedYearData.weekNumbers.length > 0) {
            const firstWeek = selectedYearData.weekNumbers[0];
            setWeekNumber(firstWeek);
            weekNumberRef.current = firstWeek; // Cập nhật ref
          }
        }
      }
      
      // Load TKB mới cho năm học và tuần đã chọn
      await fetchSchedule(true);
    } catch (err) {
      console.error("Error updating weeks for new year:", err);
    }
    
    setShowYearModal(false);
  };
  const handleChangeWeek = () => setShowWeekModal(true);
  const handleSelectWeek = async (selected: {
    weekNumber: number;
    label: string;
  }) => {
    // Kiểm tra xem tuần được chọn có hợp lệ không
    const currentWeek = weekNumberRef.current;
    if (selected.weekNumber < currentWeek) {
      return;
    }
    
    setWeekNumber(selected.weekNumber);
    weekNumberRef.current = selected.weekNumber; // Cập nhật ref
    setShowWeekModal(false);
    
    // Load TKB mới cho tuần đã chọn
    try {
      await fetchSchedule(true);
    } catch (error) {
      console.error('Error loading schedule for selected week:', error);
    }
  };

  // Lọc selected cho tuần và session hiện tại
  const selectedSlots = selected.filter(
    (cell) => cell.week === weekNumber && cell.session === session
  );

  const fetchSchedule = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await getStudentSchedule({
        className: className || "",
        academicYear: yearRef.current,
        weekNumber: weekNumberRef.current,
      });
      // Map dữ liệu cho ScheduleDay giống học sinh
      const schedule = Array.from({ length: 10 }, () =>
        Array.from({ length: 7 }, () => ({
          text: "",
          type: "default",
          lessonId: "",
          _id: "",
          status: "",
          scheduledDate: "",
          period: "",
          teacherName: "",
        }))
      );
      (
        data?.data?.schedule ||
        data?.data?.weeklySchedule?.lessons ||
        []
      ).forEach((lesson: any) => {
        if (lesson.type === "empty" || lesson.type === "fixed") return; // BỎ QUA lesson empty và fixed
        const dayNumber = lesson.dayNumber || lesson.dayOfWeek || 1;
        const dayIndex = dayNumber === 7 ? 6 : dayNumber - 1;
        const periodIndex =
          (lesson.period || lesson.timeSlot?.period || 1) - 1;
        if (periodIndex >= 0 && periodIndex < 10) {
          schedule[periodIndex][dayIndex] = {
            text: lesson.subject?.subjectName || "",
            type: lesson.type || "default",
            lessonId: lesson.lessonId || lesson._id || "",
            _id: lesson._id || lesson.lessonId || "",
            status: lesson.status || "",
            scheduledDate: lesson.scheduledDate || lesson.date || "",
            period:
              lesson.period || lesson.timeSlot?.period || periodIndex + 1,
            teacherName: lesson.teacher?.name || lesson.teacherName || "",
          };
          // Gán thêm các trường phụ vào slot (nếu cần dùng ở chỗ khác)
          (schedule[periodIndex][dayIndex] as any).subject = lesson.subject;
          (schedule[periodIndex][dayIndex] as any).fixedInfo =
            lesson.fixedInfo;
          (schedule[periodIndex][dayIndex] as any).timeSlot = lesson.timeSlot;
        }
      });
      setScheduleData(schedule);
      
      // Lấy availableYears và availableWeeks từ response nếu có
      const years = data?.data?.availableYears || data?.data?.weeklySchedule?.availableYears || [];
      const weeks = data?.data?.availableWeeks || data?.data?.weeklySchedule?.availableWeeks || [];
      
      // Cập nhật state
      if (Array.isArray(years) && years.length > 0) setAvailableYears(years);
      if (Array.isArray(weeks) && weeks.length > 0) setAvailableWeeks(weeks);

      // Cập nhật danh sách tuần có sẵn cho năm học hiện tại
      const responseYear = data?.data?.academicYear;
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
    } catch (e) {
      setScheduleData([]);
      setError("Lỗi tải thời khóa biểu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeSchedule = async () => {
      if (isInitialized) return; // Tránh gọi lại nếu đã khởi tạo
      
      // 1. Đầu tiên lấy thông tin năm học và tuần hiện tại
      await fetchAvailableData();
      // 2. Sau đó mới fetch schedule với tuần đã được xác định
      await fetchSchedule();
      
      setIsInitialized(true);
    };
    
    initializeSchedule();
  }, [isInitialized]); // Chỉ chạy khi isInitialized thay đổi

  return (
    <HeaderLayout
      title={`Tiết học thay thế`}
      subtitle="Chọn tiết học thay thế cho tiết học hiện tại"
      onBack={() => router.back()}
    >
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#29375C"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.loadingText}>Đang tải thời khóa biểu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError("");
                fetchSchedule(true);
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <ScheduleDay
              periods={
                session === "Buổi sáng" ? morningPeriods : afternoonPeriods
              }
              days={DAYS}
              onAddActivity={() => {}}
              onSlotPress={handleSelect}
              scheduleData={filteredDisplayedData}
              selectedSlots={selectedSlots}
              onSelectSlot={handleSelect}
              cellStatusData={cellStatusData}
              isSwapLesson={true}
              hideNullSlot={true}
            />
          </ScrollView>
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
                    key={`year-${y}`}
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
                    isCurrentWeek: week === weekNumber,
                  }))}
                  keyExtractor={(item) => item.weekNumber.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        item.isCurrentWeek && styles.modalItemCurrent
                      ]}
                      onPress={() => handleSelectWeek(item)}
                    >
                      <Text style={[
                        styles.modalItemText,
                        item.isCurrentWeek && styles.modalItemTextCurrent
                      ]}>
                        {item.label}
                        {item.isCurrentWeek ? ' (Hiện tại)' : ''}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>Không có tuần hợp lệ</Text>
                  <Text style={styles.noDataSubText}>Chỉ hiển thị tuần hiện tại và tương lai</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Chú thích */}
        {!loading && !error && (
          <>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendBox,
                    { backgroundColor: "#E5E7EB", borderColor: "#E5E7EB" },
                  ]}
                />
                <Text style={styles.legendText}>Tiết hiện tại</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendBox,
                    {
                      borderColor: "#F9B233",
                      borderStyle: "dashed",
                      backgroundColor: "#fff",
                    },
                  ]}
                />
                <Text style={styles.legendText}>Tiết sẽ đổi</Text>
              </View>
            </View>
            {/* Nút tiếp tục */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, !isContinueEnabled && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={!isContinueEnabled}
              >
                <Text
                  style={[
                    styles.buttonText,
                    !isContinueEnabled && styles.buttonTextDisabled,
                  ]}
                >
                  Tiếp tục
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontFamily: fonts.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: fonts.medium,
  },
  retryButton: {
    backgroundColor: "#29375C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 6,
  },
  legendText: {
    color: "#29375C",
    fontSize: 13,
    fontWeight: "500",
  },
  continueBtn: {
    backgroundColor: "#29375C",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    opacity: 1,
  },
  continueBtnDisabled: {
    backgroundColor: "#A0A3BD",
    opacity: 0.7,
  },
  continueBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
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
  modalItemCurrent: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#3A546D",
    textAlign: "center",
  },
  modalItemTextCurrent: {
    color: "#1976D2",
    fontFamily: "Baloo2-SemiBold",
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
    backgroundColor: "#fff",
  },
});

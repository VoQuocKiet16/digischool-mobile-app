import { router, useLocalSearchParams } from "expo-router";
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
// import DaySelector from "../../../components/schedule/DaySelector";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getStudentSchedule } from "../../../services/schedule.service";

type PeriodCell = { row: number; col: number };

const TODAY_INDEX = 2; // Thứ 4 (index 2)
const CURRENT_PERIOD_INDEX = 1; // Tiết 2 (index 1)
const TAUGHT_PERIODS = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
];

const academicYears = ["2024-2025", "2025-2026"];

function getFirstMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 1 ? 0 : (8 - day) % 7; // Nếu đã là thứ 2 thì không cộng, còn lại thì cộng số ngày tới thứ 2
  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekRangesByYear(year: string) {
  const [startYear, endYear] = year.split("-").map(Number);
  const startDate = getFirstMonday(new Date(startYear, 7, 1)); // 01/08/yyyy, lấy đúng Thứ 2 đầu tiên
  const endDate = new Date(endYear, 4, 31); // 31/05/yyyy
  let current = new Date(startDate);
  const weeks = [];
  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekStart.getDate() + 6); // Chủ nhật
    if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

    // Sử dụng local date để tránh vấn đề múi giờ
    const startDateStr = `${weekStart.getFullYear()}-${(weekStart.getMonth() + 1).toString().padStart(2, "0")}-${weekStart.getDate().toString().padStart(2, "0")}`;
    const endDateStr = `${weekEnd.getFullYear()}-${(weekEnd.getMonth() + 1).toString().padStart(2, "0")}-${weekEnd.getDate().toString().padStart(2, "0")}`;

    weeks.push({
      start: startDateStr,
      end: endDateStr,
      label:
        `${weekStart.getDate().toString().padStart(2, "0")}/${(weekStart.getMonth() + 1).toString().padStart(2, "0")}` +
        " - " +
        `${weekEnd.getDate().toString().padStart(2, "0")}/${(weekEnd.getMonth() + 1).toString().padStart(2, "0")}`,
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

export default function SwapLesson() {
  const params = useLocalSearchParams();
  const classId = params.classId as string | undefined;
  const className = params.className as string | undefined;
  const lessonId = params.lessonId as string | undefined;

  const [selected, setSelected] = useState<PeriodCell[]>([]);
  const [scheduleData, setScheduleData] = useState<(any | null)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">("Buổi sáng");
  const [year, setYear] = useState("2024-2025");
  const [dateRange, setDateRange] = useState(() => {
    const weeks = getWeekRangesByYear("2024-2025");
    return weeks[1];
  });
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const weekList = getWeekRangesByYear(year);

  const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
  const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];

  const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        // Gọi API lấy TKB lớp theo tuần và năm học đã chọn
        const data = await getStudentSchedule({
          className: className || "",
          academicYear: year,
          startOfWeek: dateRange.start,
          endOfWeek: dateRange.end,
        });
        // Map dữ liệu cho ScheduleDay giống học sinh
        const schedule = Array.from({ length: 10 }, () =>
          Array.from({ length: 7 }, () => ({
            text: "",
            type: "default",
            lessonId: "",
            status: "",
            scheduledDate: "",
            period: "",
            teacherName: "",
          }))
        );
        (data?.data?.schedule || []).forEach((dayData: any) => {
          const dayOfWeek = dayData.dayOfWeek;
          const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Chủ nhật = 0, index 6
          const date = dayData.date || "";
          dayData.lessons?.forEach((lesson: any) => {
            // BỎ QUA lesson type: 'empty'
            if (lesson.type === 'empty') return;
            const periodIndex = (lesson.period || 1) - 1;
            if (periodIndex >= 0 && periodIndex < 10) {
              schedule[periodIndex][dayIndex] = {
                text:
                  lesson && lesson.subject
                    ? lesson.subject.name
                    : lesson && lesson.fixedInfo
                    ? lesson.fixedInfo.description
                    : "",
                type: lesson ? (lesson.type || "default") : "default",
                lessonId: lesson?.lessonId || lesson?._id || "",
                status: lesson?.status || "",
                scheduledDate: date,
                period: lesson?.period || (periodIndex + 1),
                teacherName: lesson?.teacher?.name || lesson?.teacherName || "",
              };
            }
          });
        });
        setScheduleData(schedule);
      } catch (e) {
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };
    if (className) fetchSchedule();
  }, [className, year, dateRange]);

  const isTaught = (row: number, col: number) =>
    TAUGHT_PERIODS.some((p) => p.row === row && p.col === col);
  const isCurrent = (row: number, col: number) =>
    row === CURRENT_PERIOD_INDEX && col === TODAY_INDEX;
  const isSelected = (row: number, col: number) =>
    selected.some((p) => p.row === row && p.col === col);

  // Lấy lessonId hiện tại từ params
  const currentLessonId = lessonId;

  // Tạo cellStatusData: cộng periodOffset để phân biệt buổi sáng/chiều
  const periodOffset = session === "Buổi sáng" ? 0 : 5;
  const cellStatusData = Array.from({ length: 5 }, (__, periodIdx) =>
    Array.from({ length: 7 }, (___, dayIdx) => {
      const slot = scheduleData[periodIdx + periodOffset]?.[dayIdx];
      const lessonId = slot?.lessonId;
      const status = slot?.status;
      if (status === "completed") return "taught";
      if (lessonId && lessonId === currentLessonId) return "current";
      return "exchangeable";
    })
  );

  // Chỉ cho phép chọn các ô exchangeable
  const handleSelect = (dayIndex: number, periodIndex: number) => {
    const row = periodIndex;
    const col = dayIndex;
    if (cellStatusData[row][col] !== "exchangeable") return;
    if (isSelected(row, col)) {
      setSelected([]);
    } else {
      setSelected([{ row, col }]);
    }
  };

  const isContinueEnabled = selected.length === 1;

  const handleContinue = () => {
    if (isContinueEnabled && selected.length === 1) {
      const { row, col } = selected[0];
      const periodOffset = session === "Buổi sáng" ? 0 : 5;
      const lessonTo = scheduleData[row + periodOffset][col];
      // Lấy lessonFrom từ params nếu có, hoặc từ scheduleData nếu không
      let lessonFrom = null;
      if (params.lessonFrom) {
        try {
          lessonFrom = JSON.parse(params.lessonFrom as string);
        } catch {}
      }
      // Nếu không có trong params, thử lấy từ scheduleData (theo lessonId)
      if (!lessonFrom && currentLessonId) {
        lessonFrom = scheduleData.flat().find(
          (slot) => slot.lessonId === currentLessonId || slot._id === currentLessonId
        );
      }
      router.replace({
        pathname: "/teachers/confirm_swap/confirm_swap",
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
  const handleSelectYear = (selected: string) => {
    setYear(selected);
    const weeks = getWeekRangesByYear(selected);
    setDateRange(weeks[0]);
    setShowYearModal(false);
  };
  const handleChangeDateRange = () => setShowWeekModal(true);
  const handleSelectWeek = (selected: { start: string; end: string; label: string }) => {
    setDateRange(selected);
    setShowWeekModal(false);
  };

  const displayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5)
      : scheduleData.slice(5, 10);

  return (
    <HeaderLayout
      title={`Tiết - ${className || ""}`}
      subtitle="Chọn tiết học thay thế cho tiết học hiện tại"
      onBack={() => router.replace("/")}
    >
      <View style={styles.container}>
        <ScheduleHeader
          title={session}
          dateRange={dateRange.label}
          year={year}
          onPressTitle={handleSessionToggle}
          onChangeYear={handleChangeYear}
          onChangeDateRange={handleChangeDateRange}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#29375C" style={{ marginTop: 30 }} />
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <ScheduleDay
              periods={session === "Buổi sáng" ? morningPeriods : afternoonPeriods}
              days={DAYS}
              onAddActivity={() => {}}
              onSlotPress={handleSelect}
              scheduleData={displayedData}
              selectedSlots={selected}
              onSelectSlot={handleSelect}
              cellStatusData={cellStatusData}
              isSwapLesson={true}
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
        {/* Modal chọn tuần */}
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
        {/* Chú thích */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBox,
                {
                  borderColor: "#B6B6B6",
                  borderStyle: "dashed",
                  backgroundColor: "#fff",
                },
              ]}
            />
            <Text style={styles.legendText}>Đã được dạy</Text>
          </View>
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
        <SafeAreaView
          style={{
            backgroundColor: "#fff",
            marginBottom: 30,
            paddingHorizontal: 16,
          }}
        >
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !isContinueEnabled && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isContinueEnabled}
          >
            <Text style={styles.continueBtnText}>Tiếp tục</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalItem: {
    padding: 10,
  },
  modalItemText: {
    color: "#29375C",
    fontSize: 16,
    fontWeight: "bold",
  },
});


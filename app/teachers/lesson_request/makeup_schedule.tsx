import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getStudentSchedule } from "../../../services/schedule.service";
import { fonts } from "../../../utils/responsive";

const academicYears = ["2024-2025", "2025-2026"];

export default function MakeupSchedule() {
  const params = useLocalSearchParams();
  const className = params.className as string | undefined;
  const lessonId = params.lessonId as string | undefined;
  const lessonDate = params.lessonDate as string | undefined;
  const lessonYear = params.lessonYear as string | undefined;
  // State selected lưu theo tuần và session
  const [selected, setSelected] = useState<
    { row: number; col: number; week: number; session: string }[]
  >([]);
  const [scheduleData, setScheduleData] = useState<(any | null)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">(
    "Buổi sáng"
  );
  const [year, setYear] = useState(lessonYear || "2024-2025");
  const [weekNumber, setWeekNumber] = useState(1);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);

  // Xóa các biến, state, logic liên quan đến dateRange, findWeekByDate, weekList
  // Đảm bảo các biến này được khai báo đúng
  const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
  const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];
  const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  // Tạo cellStatusData: chỉ cho phép chọn slot empty, status scheduled
  const periodOffset = session === "Buổi sáng" ? 0 : 5;
  const cellStatusData = Array.from({ length: 5 }, (__, periodIdx) =>
    Array.from({ length: 7 }, (___, dayIdx) => {
      const slot = scheduleData[periodIdx + periodOffset]?.[dayIdx];
      if (!slot) return "default";
      if (slot._id && slot._id === lessonId) return "current";
      if (slot.status === "completed") return "taught";
      if (slot.type === "empty" && slot.status === "scheduled")
        return "exchangeable";
      return "default";
    })
  );

  // Lấy subjectId hoặc subjectName của lesson hiện tại (dùng để ẩn các slot cùng subject)
  let currentLessonSubjectId = undefined;
  let currentLessonSubjectName = undefined;
  for (let i = 0; i < scheduleData.length; i++) {
    for (let j = 0; j < scheduleData[i].length; j++) {
      const slot = scheduleData[i][j];
      if (slot && slot._id === lessonId) {
        if (slot.subject && slot.subject._id)
          currentLessonSubjectId = slot.subject._id;
        if (slot.subject && slot.subject.name)
          currentLessonSubjectName = slot.subject.name;
      }
    }
  }

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

  // Filter dữ liệu để ẩn slot có subject trùng subject của lesson hiện tại (trừ slot hiện tại và slot đã dạy)
  const filteredDisplayedData: (any | null)[][] =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5).map((row, periodIdx) =>
          row.map((slot, dayIdx) => {
            if (!slot) return null;
            if (slot._id && slot._id === lessonId) return slot; // slot hiện tại
            if (slot.status === "completed") return null; // Ẩn slot đã dạy
            // Ẩn slot có subject trùng subject hiện tại
            if (
              slot.subject &&
              ((currentLessonSubjectId &&
                slot.subject._id === currentLessonSubjectId) ||
                (currentLessonSubjectName &&
                  slot.subject.name === currentLessonSubjectName))
            ) {
              return null;
            }
            // Ẩn slot empty ở quá khứ
            if (
              slot.type === "empty" &&
              (dayIdx < todayIndex ||
                (dayIdx === todayIndex && periodIdx < currentPeriodIndex))
            ) {
              return null;
            }
            if (slot.type === "empty") return slot; // slot trống
            return null; // ẩn slot khác
          })
        )
      : scheduleData.slice(5, 10).map((row, periodIdx) =>
          row.map((slot, dayIdx) => {
            if (!slot) return null;
            if (slot._id && slot._id === lessonId) return slot; // slot hiện tại
            if (slot.status === "completed") return null; // Ẩn slot đã dạy
            // Ẩn slot có subject trùng subject hiện tại
            if (
              slot.subject &&
              ((currentLessonSubjectId &&
                slot.subject._id === currentLessonSubjectId) ||
                (currentLessonSubjectName &&
                  slot.subject.name === currentLessonSubjectName))
            ) {
              return null;
            }
            // Ẩn slot empty ở quá khứ
            if (
              slot.type === "empty" &&
              (dayIdx < todayIndex ||
                (dayIdx === todayIndex && periodIdx < currentPeriodIndex))
            ) {
              return null;
            }
            if (slot.type === "empty") return slot; // slot trống
            return null; // ẩn slot khác
          })
        );

  // Chỉ cho phép chọn 1 slot empty
  const handleSelect = (dayIndex: number, periodIndex: number) => {
    const row = periodIndex;
    const col = dayIndex;
    if (cellStatusData[row][col] !== "exchangeable") return;
    const week = weekNumber;
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
      // Lấy lessonFrom (tiết cần bù) là lesson hiện tại
      let lessonFrom = null;
      for (let i = 0; i < scheduleData.length; i++) {
        for (let j = 0; j < scheduleData[i].length; j++) {
          const s = scheduleData[i][j];
          if (s && s._id === lessonId) lessonFrom = s;
        }
      }
      const lessonTo = {
        _id: slot._id,
        period: slot.period,
        subject: slot.subject?.subjectName || slot.subject?.name || "",
        text: slot.text,
        fixedInfo: slot.fixedInfo,
        scheduledDate: slot.scheduledDate,
        teacherName: slot.teacherName,
        session: slot.timeSlot?.session,
        status: slot.status,
        type: slot.type,
      };
      router.replace({
        pathname: "/teachers/lesson_request/makeup_request",
        params: {
          lessonFrom: lessonFrom ? JSON.stringify(lessonFrom) : null,
          lessonTo: lessonTo ? JSON.stringify(lessonTo) : null,
          className: className || "",
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
    setWeekNumber(1); // Reset week number to 1 when year changes
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

  const displayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5)
      : scheduleData.slice(5, 10);

  // Lọc selected cho tuần và session hiện tại
  const selectedSlots = selected.filter(
    (cell) => cell.week === weekNumber && cell.session === session
  );

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const data = await getStudentSchedule({
          className: className || "",
          academicYear: year,
          weekNumber: weekNumber,
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
          // KHÔNG bỏ qua lesson type === "empty" (slot trống phải được map)
          const dayNumber = lesson.dayNumber || lesson.dayOfWeek || 1;
          const dayIndex = dayNumber === 7 ? 6 : dayNumber - 1;
          const periodIndex =
            (lesson.period || lesson.timeSlot?.period || 1) - 1;
          if (periodIndex >= 0 && periodIndex < 10) {
            schedule[periodIndex][dayIndex] = {
              text:
                lesson.type === "empty"
                  ? "Trống"
                  : lesson.subject?.subjectName || lesson.subject?.name || "",
              type: lesson.type || "default",
              lessonId: lesson.lessonId || lesson._id || "",
              _id: lesson._id || lesson.lessonId || "",
              status: lesson.status || "",
              scheduledDate: lesson.scheduledDate || lesson.date || "",
              period:
                lesson.period || lesson.timeSlot?.period || periodIndex + 1,
              teacherName: lesson.teacher?.name || lesson.teacherName || "",
            };
            (schedule[periodIndex][dayIndex] as any).subject = lesson.subject;
            (schedule[periodIndex][dayIndex] as any).fixedInfo =
              lesson.fixedInfo;
            (schedule[periodIndex][dayIndex] as any).timeSlot = lesson.timeSlot;
          }
        });
        setScheduleData(schedule);
        // Lấy năm học và tuần từ response
        const responseYear = data?.data?.academicYear;
        const responseWeek = data?.data?.weeklySchedule?.weekNumber;
        if (responseYear && !availableYears.includes(responseYear)) {
          setAvailableYears((prev) => [...prev, responseYear]);
        }
        if (responseWeek && !availableWeeks.includes(responseWeek)) {
          setAvailableWeeks((prev) => [...prev, responseWeek]);
        }
      } catch (e) {
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };
    if (className) fetchSchedule();
  }, [className, year, weekNumber]);

  return (
    <HeaderLayout
      title={`Tiết học dạy bù`}
      subtitle="Chọn tiết học trống để dạy bù"
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
          <ActivityIndicator
            size="large"
            color="#29375C"
            style={{ marginTop: 30 }}
          />
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
              isSwapLesson={false}
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
        {/* Chú thích */}
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
            <Text style={styles.legendText}>Tiết trống</Text>
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

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
  const startDate = getFirstMonday(new Date(startYear, 7, 1));
  const endDate = new Date(endYear, 4, 31);
  let current = new Date(startDate);
  const weeks = [];
  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
    const startDateStr = `${weekStart.getFullYear()}-${(
      weekStart.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${weekStart.getDate().toString().padStart(2, "0")}`;
    const endDateStr = `${weekEnd.getFullYear()}-${(weekEnd.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${weekEnd.getDate().toString().padStart(2, "0")}`;
    weeks.push({
      start: startDateStr,
      end: endDateStr,
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

export default function MakeupSchedule() {
  const params = useLocalSearchParams();
  const className = params.className as string | undefined;
  const lessonId = params.lessonId as string | undefined;
  const lessonDate = params.lessonDate as string | undefined;
  const lessonYear = params.lessonYear as string | undefined;
  // State selected lưu theo tuần và session
  const [selected, setSelected] = useState<
    { row: number; col: number; week: string; session: string }[]
  >([]);
  const [scheduleData, setScheduleData] = useState<(any | null)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">(
    "Buổi sáng"
  );
  const [year, setYear] = useState(lessonYear || "2024-2025");
  const weekList = getWeekRangesByYear(year);

  function findWeekByDate(dateStr: string | undefined, weeks: any[]) {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    return weeks.find(
      (w) => new Date(w.start) <= date && date <= new Date(w.end)
    );
  }

  const [dateRange, setDateRange] = useState<{ start: string; end: string; label: string } | null>(null);

  useEffect(() => {
    const found = findWeekByDate(lessonDate, weekList);
    setDateRange(found || weekList[0]);
  }, [year, lessonDate]);

  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);

  const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
  const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];
  const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const data = await getStudentSchedule({
          className: className || "",
          academicYear: year,
          startOfWeek: dateRange?.start || "",
          endOfWeek: dateRange?.end || "",
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
        (data?.data?.schedule || []).forEach((dayData: any) => {
          const dayOfWeek = dayData.dayOfWeek;
          const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const date = dayData.date || "";
          dayData.lessons?.forEach((lesson: any) => {
            const periodIndex = (lesson.period || 1) - 1;
            if (periodIndex >= 0 && periodIndex < 10) {
              schedule[periodIndex][dayIndex] = {
                text:
                  lesson.type === "empty"
                    ? "Trống"
                    : lesson && lesson.subject
                    ? lesson.subject.name
                    : lesson && lesson.fixedInfo
                    ? lesson.fixedInfo.description
                    : "",
                type: lesson ? lesson.type || "default" : "default",
                lessonId: lesson?.lessonId || "",
                _id: lesson?._id || "",
                status: lesson?.status || "",
                scheduledDate: date,
                period: lesson?.period || periodIndex + 1,
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

  // Tạo cellStatusData: chỉ cho phép chọn slot empty, slot đã dạy là taught, slot hiện tại luôn hiển thị
  const periodOffset = session === "Buổi sáng" ? 0 : 5;
  const cellStatusData = Array.from({ length: 5 }, (__, periodIdx) =>
    Array.from({ length: 7 }, (___, dayIdx) => {
      const slot = scheduleData[periodIdx + periodOffset]?.[dayIdx];
      if (!slot) return "default";
      if (slot._id && slot._id === lessonId) return "current";
      if (slot.status === "completed") return "taught";
      if (slot.type === "empty") return "exchangeable";
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
  const filteredDisplayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5).map((row, periodIdx) =>
          row.map((slot, dayIdx) => {
            if (!slot) return null;
            if (slot._id && slot._id === lessonId) return slot; // slot hiện tại
            if (slot.status === "completed") return slot; // slot đã dạy
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
            if (slot.status === "completed") return slot; // slot đã dạy
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
    const week = dateRange?.start || "";
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
      const lessonTo = slot;
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
    const weeks = getWeekRangesByYear(selected);
    setDateRange(weeks[0]);
    setShowYearModal(false);
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

  const displayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, 5)
      : scheduleData.slice(5, 10);

  // Lọc selected cho tuần và session hiện tại
  const selectedSlots = selected.filter(
    (cell) => cell.week === dateRange?.start && cell.session === session
  );

  return (
    <HeaderLayout
      title={`Tiết học dạy bù`}
      subtitle="Chọn tiết học trống để dạy bù"
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        <ScheduleHeader
          title={session}
          dateRange={dateRange?.label || ""}
          year={year}
          onPressTitle={handleSessionToggle}
          onChangeYear={handleChangeYear}
          onChangeDateRange={handleChangeDateRange}
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
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPressOut={() => setShowYearModal(false)}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                minWidth: 160,
                elevation: 5,
              }}
            >
              {academicYears.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={{ paddingVertical: 12, paddingHorizontal: 8 }}
                  onPress={() => handleSelectYear(y)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#3A546D",
                      textAlign: "center",
                    }}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Modal chọn tuần */}
        <Modal visible={showWeekModal} transparent animationType="fade">
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPressOut={() => setShowWeekModal(false)}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                minWidth: 160,
                elevation: 5,
                maxHeight: 400,
              }}
            >
              <FlatList
                data={weekList}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => {
                  const hasSelected = selected.some(
                    (cell) => cell.week === item.start
                  );
                  return (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                      }}
                      onPress={() => handleSelectWeek(item)}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#3A546D",
                          textAlign: "center",
                        }}
                      >
                        {item.label}
                      </Text>
                      {hasSelected && (
                        <View
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 4,
                            backgroundColor: "red",
                            marginLeft: 8,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
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
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
});

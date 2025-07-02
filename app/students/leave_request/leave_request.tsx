import { useLocalSearchParams, useRouter } from "expo-router";
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
import DaySelector from "../../../components/schedule/DaySelector";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";
import { getSchedule } from "../../../services/schedule.service";
import { Activity } from "../schedule/schedule";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
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
        }
        schedule[periodIndex][dayIndex] = { text, type: "default" };
        if (lesson._id) {
          lessonIds[periodIndex][dayIndex] = lesson._id;
        }
      }
    });
  });
  return { schedule, lessonIds };
}

export default function LeaveRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">(
    "Buổi sáng"
  );
  const [selected, setSelected] = useState<
    {
      row: number;
      col: number;
      lessonId: string;
      session: "Buổi sáng" | "Buổi chiều";
      week: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [year, setYear] = useState("2024-2025");
  const [dateRange, setDateRange] = useState(() => {
    const weeks = getWeekRangesByYear("2024-2025");
    return weeks[1];
  });
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [lessonDetails, setLessonDetails] = useState<any[][]>(
    Array.from({ length: 10 }, () => Array.from({ length: 7 }, () => null))
  );

  const weekList = getWeekRangesByYear(year);

  const periods = session === "Buổi sáng" ? morningPeriods : afternoonPeriods;
  const displayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, morningPeriods.length)
      : scheduleData.slice(
          morningPeriods.length,
          morningPeriods.length + afternoonPeriods.length
        );

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getSchedule({
          className: "12A1",
          academicYear: year,
          startOfWeek: dateRange.start,
          endOfWeek: dateRange.end,
        });
        const { schedule, lessonIds: newLessonIds } =
          mapApiToScheduleData(data);
        setScheduleData(schedule);
        setLessonIds(newLessonIds);
        const details = Array.from({ length: 10 }, () =>
          Array.from({ length: 7 }, () => null)
        );
        const scheduleData = data?.data?.schedule || [];
        scheduleData.forEach((dayData: any) => {
          const dayOfWeek = dayData.dayOfWeek;
          const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const date = dayData.date;
          dayData.lessons?.forEach((lesson: any) => {
            const periodIndex = (lesson.period || 1) - 1;
            if (periodIndex >= 0 && periodIndex < 10) {
              details[periodIndex][dayIndex] = {
                ...lesson,
                date: date,
              };
            }
          });
        });
        setLessonDetails(details);
      } catch (err) {
        setError("Lỗi tải thời khoá biểu");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [year, dateRange]);

  useEffect(() => {
    if (params.selectedSlots) {
      try {
        setSelected(JSON.parse(params.selectedSlots as string));
      } catch {}
    }
  }, [params.selectedSlots]);

  const handleSelectSlot = (dayIndex: number, periodIndex: number) => {
    const isExist = selected.some(
      (cell) =>
        cell.row === periodIndex &&
        cell.col === dayIndex &&
        cell.session === session &&
        cell.week === dateRange.start
    );
    if (isExist) {
      setSelected(
        selected.filter(
          (cell) =>
            !(
              cell.row === periodIndex &&
              cell.col === dayIndex &&
              cell.session === session &&
              cell.week === dateRange.start
            )
        )
      );
    } else {
      const lesson = lessonDetails[periodIndex]?.[dayIndex];
      setSelected([
        ...selected,
        {
          row: periodIndex,
          col: dayIndex,
          lessonId: lesson?._id || "",
          session,
          week: dateRange.start,
          date: lesson?.date || lesson?.scheduledDate || "",
        },
      ]);
    }
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

  return (
    <HeaderLayout
      title="Tiết học xin nghỉ"
      subtitle="Chọn các tiết học bạn muốn xin phép nghỉ"
      onBack={() => router.back()}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1 }}>
          <ScheduleHeader
            title={session}
            dateRange={dateRange.label}
            year={year}
            onPressTitle={() =>
              setSession(session === "Buổi sáng" ? "Buổi chiều" : "Buổi sáng")
            }
            onChangeYear={handleChangeYear}
            onChangeDateRange={handleChangeDateRange}
          />
          <DaySelector
            days={days}
            onCurrentDayChange={setCurrentDayIndex}
            showUtilityButton={false}
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
                  (cell) =>
                    cell.session === session && cell.week === dateRange.start
                )}
                onSelectSlot={handleSelectSlot}
                onSlotPress={handleSelectSlot}
                currentDayIndex={currentDayIndex}
                hideNullSlot={true}
              />
            </ScrollView>
          )}
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
                  minWidth: 200,
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
                  minWidth: 200,
                  elevation: 5,
                  maxHeight: 400,
                }}
              >
                <FlatList
                  data={weekList}
                  keyExtractor={(item) => item.label}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ paddingVertical: 12, paddingHorizontal: 8 }}
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
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={styles.legendBox} />
              <Text style={styles.legendText}>Tiết học hiện tại</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxSelected]} />
              <Text style={styles.legendText}>Tiết học xin nghỉ</Text>
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
                  pathname: "/students/leave_request/leave_request_info",
                  params: {
                    selectedSlots: JSON.stringify(selected),
                    subjects: JSON.stringify(subjects),
                    days: JSON.stringify(days),
                    lessonIds: JSON.stringify(lessonIdsSelected),
                    ...(params.phone ? { phone: params.phone } : {}),
                    ...(params.reason ? { reason: params.reason } : {}),
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
  slotText: { color: "#fff", fontFamily: "Baloo2-SemiBold", fontSize: 13 },
  slotTextSelected: { color: "#fff", fontFamily: "Baloo2-SemiBold" },
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

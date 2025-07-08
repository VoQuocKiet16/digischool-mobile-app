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
import { getTeacherSchedule } from "../../../services/schedule.service";

export interface Activity {
  text: string;
  type: "default" | "user-added";
  hasNotification?: boolean;
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

const academicYears = ["2024-2025", "2025-2026"];

function getFirstMonday(date: Date) {
  // Trả về ngày thứ 2 đầu tiên sau hoặc bằng ngày truyền vào
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 1 ? 0 : (8 - day) % 7; // Nếu đã là thứ 2 thì không cộng, còn lại thì cộng số ngày tới thứ 2
  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekRangesByYear(year: string) {
  // Năm học bắt đầu từ 01/08 năm đầu đến 31/05 năm sau
  const [startYear, endYear] = year.split("-").map(Number);
  const startDate = new Date(startYear, 7, 1); // 01/08/yyyy
  const endDate = new Date(endYear, 4, 31); // 31/05/yyyy
  let current = getFirstMonday(startDate);
  const weeks = [];

  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

    // Sử dụng local date để tránh vấn đề múi giờ
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

function mapApiToTeacherScheduleData(apiData: any): {
  schedule: Activity[][];
  lessonIds: string[][];
} {
  // 10 periods x 7 days
  const schedule: Activity[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => ({ text: "", type: "user-added" }))
  );
  const lessonIds: string[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 7 }, () => "")
  );

  // Lấy dữ liệu từ response của API giáo viên
  const scheduleData = apiData?.data?.schedule || [];

  scheduleData.forEach((dayData: any) => {
    const dayOfWeek = dayData.dayOfWeek;
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Chủ nhật = 0, chuyển thành index 6

    dayData.periods?.forEach((period: any) => {
      const periodIndex = (period.period || 1) - 1;
      if (periodIndex >= 0 && periodIndex < 10) {
        let text = "";

        // Chỉ hiển thị các tiết có subject (tiết dạy thực tế)
        if (period.subject) {
          // Xử lý tiết học thông thường
          text = `${period.class?.className || ""} - ${
            period.subject.name || ""
          }`;
        } else if (period.type === "fixed" && period.fixedInfo) {
          // Xử lý tiết cố định như chào cờ, sinh hoạt lớp
          text = `${period.class?.className || ""} - ${
            period.fixedInfo.description || ""
          }`;
        }
        // Không hiển thị các tiết trống hoặc tiết không có subject

        if (text) {
          schedule[periodIndex][dayIndex] = {
            text,
            type: "default",
          };

          // Lưu lessonId nếu có
          if (period._id) {
            lessonIds[periodIndex][dayIndex] = period._id;
          }
        }
      }
    });
  });

  return { schedule, lessonIds };
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
  const [year, setYear] = useState("2024-2025");
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
    label: string;
  }>(() => {
    const weeks = getWeekRangesByYear("2024-2025");
    return weeks[1];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showYearModal, setShowYearModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  });

  const days = defaultDays;
  const weekList = getWeekRangesByYear(year);

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeacherSchedule({
        teacherId: (await AsyncStorage.getItem("userTeacherId")) || "",
        academicYear: year,
        startOfWeek: dateRange.start,
        endOfWeek: dateRange.end,
      });
      const { schedule, lessonIds: newLessonIds } =
        mapApiToTeacherScheduleData(data);
      setScheduleData(schedule);
      setLessonIds(newLessonIds);
    } catch (err) {
      setError("Lỗi tải thời khóa biểu");
      setScheduleData(initialScheduleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [year, dateRange]);

  const handleAddActivity = (
    dayIndex: number,
    periodIndex: number,
    activityText: string
  ) => {
    router.push({
      pathname: "/activity/add_activity",
      params: { periodIndex },
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
  const handleSelectYear = (selected: string) => {
    setYear(selected);
    // Đổi năm thì đổi luôn về tuần đầu tiên của năm đó
    const weeks = getWeekRangesByYear(selected);
    setDateRange(weeks[0]);
    setShowYearModal(false);
  };

  // Modal chọn tuần
  const handleChangeDateRange = () => setShowWeekModal(true);
  const handleSelectWeek = (selected: {
    start: string;
    end: string;
    label: string;
  }) => {
    setDateRange(selected);
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
        dateRange={dateRange.label}
        year={year}
        onPressTitle={handleSessionToggle}
        onChangeYear={handleChangeYear}
        onChangeDateRange={handleChangeDateRange}
      />
      {/* <DaySelector days={days} onCurrentDayChange={setCurrentDayIndex} /> */}
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
    minWidth: 200,
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

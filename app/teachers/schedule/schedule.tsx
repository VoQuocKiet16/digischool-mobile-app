import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import DaySelector from "../../../components/schedule/DaySelector";
import ScheduleDay from "../../../components/schedule/ScheduleDay";
import ScheduleHeader from "../../../components/schedule/ScheduleHeader";

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

const initialScheduleData: Activity[][] = [
  // Tiết 1
  [
    defaultActivity(""), // Thứ 2
    defaultActivity(""), // Thứ 3
    defaultActivity("10A3", true), // Thứ 4 (có thông báo)
    defaultActivity(""), // Thứ 5
    defaultActivity(""), // Thứ 6
    defaultActivity(""), // Thứ 7
    defaultActivity(""), // CN
  ],
  // Tiết 2
  [
    defaultActivity(""),
    defaultActivity("10A3"),
    defaultActivity("10A3"),
    defaultActivity("10A3"),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  // Tiết 3
  [
    defaultActivity("10A3"),
    defaultActivity("10A3"),
    defaultActivity("10A3", true),
    defaultActivity("10A3"),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  // Tiết 4
  [
    defaultActivity("10A3", true),
    defaultActivity(""),
    defaultActivity("10A3"),
    defaultActivity("10A3"),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  // Tiết 5
  [
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity("10A3"),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  // Buổi chiều (nếu có)
  [
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  [
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  [
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  [
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
  [
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
    defaultActivity(""),
  ],
];

export default function ScheduleTeachersScreen() {
  const router = useRouter();
  const [session, setSession] = useState<"Buổi sáng" | "Buổi chiều">(
    "Buổi sáng"
  );
  const [scheduleData, setScheduleData] =
    useState<Activity[][]>(initialScheduleData);

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const morningPeriods = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
  const afternoonPeriods = ["Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];
  const periods = session === "Buổi sáng" ? morningPeriods : afternoonPeriods;

  const handleAddActivity = (
    dayIndex: number,
    periodIndex: number,
    activityText: string
  ) => {
    if (!activityText || activityText === "Thêm hoạt động") {
      router.push({
        pathname: "/general/add_activity",
        params: { periodIndex },
      });
    } else {
      setScheduleData((currentData) => {
        const newData = [...currentData.map((row) => [...row])];
        const absolutePeriodIndex =
          session === "Buổi sáng"
            ? periodIndex
            : periodIndex + morningPeriods.length;
        newData[absolutePeriodIndex][dayIndex] = {
          text: activityText,
          type: "user-added",
        };
        return newData;
      });
      console.log(
        `Thêm hoạt động "${activityText}" tại ${days[dayIndex]}, ${periods[periodIndex]}`
      );
    }
  };

  const handleSessionToggle = () => {
    setSession((current) =>
      current === "Buổi sáng" ? "Buổi chiều" : "Buổi sáng"
    );
  };

  const displayedData =
    session === "Buổi sáng"
      ? scheduleData.slice(0, morningPeriods.length)
      : scheduleData.slice(
          morningPeriods.length,
          morningPeriods.length + afternoonPeriods.length
        );

  return (
    <View style={styles.container}>
      <ScheduleHeader
        title={session}
        dateRange="12/6 - 19/6"
        year="2025"
        onPressTitle={handleSessionToggle}
      />
      <DaySelector days={days} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <ScheduleDay
          periods={periods}
          days={days}
          onAddActivity={handleAddActivity}
          scheduleData={displayedData}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

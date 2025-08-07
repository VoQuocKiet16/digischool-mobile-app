import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/Header";
import ChartSchoolTopday from "../components/manage/ChartSchoolTopday";
import ChartSchoolWeek from "../components/manage/ChartSchoolWeek";
import ChartStudentTopday from "../components/manage/ChartStudentTopday";
import ChartStudentWeek from "../components/manage/ChartStudentWeek";
import ChartTeacher from "../components/manage/ChartTeacher";
import { useNotificationContext } from "../contexts/NotificationContext";

const FILTERS = ["Toàn trường", "Giáo viên", "Học sinh"];
const SUB_FILTERS = ["Hôm nay", "Tuần này"];

export default function ManageSchool() {
  const { hasUnreadNotification, isLoading: notificationLoading } = useNotificationContext();
  const [filter, setFilter] = useState(0);
  const [subFilter, setSubFilter] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("userName").then((name) => {
      if (name) setUserName(name);
    });
  }, []);

  // Lấy ngày giờ hiện tại
  const now = new Date();
  const weekdays = [
    "chủ nhật",
    "thứ hai",
    "thứ ba",
    "thứ tư",
    "thứ năm",
    "thứ sáu",
    "thứ bảy",
  ];
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}'`;
  const dateStr = `${weekdays[now.getDay()]}, ${pad(now.getDate())}/${pad(
    now.getMonth() + 1
  )}/${now.getFullYear()}`;

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
      <Header
        title="Quản lý"
        name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"}
        hasUnreadNotification={!notificationLoading && hasUnreadNotification}
      />

      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() =>
              setFilter((filter + FILTERS.length - 1) % FILTERS.length)
            }
          >
            <MaterialIcons name="chevron-left" size={24} color="#29375C" />
          </TouchableOpacity>
          <Text style={styles.title}>{FILTERS[filter]}</Text>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => setFilter((filter + 1) % FILTERS.length)}
          >
            <MaterialIcons name="chevron-right" size={24} color="#29375C" />
          </TouchableOpacity>
        </View>
        {/* Ẩn subFilterRow nếu filter là Giáo viên */}
        {filter !== 1 && (
          <View style={styles.subFilterRow}>
            {SUB_FILTERS.map((item, idx) => (
              <TouchableOpacity
                key={item}
                style={styles.subFilterBtn}
                onPress={() => setSubFilter(idx)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.subFilterText,
                    subFilter === idx && styles.subFilterTextActive,
                  ]}
                >
                  {item}
                </Text>
                {subFilter === idx && <View style={styles.underline} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.timeRow}>
          <MaterialIcons
            name="access-time"
            size={18}
            color="#29375C"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.timeText}>
            {timeStr}, {dateStr}
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hiển thị chart khi filter là Toàn trường và subFilter là Hôm nay */}
        {filter === 0 && subFilter === 0 && <ChartSchoolTopday />}
        {/* Hiển thị chart tuần khi filter là Toàn trường và subFilter là Tuần này */}
        {filter === 0 && subFilter === 1 && <ChartSchoolWeek />}
        {/* Hiển thị chart học sinh hôm nay */}
        {filter === 2 && subFilter === 0 && <ChartStudentTopday />}
        {/* Hiển thị chart học sinh tuần này */}
        {filter === 2 && subFilter === 1 && <ChartStudentWeek />}
        {/* Hiển thị chart giáo viên */}
        {filter === 1 && <ChartTeacher />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 5,
  },
  arrowBtn: {
    padding: 12,
  },
  title: {
    fontSize: 40,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    marginHorizontal: 12,
    letterSpacing: 2,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  filterBtnActive: {
    backgroundColor: "#E6EEF2",
  },
  filterText: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
  },
  filterTextActive: {
    color: "#29375C",
    fontWeight: "700",
  },
  subFilterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  subFilterBtn: {
    alignItems: "center",
    marginHorizontal: 12,
    paddingBottom: 2,
  },
  subFilterText: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
  },
  subFilterTextActive: {
    color: "#29375C",
    fontSize: 18,
    fontFamily: "Baloo2-SemiBold",
  },
  underline: {
    height: 2,
    backgroundColor: "#29375C",
    width: 32,
    marginTop: 2,
    borderRadius: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timeText: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
  },
});

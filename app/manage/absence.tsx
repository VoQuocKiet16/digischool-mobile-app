import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

const DATA = {
  student: [
    {
      date: "Thứ 2, 28/06/2025",
      items: [
        {
          type: "Bỏ lỡ tiết học",
          desc: "HS Nguyen Van A bỏ lỡ tiết học Toán - Lớp 10A3",
          status: "10A3",
          subject: "Toán - Lớp 10A3",
          img: require("../../assets/images/avt_default.png"),
        },
        {
          type: "Bỏ lỡ tiết học",
          desc: "HS Nguyen Van A bỏ lỡ tiết học Toán - Lớp 10A3",
          status: "10A3",
          subject: "Toán - Lớp 10A3",
          img: require("../../assets/images/avt_default.png"),
        },
        {
          type: "Bỏ lỡ tiết học",
          desc: "HS Nguyen Van A bỏ lỡ tiết học Toán - Lớp 10A3",
          status: "10A3",
          subject: "Toán - Lớp 10A3",
          img: require("../../assets/images/avt_default.png"),
        },
      ],
    },
    {
      date: "Thứ 3, 29/06/2025",
      items: [
        {
          type: "Bỏ lỡ tiết học",
          desc: "HS Nguyen Van A bỏ lỡ tiết học Toán - Lớp 10A3",
          status: "10A3",
          subject: "Toán - Lớp 10A3",
          img: require("../../assets/images/avt_default.png"),
        },
        {
          type: "Bỏ lỡ tiết học",
          desc: "HS Nguyen Van A bỏ lỡ tiết học Toán - Lớp 10A3",
          status: "10A3",
          subject: "Toán - Lớp 10A3",
          img: require("../../assets/images/avt_default.png"),
        },
      ],
    },
  ],
  teacher: [
    {
      date: "Thứ 2, 28/06/2025",
      items: [
        {
          type: "Bỏ lỡ tiết học",
          desc: "GV Nguyen Van A bỏ lỡ tiết dạy Toán - Lớp 10A3",
          status: "10A3",
          subject: "Toán - Lớp 10A3",
          img: require("../../assets/images/avt_default.png"),
        },
      ],
    },
    {
      date: "Thứ 3, 29/06/2025",
      items: [
        {
          type: "Bỏ lỡ tiết học",
          desc: "GV Nguyen Van B bỏ lỡ tiết dạy Toán - Lớp 10A3",
          status: "10A3",
          subject: "Toán - Lớp 10A3",
          img: require("../../assets/images/avt_default.png"),
        },
      ],
    },
  ],
};

export default function Absence() {
  const router = useRouter();
  const { type = "student" } = useLocalSearchParams();
  const data = DATA[type as "student" | "teacher"];

  const headerTitle = "Vắng không phép";
  const headerSubtitle =
    type === "student"
      ? "Danh sách học sinh nghỉ tiết không phép"
      : "Danh sách giáo viên nghỉ tiết không phép";

  return (
    <HeaderLayout
      title={headerTitle}
      subtitle={headerSubtitle}
      onBack={() => router.back()}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        style={{ backgroundColor: "#f7f7f7" }}
      >
        {data.map((group, idx) => (
          <View key={group.date} style={{ marginBottom: 18 }}>
            <View style={styles.dateRow}>
              <MaterialIcons
                name="access-time"
                size={18}
                color="#29375C"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.dateText}>{group.date}</Text>
            </View>
            {group.items.map((item, i) => (
              <View style={styles.card} key={i}>
                <Image source={item.img} style={styles.avatar} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.cardTitle}>{item.type}</Text>
                  <Text style={styles.cardDesc}>
                    {item.desc.split(item.subject)[0]}
                    <Text style={styles.danger}>{item.subject}</Text>
                    {item.desc.split(item.subject)[1]}
                  </Text>
                </View>
                <MaterialIcons
                  name="push-pin"
                  size={22}
                  color="#29375C"
                  style={{ marginLeft: 8, marginTop: -8 }}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 16,
    color: "#29375C",
    fontWeight: "700",
    fontFamily: fonts.bold,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#D7DCE5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    width: "92%",
    alignSelf: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 2,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 18,
    color: "#29375C",
    fontWeight: "700",
    fontFamily: fonts.bold,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 14,
    color: "#29375C",
    fontFamily: fonts.medium,
    marginTop: 0,
    flexWrap: "wrap",
  },
  danger: {
    color: "#E74C3C",
    fontWeight: "700",
    fontFamily: fonts.bold,
  },
});

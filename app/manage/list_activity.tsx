import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";

const DATA = {
  student: [
    {
      date: "Thứ 2, 23/06/2025",
      items: [
        {
          type: "Nghỉ phép",
          desc: "HS Nguyễn Văn A nghỉ phép có lý do",
          status: "có phép",
          img: require("../../assets/images/avt_default.png"),
        },
        {
          type: "Vi phạm",
          desc: "HS Nguyễn Văn A vi phạm nội quy lớp học",
          status: "vi phạm",
          img: require("../../assets/images/avt_default.png"),
        },
      ],
    },
    {
      date: "Thứ 3, 24/06/2025",
      items: [
        {
          type: "Nghỉ phép",
          desc: "HS Nguyễn Văn B nghỉ phép có lý do",
          status: "có phép",
          img: require("../../assets/images/avt_default.png"),
        },
      ],
    },
  ],
  teacher: [
    {
      date: "Thứ 2, 23/06/2025",
      items: [
        {
          type: "Yêu cầu dạy thay",
          desc: "GV Nguyen Van A yêu cầu dạy thay thành công với GV Nguyen Van B",
          status: "thành công",
          img: require("../../assets/images/avt_default.png"),
          requester: "Nguyen Van A",
          reason: "Tôi có việc đột xuất, sức khỏe không đảm bảo.",
          subject: "Toán, lớp 10A1",
          time: "tiết 3, thứ Hai, ngày 23/6/2025",
          responder: "Nguyen Van B",
        },
        {
          type: "Yêu cầu đổi tiết",
          desc: "GV Nguyen Van A yêu cầu đổi tiết thành công với GV Nguyen Van B",
          status: "thành công",
          img: require("../../assets/images/avt_default.png"),
          requester: "Nguyen Van A",
          reason: "Cần đổi tiết do bận công tác.",
          subject: "Văn, lớp 10A2",
          time: "tiết 2, thứ Hai, ngày 23/6/2025",
          responder: "Nguyen Van B",
        },
      ],
    },
    {
      date: "Thứ 3, 24/06/2025",
      items: [
        {
          type: "Yêu cầu dạy bù",
          desc: "GV Nguyen Van A yêu cầu dạy bù thành công với lớp 10A4",
          status: "thành công",
          img: require("../../assets/images/avt_default.png"),
          requester: "Nguyen Van A",
          reason: "Bù cho tiết nghỉ hôm trước.",
          subject: "Lý, lớp 10A4",
          time: "tiết 4, thứ Ba, ngày 24/6/2025",
          responder: "Nguyen Van B",
        },
      ],
    },
  ],
};

export default function ListActivity() {
  const router = useRouter();
  const { type = "student" } = useLocalSearchParams();
  const data = DATA[type as "student" | "teacher"];

  // Header tuỳ theo type
  const headerTitle =
    type === "student" ? "Danh sách hoạt động" : "Danh sách hoạt động";
  const headerSubtitle =
    type === "student"
      ? "Danh sách học sinh nghỉ phép, vi phạm"
      : "Danh sách yêu cầu dạy thay, đổi tiết, dạy bù";

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
              <View
                style={styles.card}
                key={i}
                onTouchEnd={() => {
                  if (type === "student") {
                    router.push({
                      pathname: "/manage/activity_detail",
                      params: {
                        title: item.type,
                        reason: item.desc,
                        status: item.status,
                      },
                    });
                  } else {
                    const tItem = item as any;
                    router.push({
                      pathname: "/manage/activity_detail",
                      params: {
                        title: tItem.type,
                        requester: tItem.requester || "",
                        reason: tItem.reason || "",
                        subject: tItem.subject || "",
                        time: tItem.time || "",
                        responder: tItem.responder || "",
                        status: tItem.status || "",
                      },
                    });
                  }
                }}
              >
                <Image source={item.img} style={styles.avatar} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.cardTitle}>{item.type}</Text>
                  <Text style={styles.cardDesc}>
                    {item.desc.split(item.status)[0]}
                    <Text style={styles.success}>{item.status}</Text>
                    {item.desc.split(item.status)[1]}
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
    fontFamily: "Baloo2-Bold",
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
    fontFamily: "Baloo2-Bold",
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 14,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
    marginTop: 0,
    flexWrap: "wrap",
  },
  success: {
    color: "#2E8B57",
    fontWeight: "700",
    fontFamily: "Baloo2-Bold",
  },
});

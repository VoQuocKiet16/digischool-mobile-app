import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";

export default function ActivityDetail() {
  const router = useRouter();
  // Nhận dữ liệu từ params (giả lập mẫu)
  const params = useLocalSearchParams();
  // Nếu có params truyền vào thì lấy, không thì dùng mẫu
  const data = params && Object.keys(params).length > 0 ? params : {
    title: "Yêu cầu dạy thay tiết học",
    requester: "Nguyen Van A",
    reason: "tôi có việc đột xuất, sức khỏe không đảm bảo.",
    subject: "Toán, lớp 10A1",
    time: "tiết 3, thứ Hai, ngày 23/6/2025",
    responder: "Nguyen Van B",
    status: "Thành công",
  };

  return (
    <HeaderLayout
      title="Chi tiết hoạt động"
      onBack={() => router.back()}
    >
      <ScrollView style={styles.contentWrap}>
        <Text style={styles.title}>{data.title}</Text>
        <View style={styles.contentSection}>
          {data.requester ? (
            <>
              <Text style={styles.label}>
                Giáo viên yêu cầu: <Text style={styles.bold}>{data.requester}</Text>
              </Text>
              <Text style={styles.label}>
                Lý do: <Text style={styles.link}>{data.reason}</Text>
              </Text>
              <Text style={styles.label}>
                Môn học, lớp: <Text style={styles.bold}>{data.subject}</Text>
              </Text>
              <Text style={styles.label}>
                Thời gian: <Text style={styles.bold}>{data.time}</Text>
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>
                Lý do: <Text style={styles.link}>{data.reason}</Text>
              </Text>
            </>
          )}
        </View>
        <View style={styles.contentSection}>
          {data.responder && (
            <Text style={styles.label}>
              Giáo viên phản hồi: <Text style={styles.bold}>{data.responder}</Text>
            </Text>
          )}
          <Text style={styles.label}>
            Trạng thái: <Text style={styles.success}>{data.status}</Text>
          </Text>
        </View>
      </ScrollView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  contentWrap: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 18,
  },
  title: {
    fontSize: 28,
    color: "#000",
    marginBottom: 10,
    fontFamily: "Baloo2-SemiBold",
  },
  contentSection: {
    marginTop: 18,
  },
  label: {
    fontSize: 18,
    color: "#000",
    marginBottom: 6,
    fontFamily: "Baloo2-Regular",
  },
  bold: {
    fontFamily: "Baloo2-SemiBold",
    color: "#000",
  },
  link: {
    color: "#000",
    fontFamily: "Baloo2-Regular",
  },
  success: {
    color: "#2E8B57",
    fontFamily: "Baloo2-Regular",
  },
});

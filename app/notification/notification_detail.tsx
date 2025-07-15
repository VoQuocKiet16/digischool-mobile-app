import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import HeaderLayout from "../../components/layout/HeaderLayout";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const title = params.title || "";
  const content = params.content || "<p>Không có nội dung</p>";
  const senderName = params.sender_name || "";
  const senderGender = params.sender_gender || "";
  const createdAt = params.createdAt || "";

  return (
<HeaderLayout title="Chi tiết thông báo" onBack={() => router.back()}>
<View style={styles.contentWrap}>
  {title ? <Text style={styles.title}>{title}</Text> : null}
  <WebView
    originWhitelist={["*"]}
    source={{
      html: `<style>body { font-size: 40px; line-height: 1.5; font-family: "Baloo2", sans-serif; }</style>${content as string}`,
    }}
    style={styles.webview}
    scrollEnabled={false}
  />
  <View style={{ height: 24 }} />
  {senderName ? (
    <Text style={styles.sender}>
      {senderGender === "male" ? "Thầy" : "Cô"} {senderName}{" "}
      <Text style={{ color: "#29375C", fontWeight: "medium" }}>đã gửi</Text>
    </Text>
  ) : null}
  {createdAt ? (
    <Text style={styles.time}>{timeAgo(createdAt as string)}</Text>
  ) : null}
</View>
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
    marginBottom: 16,
    fontFamily: "Baloo2-SemiBold",
  },
  webview: {
    width: "100%",
    minHeight: 150,
    maxHeight: 350,
    backgroundColor: "transparent",
  },
  sender: {
    fontWeight: "medium",
    color: "#29375C",
    fontSize: 15,
    marginBottom: 6,
  },
  time: {
    color: "#A0A0A0",
    fontSize: 15,
    fontWeight: "500",
  },
});

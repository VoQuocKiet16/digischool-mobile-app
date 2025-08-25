import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import HeaderLayout from "../../components/layout/HeaderLayout";
import { approveOrRejectRequest } from "../../services/approve_reject.service";
import {
  approveSubstituteRequest,
  approveSubstituteRequestManager,
  approveSwapRequest,
  approveSwapRequestManager
} from "../../services/lesson_request.service";
import { fonts } from "../../utils/responsive";

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
  const senderRole = params.sender_role || [];
  const createdAt = params.createdAt || "";
  // Parse relatedObject an toàn
  let relatedObject = null;
  if (params.relatedObject_id) {
    let ro = params.relatedObject_id;
    if (Array.isArray(ro)) ro = ro[0];
    try {
      relatedObject = JSON.parse(ro);
    } catch {}
  }

  const relatedObjectId = relatedObject?.id || params.relatedObject_id;
  const relatedObjectRequestType = relatedObject?.requestType || params.relatedObject_requestType;
  const relatedObjectStatus = relatedObject?.status || params.relatedObject_status;

  const [loading, setLoading] = React.useState(false);
  const [currentUserRole, setCurrentUserRole] = React.useState<string[]>([]);
  const slideAnim = React.useRef(new Animated.Value(100)).current; // Initial position off-screen

  // Lấy role của người dùng hiện tại
  React.useEffect(() => {
    const getUserRole = async () => {
      try {
        const userRoleInfo = await AsyncStorage.getItem("userRoleInfo");
        if (userRoleInfo) {
          const parsedRoleInfo = JSON.parse(userRoleInfo);
          const userRole = parsedRoleInfo?.role || [];
          setCurrentUserRole(userRole);
        }
      } catch (error) {
        alert("Lỗi khi lấy role người dùng: " + (error as Error).message);
      }
    };
    getUserRole();
  }, []);

  // Kiểm tra xem có phải role quản lý không
  const isManager = currentUserRole.includes("manager") || currentUserRole.includes("admin");

  const showActionBar = [
    "substitute_request",
    "swap_request",
    "makeup_request",
    "teacher_leave_request",
    "student_leave_request",
  ].includes(relatedObjectRequestType as string)
    && relatedObjectStatus !== "approved"
    && relatedObjectStatus !== "rejected"
    && relatedObjectStatus !== "cancelled"; 

  React.useEffect(() => {
    if (showActionBar) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [showActionBar]);

  const handleApprove = async () => {
    if (!relatedObjectRequestType || !relatedObjectId) {
      alert("Thiếu thông tin yêu cầu");
      return;
    }
    setLoading(true);
    try {
      console.log("relatedObject", relatedObject);
      console.log("relatedObjectRequestType", relatedObjectRequestType);
      console.log("relatedObjectId", relatedObjectId);
      console.log("isManager", isManager);
      console.log("relatedObject?.teacherApproved", relatedObject?.teacherApproved);

              // Sử dụng logic 2 giai đoạn cho substitute và swap requests
        if (relatedObjectRequestType === "substitute_request") {
          if (isManager) {
            // Manager approve (giai đoạn 2) - vì nếu manager nhận thông báo thì đã đến giai đoạn 2
            await approveSubstituteRequestManager(relatedObjectId as string);
          } else {
            // Teacher approve (giai đoạn 1)
            await approveSubstituteRequest(relatedObjectId as string);
          }
        } else if (relatedObjectRequestType === "swap_request") {
          if (isManager) {
            // Manager approve (giai đoạn 2) - vì nếu manager nhận thông báo thì đã đến giai đoạn 2
            await approveSwapRequestManager(relatedObjectId as string);
          } else {
            // Teacher approve (giai đoạn 1)
            await approveSwapRequest(relatedObjectId as string);
          }
        } else {
        // Sử dụng service cũ cho các request khác (makeup, leave requests)
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token");
        await approveOrRejectRequest(
          relatedObjectRequestType as string,
          relatedObjectId as string,
          "approve",
          token
        );
      }
      router.back();
    } catch (err: any) {
      alert("Có lỗi xảy ra khi chấp nhận: " + (err?.message || err));
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!relatedObjectRequestType || !relatedObjectId) {
      alert("Thiếu thông tin yêu cầu");
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token");
      const res = await approveOrRejectRequest(
        relatedObjectRequestType as string,
        relatedObjectId as string,
        "reject",
        token
      );
      alert("Từ chối thành công!");
      router.back();
    } catch (err: any) {
      alert("Có lỗi xảy ra khi từ chối: " + (err?.message || err));
    }
    setLoading(false);
  };

  return (
    <HeaderLayout title="Chi tiết thông báo" onBack={() => router.back()}>
      <ScrollView style={styles.contentWrap}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <WebView
          originWhitelist={["*"]}
          source={{
            html: `
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&family=Manrope:wght@200..800&family=Space+Grotesk:wght@300..700&display=swap');
              </style>
              <style>
                body {
                  font-size: 50px;
                  line-height: 1.5;
                  font-family: "Baloo 2", sans-serif;
                  font-weight: 450;
                }
              </style>
              ${content as string}
            `,
          }}
          style={styles.webview}
          scrollEnabled={false}
        />
        {senderName ? (
          <Text style={styles.sender}>
            {senderRole.includes("student") ? "[HS]" : senderRole.includes("teacher") ? "[GV]" : "[QL]"} {senderName}{" "}
          </Text>
        ) : null}
        {createdAt ? (
          <Text style={styles.time}>{timeAgo(createdAt as string)}</Text>
        ) : null}
      </ScrollView>
      {showActionBar && (
        <Animated.View style={[styles.actionBar, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.actionTitle}>Phản hồi yêu cầu</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} disabled={loading}>
              <Text style={styles.rejectText}>{loading ? "Đang xử lý..." : "Từ chối"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleApprove} disabled={loading}>
              <Text style={styles.acceptText}>{loading ? "Đang xử lý..." : "Chấp nhận"}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
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
    fontFamily: fonts.semiBold,
  },
  webview: {
    width: "100%",
    minHeight: 150,
    maxHeight: 350,
    backgroundColor: "transparent",
  },
  sender: {
    color: "#000",
    fontSize: 18,
    marginBottom: 6,
    fontFamily: fonts.medium,
  },
  time: {
    color: "#A0A0A0",
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#3B4A6B",
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: "flex-start",
  },
  actionTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: fonts.semiBold,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  rejectBtn: {
    flex: 1,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: "center",
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#22304A",
    borderRadius: 20,
    paddingVertical: 12,
    marginLeft: 10,
    alignItems: "center",
  },
  rejectText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
  acceptText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
});

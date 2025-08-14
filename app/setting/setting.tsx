import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import ConfirmLogoutModal from "../../components/notifications_modal/ConfirmLogoutModal";
import RefreshableScrollView from "../../components/RefreshableScrollView";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { useUserData } from "../../hooks/useUserData";
import { logout } from "../../services/auth.service";
import { fonts } from "../../utils/responsive";

const Setting: React.FC = () => {
  const router = useRouter();
  const { userData, refreshUserData } = useUserData();
  const { reconnectSocket } = useNotificationContext();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      // Logout function đã handle việc clear session data
      await logout();
      
      // Reconnect socket để disconnect với user cũ
      reconnectSocket();
      
      router.replace("/auth/login");
    } catch (err) {
      // Nếu có lỗi, vẫn clear session data và redirect
      await AsyncStorage.multiRemove([
        "token", 
        "userId", 
        "role", 
        "userName", 
        "userEmail", 
        "userPhone", 
        "userAddress", 
        "userRoleInfo", 
        "userInfo",
        "userDateOfBirth",
        "userGender",
        "userStudentId",
        "userTeacherId",
        "userManagerId",
        "userClass",
        "userSubjects"
      ]);
      
      router.replace("/auth/login");
    }
  };

  const getRoleDisplay = (roles: string[]) => {
    if (roles.includes("student")) return "Học sinh";
    if (roles.includes("teacher")) return "Giáo viên";
    if (roles.includes("manager")) return "Quản trị viên";
    return "Người dùng";
  };

  const getRoleDetail = (roles: string[]) => {
    if (roles.includes("student")) {
      return userData?.class?.className || "Đang tải...";
    } else if (roles.includes("teacher")) {
      return userData?.subject?.subjectName || "Đang tải...";
    } else if (roles.includes("manager")) {
      return "Ban giám hiệu";
    }

    return "Người dùng";
  };

  const handleOpenPrivacyPolicy = async () => {
    const url = "https://docs.google.com/document/d/1YQs1vYYApk9q7J3h2U8Xclbr2o3h0cQMxVXGQixoIdE/edit?usp=sharing";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Không thể mở link này");
      }
    } catch (error) {
      console.log("Lỗi khi mở link:", error);
    }
  };

  const handleOpenUserGuide = async () => {
    const url = "https://docs.google.com/document/d/14YtJRNZ4G4fvrvdHi6tWH6TQQmIt1YT0dKdbw6qm5mI/edit?usp=sharing";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Không thể mở link này");
      }
    } catch (error) {
      console.log("Lỗi khi mở link:", error);
    }
  };

  return (
    <HeaderLayout title="Cài đặt" onBack={() => router.back()}>
      <RefreshableScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        onRefresh={refreshUserData}
      >
        <View style={styles.profileCard}>
          <Image
            source={require("../../assets/images/avt_default.png")}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={styles.name}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userData?.name
                ? userData.name
                : "Đang tải..."}
            </Text>
            <Text style={styles.role}>
              {userData
                ? `${getRoleDisplay(
                    userData.roleInfo?.role || []
                  )} - ${getRoleDetail(userData.roleInfo?.role || [])}`
                : "Đang tải..."}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
        <View
          style={{ height: 1, backgroundColor: "#FFFFFF", width: "100%" }}
        />
        <View style={styles.menuWrap}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/setting/personal")}
          >
            <View style={styles.menuIcon}>
              <Ionicons
                name="person-circle-outline"
                size={28}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#29375C"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push("/setting/security")}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Bảo mật</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#29375C"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleOpenPrivacyPolicy}
          >
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={28}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.menuText}>Chính sách bảo mật</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#29375C"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenUserGuide}>
            <View style={styles.menuIcon}>
              <Ionicons name="book-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Hướng dẫn người dùng</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#29375C"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
        </View>
      </RefreshableScrollView>
      <ConfirmLogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#29375C",
    fontFamily: fonts.bold,
  },
  role: {
    fontSize: 18,
    color: "#29375C",
    marginTop: 2,
    fontFamily: fonts.medium,
  },
  logoutBtn: {
    backgroundColor: "#FFA6A6",
    borderRadius: 25,
    marginHorizontal: 32,
    marginBottom: 30,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#B71C1C",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  menuWrap: {
    borderRadius: 16,
    marginHorizontal: 15,
    marginTop: 8,
    paddingVertical: 8,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#29375C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    color: "#29375C",
    fontWeight: "bold",
    fontFamily: fonts.semiBold,
  },
  menuArrow: {
    marginLeft: 8,
  },
});

export default Setting;

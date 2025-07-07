import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import ConfirmLogoutModal from "../../components/notifications_modal/ConfirmLogoutModal";
import RefreshableScrollView from "../../components/RefreshableScrollView";
import { useUserData } from "../../hooks/useUserData";
import { logout } from "../../services/auth.service";

const Setting: React.FC = () => {
  const router = useRouter();
  const { userData, refreshUserData } = useUserData();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      await AsyncStorage.clear();
      router.replace("/auth/login");
    } catch (err) {
      console.log("Logout error in setting:", err);
    }
  };

  const getRoleDisplay = (roles: string[]) => {
    if (roles.includes("student")) return "Học sinh";
    if (roles.includes("teacher")) return "Giáo viên";
    if (roles.includes("admin")) return "Quản trị viên";
    return "Người dùng";
  };

  const getRoleDetail = () => {
    if (!userData) return "Đang tải...";

    const roles = userData.roleInfo?.role || [];

    if (roles.includes("student")) {
      // Hiển thị lớp học cho học sinh
      return userData.class?.className || "Chưa có thông tin lớp";
    } else if (roles.includes("teacher")) {
      // Hiển thị bộ môn cho giáo viên
      if (userData.subjects && userData.subjects.length > 0) {
        const subjectNames = userData.subjects
          .map((subject: any) => subject.subjectName || subject)
          .join(", ");
        return subjectNames;
      }
      return "Chưa có thông tin bộ môn";
    } else if (roles.includes("admin")) {
      return "Quản trị hệ thống";
    }

    return "Người dùng";
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
            <Text style={styles.name}>
              {userData?.name
                ? userData.name.length > 15
                  ? `${userData.name.substring(0, 15)}...`
                  : userData.name
                : "Đang tải..."}
            </Text>
            <Text style={styles.role}>
              {userData
                ? `${getRoleDisplay(
                    userData.roleInfo?.role || []
                  )} - ${getRoleDetail()}`
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
              color="#25345D"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Bảo mật</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#25345D"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
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
              color="#25345D"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="book-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Hướng dẫn người dùng</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#25345D"
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
    color: "#25345D",
    fontFamily: "Baloo2-Bold",
  },
  role: {
    fontSize: 18,
    color: "#25345D",
    marginTop: 2,
    fontFamily: "Baloo2-Medium",
  },
  logoutBtn: {
    backgroundColor: "#FFA6A6",
    borderRadius: 10,
    marginHorizontal: 32,
    marginBottom: 30,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#B71C1C",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "Baloo2-Bold",
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
    backgroundColor: "#25345D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    color: "#25345D",
    fontWeight: "bold",
    fontFamily: "Baloo2-SemiBold",
  },
  menuArrow: {
    marginLeft: 8,
  },
});

export default Setting;

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import RefreshableScrollView from "../../components/RefreshableScrollView";
import AccountInfo from "../../components/setting/personal/detail/AccountInfo";
import ContactInfo from "../../components/setting/personal/detail/ContactInfo";
import LearnInfo from "../../components/setting/personal/detail/LearnInfo";
import ProfileInfo from "../../components/setting/personal/detail/ProfileInfo";
import ProfileSection from "../../components/setting/personal/detail/ProfileSection";
import TeachingInfo from "../../components/setting/personal/detail/TeachingInfo";
import { useUserData } from "../../hooks/useUserData";
import { fonts } from "../../utils/responsive";

const Personal: React.FC = () => {
  const router = useRouter();
  const { userData, loading, error, refreshUserData } = useUserData();

  // Hiển thị loading screen khi đang tải dữ liệu
  if (loading) {
    return (
      <HeaderLayout
        title="Thông tin cá nhân"
        onBack={() => router.back()}
        rightIcon={<Ionicons name="pencil" size={22} color="#29375C" />}
        onRightIconPress={() => router.push("/setting/update_personal")}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#29375C" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </HeaderLayout>
    );
  }

  // Hiển thị error state nếu không có dữ liệu user
  if (!userData) {
    return (
      <HeaderLayout
        title="Thông tin cá nhân"
        onBack={() => router.back()}
        rightIcon={<Ionicons name="pencil" size={22} color="#29375C" />}
        onRightIconPress={() => router.push("/setting/update_personal")}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshUserData}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </HeaderLayout>
    );
  }

  // Xác định role của user
  const getUserRole = () => {
    if (userData?.roleInfo?.type) return userData.roleInfo.type;
    return "unknown";
  };

  const userRole = getUserRole();

  return (
    <HeaderLayout
      title="Thông tin cá nhân"
      onBack={() => router.back()}
      rightIcon={<Ionicons name="pencil" size={22} color="#29375C" />}
      onRightIconPress={() => router.push("/setting/update_personal")}
    >
      <RefreshableScrollView
        style={styles.container}
        onRefresh={refreshUserData}
      >
        <ProfileSection userData={userData} />
        <ProfileInfo userData={userData} />
        <ContactInfo userData={userData} />

        {userRole == "student" && <LearnInfo userData={userData} />}
        {(userRole == "teacher" || userRole == "homeroom_teacher") && <TeachingInfo userData={userData} />}

        <AccountInfo userData={userData} />
      </RefreshableScrollView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#29375C",
    fontFamily: fonts.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 18,
    color: "#B71C1C",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: fonts.medium,
  },
  retryButton: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
});

export default Personal;

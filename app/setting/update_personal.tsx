import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import UpdateContactInfo from "../../components/setting/personal/update/UpdateContactInfo";
import { useUserData } from "../../hooks/useUserData";
import { updatePersonalInfo } from "../../services/auth.service";
import { fonts } from "../../utils/responsive";

export default function UpdatePersonal() {
  const { userData, loading, error, refreshUserData } = useUserData();
  const [avatar] = useState(require("../../assets/images/avt_default.png"));
  const [role, setRole] = useState("Người dùng");

  // Set role based on userData
  React.useEffect(() => {
    if (userData?.roleInfo?.type) {
      const roleMap: { [key: string]: string } = {
        'student': 'Học sinh',
        'teacher': 'Giáo viên',
        'homeroom_teacher': 'Giáo viên chủ nhiệm',
        'manager': 'Quản trị viên',
        'admin': 'Quản trị viên'
      };
      setRole(roleMap[userData.roleInfo.type] || 'Người dùng');
    }
  }, [userData]);
  
  // Form data state
  const [contactData, setContactData] = useState({
    phone: "",
    address: ""
  });
  
  // Loading state
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Hiển thị loading screen khi đang tải dữ liệu
  if (loading) {
    return (
      <HeaderLayout title="Thông tin cá nhân" onBack={() => router.back()}>
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
      <HeaderLayout title="Thông tin cá nhân" onBack={() => router.back()}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshUserData}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </HeaderLayout>
    );
  }

  const handleChangeAvatar = () => {
    // TODO: Implement avatar change functionality
    alert("Chức năng thay đổi avatar đang được phát triển!");
  };

  const handleSave = async () => {
    setShowLoading(true);
    setLoadingSuccess(false);
    setUpdateError("");

    try {
      // Prepare data for API
      const updateData: any = {};
      
      if (contactData.phone.trim()) updateData.phone = contactData.phone.trim();
      if (contactData.address.trim()) updateData.address = contactData.address.trim();

      const response = await updatePersonalInfo(updateData);
      
      if (response && response.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          router.back();
        }, 1000);
      } else {
        setUpdateError(response.message || "Cập nhật thông tin thất bại!");
        setShowLoading(false);
      }
    } catch (error: any) {
      setUpdateError(error.message || "Cập nhật thông tin thất bại!");
      setShowLoading(false);
    }
  };

  return (
    <HeaderLayout title="Thông tin cá nhân" onBack={() => router.back()}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarBox}>
            <Image source={avatar} style={styles.avatar} />
            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={handleChangeAvatar}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.role}>{role}</Text>
          <UpdateContactInfo 
            userData={userData} 
            onDataChange={setContactData}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <LoadingModal
        visible={showLoading}
        text={loadingSuccess ? "Cập nhật thành công!" : "Đang cập nhật..."}
        success={loadingSuccess}
      />
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: "100%",
  },
  avatarBox: {
    position: "relative",
    width: 110,
    height: 110,
    marginBottom: 8,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  cameraIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    backgroundColor: "rgba(60,60,60,0.25)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  role: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: fonts.medium,
    marginBottom: 25,
    alignSelf: "center",
  },
  form: {
    width: "90%",
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 130,
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
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

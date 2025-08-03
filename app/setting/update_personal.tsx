import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import UpdateContactInfo from "../../components/setting/personal/update/UpdateContactInfo";
import UpdateProfileInfo from "../../components/setting/personal/update/UpdateProfileInfo";
import { useUserData } from "../../hooks/useUserData";
import { updatePersonalInfo } from "../../services/auth.service";
import { fonts } from "../../utils/responsive";

export default function UpdatePersonal() {
  const { userData } = useUserData();
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
  const [profileData, setProfileData] = useState({
    name: "",
    dateOfBirth: "",
    gender: ""
  });
  const [contactData, setContactData] = useState({
    phone: "",
    address: ""
  });
  
  // Loading state
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChangeAvatar = () => {
    // TODO: Implement avatar change functionality
    alert("Chức năng thay đổi avatar đang được phát triển!");
  };

  const handleSave = async () => {
    // Validate required fields
    if (!profileData.name.trim()) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }

    setShowLoading(true);
    setLoadingSuccess(false);
    setError("");

    try {
      // Prepare data for API
      const updateData: any = {};
      
      if (profileData.name.trim()) updateData.name = profileData.name.trim();
      if (profileData.dateOfBirth) updateData.dateOfBirth = profileData.dateOfBirth;
      if (profileData.gender) updateData.gender = profileData.gender;
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
        setError(response.message || "Cập nhật thông tin thất bại!");
        setShowLoading(false);
      }
    } catch (error: any) {
      setError(error.message || "Cập nhật thông tin thất bại!");
      setShowLoading(false);
    }
  };

  return (
    <HeaderLayout title="Thông tin cá nhân" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.container}>
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
        <UpdateProfileInfo 
          userData={userData} 
          onDataChange={setProfileData}
        />
        <UpdateContactInfo 
          userData={userData} 
          onDataChange={setContactData}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
      
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
    borderRadius: 12,
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
});

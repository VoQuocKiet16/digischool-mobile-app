import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import RefreshableScrollView from "../../components/RefreshableScrollView";
import AccountInfo from "../../components/setting/personal/detail/AccountInfo";
import ContactInfo from "../../components/setting/personal/detail/ContactInfo";
import LearnInfo from "../../components/setting/personal/detail/LearnInfo";
import ProfileInfo from "../../components/setting/personal/detail/ProfileInfo";
import ProfileSection from "../../components/setting/personal/detail/ProfileSection";
import TeachingInfo from "../../components/setting/personal/detail/TeachingInfo";
import ManageService, { AccountDetailResponse } from "../../services/manage.service";
import { UserData } from "../../types/user.types";

const DetailAccount: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params?.id;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadAccountDetail();
    } else {
      Alert.alert('Lỗi', 'ID tài khoản không hợp lệ.');
      setLoading(false);
    }
  }, [id]);

  const convertToUserData = (accountData: AccountDetailResponse): UserData => {
    // Xác định role
    const isStudent = accountData.role === 'student' || (Array.isArray(accountData.role) && accountData.role.includes('student'));
    const isTeacher = accountData.role === 'teacher' || (Array.isArray(accountData.role) && accountData.role.includes('teacher'));
    const isHomeroomTeacher = Array.isArray(accountData.role) && accountData.role.includes('homeroom_teacher');

    // Xử lý môn học cho giáo viên
    const getSubjects = () => {
      if (isTeacher) {
        if (accountData.subject) return [accountData.subject];
        if (accountData.subjects && accountData.subjects.length > 0) return accountData.subjects;
        return null;
      }
      return null;
    };

    // Xử lý lớp học
    const getClassInfo = () => {
      if (isStudent && accountData.class) {
        return accountData.class;
      }
      if (isTeacher && accountData.homeroomClass) {
        return accountData.homeroomClass;
      }
      return null;
    };

    return {
      name: accountData.name || "Chưa cập nhật",
      email: accountData.email || "Chưa cập nhật",
      phone: accountData.phone || "Chưa cập nhật",
      address: accountData.address || "Chưa cập nhật",
      dateOfBirth: accountData.dateOfBirth || null, // Để ProfileInfo tự format
      gender: accountData.gender || "Chưa cập nhật",
      studentId: isStudent ? (accountData.studentId || "Chưa cập nhật") : null,
      teacherId: isTeacher ? (accountData.teacherId || "Chưa cập nhật") : null,
      managerId: null, // Không có trong AccountDetailResponse
      class: getClassInfo(),
      subjects: getSubjects(),
      roleInfo: {
        type: isStudent ? 'student' : (isTeacher ? 'teacher' : undefined),
        homeroomClass: isHomeroomTeacher ? (accountData.homeroomClass?.name || "Không") : undefined,
        school: "THPT Phan Văn Trị", // Giá trị mặc định
        isHomeroom: isHomeroomTeacher,
        isHomeroomTeacher: isHomeroomTeacher
      }
    };
  };

  const loadAccountDetail = async () => {
    try {
      setLoading(true);
      const data = await ManageService.getAccountDetail(id);
      const convertedData = convertToUserData(data);
      setUserData(convertedData);
    } catch (error) {

      Alert.alert('Lỗi', 'Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadAccountDetail();
  };

  if (loading) {
    return (
      <HeaderLayout
        title="Chi tiết tài khoản"
        onBack={() => router.back()}
      >
        <RefreshableScrollView style={styles.container} onRefresh={handleRefresh}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải thông tin tài khoản...</Text>
          </View>
        </RefreshableScrollView>
      </HeaderLayout>
    );
  }

  if (!userData) {
    return (
      <HeaderLayout
        title="Chi tiết tài khoản"
        onBack={() => router.back()}
      >
        <RefreshableScrollView style={styles.container} onRefresh={handleRefresh}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không tìm thấy thông tin tài khoản.</Text>
          </View>
        </RefreshableScrollView>
      </HeaderLayout>
    );
  }

  return (
    <HeaderLayout
      title="Chi tiết tài khoản"
      onBack={() => router.back()}
    >
      <RefreshableScrollView style={styles.container} onRefresh={handleRefresh}>
        <ProfileSection userData={userData} />
        <ProfileInfo userData={userData} />
        <ContactInfo userData={userData} />
        
        {/* Hiển thị theo role */}
        {userData.roleInfo?.type === "student" && <LearnInfo userData={userData} />}
        {userData.roleInfo?.type === "teacher" && <TeachingInfo userData={userData} />}
        
        <AccountInfo userData={userData} />
      </RefreshableScrollView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#29375C',
    fontFamily: 'Baloo2-Medium',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#29375C',
    fontFamily: 'Baloo2-Medium',
  },
});

export default DetailAccount;

import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import RefreshableScrollView from "../../components/RefreshableScrollView";
import AccountInfo from "../../components/setting/personal/detail/AccountInfo";
import ContactInfo from "../../components/setting/personal/detail/ContactInfo";
import LearnInfo from "../../components/setting/personal/detail/LearnInfo";
import ProfileInfo from "../../components/setting/personal/detail/ProfileInfo";
import ProfileSection from "../../components/setting/personal/detail/ProfileSection";

// Dữ liệu mẫu cho quản lý xem thông tin học sinh/giáo viên
const sampleUserData = {
  name: "Nguyen Van A",
  email: "example@gmail.com",
  phone: "0814747265",
  address: "Ninh Kieu, Can Tho",
  dateOfBirth: "2003-01-01",
  gender: "male",
  studentId: "HS-101",
  teacherId: null,
  managerId: null,
  class: { name: "10A3", school: "THPT Phan Văn Trị" },
  subjects: [],
  roleInfo: { type: "student" },
};

const DetailAccount: React.FC = () => {
  const router = useRouter();
  const userData = sampleUserData;

  return (
    <HeaderLayout
      title="Chi tiết tài khoản"
      onBack={() => router.back()}
    >
      <RefreshableScrollView style={styles.container} onRefresh={async () => {}}>
        <ProfileSection userData={userData} />
        <ProfileInfo userData={userData} />
        <ContactInfo userData={userData} />
        <LearnInfo userData={userData} />
        <AccountInfo userData={userData} />
      </RefreshableScrollView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default DetailAccount;

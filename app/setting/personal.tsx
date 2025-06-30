import { Ionicons } from "@expo/vector-icons";
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
import { useUserData } from "../../hooks/useUserData";

const Personal: React.FC = () => {
  const router = useRouter();
  const { userData, loading, error, refreshUserData } = useUserData();

  return (
    <HeaderLayout
      title="Thông tin cá nhân"
      onBack={() => router.back()}
      rightIcon={<Ionicons name="pencil" size={22} color="#25345D" />}
      onRightIconPress={() => router.push("/setting/update_personal")}
    >
      <RefreshableScrollView
        style={styles.container}
        onRefresh={refreshUserData}
      >
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

export default Personal;

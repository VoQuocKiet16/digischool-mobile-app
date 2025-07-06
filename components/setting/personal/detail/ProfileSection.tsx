import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { UserData } from "../../../../types/user.types";

interface ProfileSectionProps {
  userData: UserData | null;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userData }) => {
  const getRoleDisplay = () => {
    switch (userData?.roleInfo?.type) {
      case "student":
        return "Học sinh";
      case "teacher":
        return "Giáo viên";
      case "manager":
        return "Quản trị viên";
      default:
        return "Người dùng";
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.avatar}
        source={require("../../../../assets/images/avt_default.png")}
      />
      <Text style={styles.role}>{getRoleDisplay()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20, paddingBottom: 0 },
  avatar: { width: 120, height: 120, borderRadius: 10, marginBottom: 10 },
  role: { fontSize: 18, color: "#25345D", fontFamily: "Baloo2-Medium" },
});

export default ProfileSection;

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface UserData {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  studentId: string | null;
  teacherId: string | null;
  managerId: string | null;
  class: any | null;
  subjects: any[];
  roleInfo: any | null;
}

interface ProfileInfoProps {
  userData: UserData | null;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ userData }) => {
  const [showInfo, setShowInfo] = useState(true);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, "0")} - ${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")} - ${date.getFullYear()}`;
    } catch {
      return "Chưa cập nhật";
    }
  };

  const getDisplayId = () => {
    if (userData?.studentId) return userData.studentId;
    if (userData?.teacherId) return userData.teacherId;
    if (userData?.managerId) return userData.managerId;
    return "Chưa cập nhật";
  };

  const getGenderDisplay = () => {
    if (userData?.gender === "male") return "Nam";
    if (userData?.gender === "female") return "Nữ";
    return "Chưa cập nhật";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <TouchableOpacity onPress={() => setShowInfo((v) => !v)}>
          <Ionicons
            name={showInfo ? "chevron-down" : "chevron-forward"}
            size={24}
            color="#25345D"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {showInfo && (
        <>
          <View style={styles.item}>
            <Text style={styles.label}>Họ và tên</Text>
            <Text style={styles.value}>
              {userData?.name || "Chưa cập nhật"}
            </Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Mã học sinh</Text>
            <Text style={styles.value}>{getDisplayId()}</Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Ngày sinh</Text>
            <Text style={styles.value}>
              {formatDate(userData?.dateOfBirth || null)}
            </Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Giới tính</Text>
            <Text style={styles.value}>{getGenderDisplay()}</Text>
            <View style={styles.underline} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    paddingRight: 20,
    paddingLeft: 20,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    color: "#25345D",
    flex: 1,
    fontFamily: "Baloo2-Bold",
  },
  icon: {
    color: "#25345D",
    marginLeft: 6,
    backgroundColor: "#C4C4C4",
    borderRadius: 20,
    padding: 4,
  },
  item: {
    paddingVertical: 6,
    position: "relative",
  },
  label: {
    color: "#25345D",
    fontSize: 18,
    fontFamily: "Baloo2-SemiBold",
  },
  value: {
    color: "#A3A7AC",
    fontSize: 18,
    position: "absolute",
    right: 0,
    top: 5,
    fontFamily: "Baloo2-SemiBold",
  },
  underline: {
    height: 3,
    backgroundColor: "#FFA726",
    marginTop: 7,
    borderRadius: 2,
  },
});

export default ProfileInfo;

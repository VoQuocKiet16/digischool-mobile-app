import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserData } from "../../../../types/user.types";

interface TeachingInfoProps {
  userData: UserData | null;
}

const TeachingInfo: React.FC<TeachingInfoProps> = ({ userData }) => {
  const [showInfo, setShowInfo] = useState(true);

  const getSubjectsDisplay = () => {
    if (!userData?.subjects || userData.subjects.length === 0) {
      return "Chưa cập nhật";
    }
    return userData.subjects
      .map((subject: any) => subject.subjectName)
      .join(", ");
  };

  const getHomeroomClass = () => {
    if (!userData?.roleInfo?.homeroomClass) {
      return "Chưa cập nhật";
    }
    return userData.roleInfo.homeroomClass;
  };

  const getSchoolName = () => {
    if (!userData?.roleInfo?.school) {
      return "Chưa cập nhật";
    }
    return userData.roleInfo.school;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Thông tin giảng dạy</Text>
        <TouchableOpacity onPress={() => setShowInfo((v) => !v)}>
          <Ionicons
            name={showInfo ? "chevron-down" : "chevron-forward"}
            size={24}
            color="#29375C"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {showInfo && (
        <>
          <View style={styles.item}>
            <Text style={styles.label}>Bộ môn</Text>
            <Text style={styles.value}>{getSubjectsDisplay()}</Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Chủ nhiệm</Text>
            <Text style={styles.value}>{getHomeroomClass()}</Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Trường học</Text>
            <Text style={styles.value}>{getSchoolName()}</Text>
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
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    color: "#29375C",
    flex: 1,
    fontFamily: "Baloo2-Bold",
  },
  icon: {
    color: "#29375C",
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
    color: "#29375C",
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
    maxWidth: "60%",
    textAlign: "right",
  },
  underline: {
    height: 3,
    backgroundColor: "#FFA726",
    marginTop: 7,
    borderRadius: 2,
  },
});

export default TeachingInfo;

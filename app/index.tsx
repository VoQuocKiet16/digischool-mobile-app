import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Header from "../components/Header";
import ScheduleStudentsScreen from "./students/schedule/schedule";
import ScheduleTeacherScreen from "./teachers/schedule/schedule";

export default function HomeScreen() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("role"),
      AsyncStorage.getItem("userName"),
    ]).then(([roleStr, name]) => {
      if (roleStr) {
        try {
          const parsedRoles = JSON.parse(roleStr);
          setRoles(parsedRoles);
        } catch (error) {
          console.log("Error parsing role:", error);
          setRoles([]);
        }
      } else {
        setRoles([]);
      }
      if (name) setUserName(name);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  const renderHeader = (rolePrefix: string) => (
    <Header
      title="Trang chủ"
      name={userName ? `${rolePrefix} ${userName}` : `${rolePrefix}...`}
    />
  );

  if (roles.includes("teacher")) {
    // UI cho teacher
    return (
      <View style={styles.container}>
        {renderHeader("GV")}
        <ScheduleTeacherScreen />
      </View>
    );
  }

  if (roles.includes("manager")) {
    
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  // UI cho student
  return (
    <View style={styles.container}>
      {renderHeader("HS")}
      <ScheduleStudentsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

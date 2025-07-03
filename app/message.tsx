import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View
} from "react-native";
import Header from "../components/Header";
import MessageListScreen from "./message/message_list";

export default function MessageScreen() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("role"),
      AsyncStorage.getItem("userName"),
    ]).then(([roleStr, name]) => {
      if (roleStr) setRoles(JSON.parse(roleStr));
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

  if (roles.includes("teacher")) {
    // UI cho giáo viên
    return (
      <View style={styles.container}>
        <Header
          title="Trò chuyện"
          studentName={userName ? `GV ${userName}` : "GV Nguyễn Văn A"}
        />
        {/* TODO: Thay bằng component chat cho giáo viên nếu có */}
        <MessageListScreen userName={userName} roles={roles} />
      </View>
    );
  }

  if (roles.includes("manager")) {
    // UI cho manager
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  // UI cho học sinh
  return (
    <View style={styles.container}>
      <Header
        title="Trò chuyện"
        studentName={userName ? `HS ${userName}` : "HS Nguyễn Văn A"}
      />
      <MessageListScreen userName={userName} roles={roles} />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Header from "../components/Header";
import { useNotificationContext } from "../contexts/NotificationContext";
import chatService from "../services/chat.service";
import MessageListScreen from "./message/message_list";

export default function MessageScreen() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { hasUnreadNotification } = useNotificationContext();

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("role"),
      AsyncStorage.getItem("userName"),
      AsyncStorage.getItem("userId"),
      AsyncStorage.getItem("token"),
    ]).then(([roleStr, name, id, tkn]) => {
      if (roleStr) setRoles(JSON.parse(roleStr));
      if (name) setUserName(name);
      if (id) setMyId(id);
      if (tkn) setToken(tkn);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (myId && token) {
      chatService.connect(myId, token);
    }
  }, [myId, token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#29375C" />
      </View>
    );
  }

  if (roles.includes("teacher")) {
    // UI cho giáo viên
    return (
      <View style={styles.container}>
        <Header
          title="Trò chuyện"
          name={userName ? `GV ${userName}` : "GV Nguyễn Văn A"}
          hasUnreadNotification={hasUnreadNotification}
        />
        {/* TODO: Thay bằng component chat cho giáo viên nếu có */}
        <MessageListScreen />
      </View>
    );
  }

  if (roles.includes("manager")) {
    // UI cho manager
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#29375C" />
      </View>
    );
  }

  // UI cho học sinh
  return (
    <View style={styles.container}>
      <Header
        title="Trò chuyện"
        name={userName ? `HS ${userName}` : "HS Nguyễn Văn A"}
        hasUnreadNotification={hasUnreadNotification}
      />
      <MessageListScreen />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
};

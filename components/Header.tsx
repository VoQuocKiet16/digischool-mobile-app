import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedView } from "./ThemedView";

interface HeaderProps {
  title: string;
  name: string;
  hasUnreadNotification?: boolean;
}

export default function Header({
  title,
  name,
  hasUnreadNotification,
}: HeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleAvatarPress = () => {
    router.push("setting/setting" as any);
  };

  const handleBellPress = () => {
    router.push("/notification/notification_list");
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ThemedView style={styles.headerWrap}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../assets/images/digi-logo.png")}
            style={styles.logo}
          />
          <View style={styles.textWrap}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <Text
              style={styles.studentName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Xin chào, {name}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleBellPress}
            activeOpacity={0.7}
            style={styles.bellWrap}
          >
            <Ionicons name="notifications-outline" size={24} color="#29375C" />
            {hasUnreadNotification ? <View style={styles.bellDot} /> : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
            <Image
              source={require("../assets/images/avt_default.png")}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <View style={{ height: 1, backgroundColor: "#FFFFFF", width: "100%" }} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: "#f7f7f7",
    width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  logo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    fontWeight: "bold",
  },
  studentName: {
    fontSize: 14,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6eef2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e74c3c",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

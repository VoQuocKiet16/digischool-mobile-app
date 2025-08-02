import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts, responsive, responsiveValues } from "../utils/responsive";

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

  const [loaded] = useFonts({
    "Baloo2-Bold": require("../assets/fonts/Baloo2-Bold.ttf"),
    "Baloo2-Medium": require("../assets/fonts/Baloo2-Medium.ttf"),
    // Có thể thêm các font khác nếu cần
  });

  if (!loaded) return null;

  const handleAvatarPress = () => {
    router.push("setting/setting" as any);
  };

  const handleBellPress = () => {
    router.push("/notification/notification_list");
  };

  // Truncate tên thành 15 ký tự
  const truncatedName = name.length > 25 ? name.slice(0, 20) + "..." : name;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={styles.headerWrap}>
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
              Xin chào, {truncatedName}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleBellPress}
            activeOpacity={0.7}
            style={styles.bellWrap}
          >
            <Ionicons 
              name="notifications-outline" 
              size={responsiveValues.iconSize.xxl} 
              color="#29375C" 
            />
            {hasUnreadNotification ? <View style={styles.bellDot} /> : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
            <Image
              source={require("../assets/images/avt_default.png")}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: "#FFFFFF", width: "100%" }} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveValues.padding.md,
    paddingTop: responsive.height(6),
    paddingBottom: responsiveValues.padding.sm,
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
    width: 56,
    height: 56,
    resizeMode: "contain",
    marginRight: responsiveValues.padding.sm,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: responsiveValues.fontSize.xl,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
  },
  studentName: {
    fontSize: responsiveValues.fontSize.sm,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: responsiveValues.padding.sm,
  },
  bellWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e6eef2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveValues.padding.sm,
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: responsiveValues.padding.xs,
    right: responsiveValues.padding.sm,
    width: responsiveValues.padding.xs,
    height: responsiveValues.padding.xs,
    borderRadius: responsiveValues.borderRadius.sm,
    backgroundColor: "#e74c3c",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#29375C",
        tabBarInactiveTintColor: "#C4C4C4",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 10,
          fontFamily: "Baloo2-Bold",
        },
        tabBarIconStyle: {
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            height: 95,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 5,
            shadowOffset: {
              width: 0,
              height: -1.5,
            },
            elevation: 10,
            borderTopWidth: 0, // Xóa border
            backgroundColor: "#ffffff",
          },
          default: {
            borderTopWidth: 0, // Xóa border
            backgroundColor: "#ffffff",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home-filled" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Trò chuyện",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="forum" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "Tin tức",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="newspaper" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage_account"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage_process"
        options={{
          title: "Quá trình",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checkmark.icloud.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage_rollcall"
        options={{
          title: "Điểm danh",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checkmark.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage_schedule"
        options={{
          title: "Thời khoá biểu",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage_school"
        options={{
          title: "Trường học",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="graduationcap.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

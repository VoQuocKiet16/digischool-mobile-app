import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

<<<<<<< khoi-api
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
=======
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
>>>>>>> local

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: 'Message',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
<<<<<<< khoi-api
          title: 'News',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="newspaper.fill" color={color} />,
=======
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
>>>>>>> local
        }}
      />
    </Tabs>
  );
}

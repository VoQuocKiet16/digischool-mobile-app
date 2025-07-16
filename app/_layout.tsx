import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-reanimated";
import { NotificationProvider } from "../contexts/NotificationContext";
import { UserProvider, useUserContext } from "../contexts/UserContext";

import { useColorScheme } from "@/hooks/useColorScheme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import các màn hình
import Index from "./index";
import ManageAccount from "./manage_account";
import ManageProcess from "./manage_process";
import ManageRollcall from "./manage_rollcall";
import ManageSchedule from "./manage_schedule";
import ManageSchool from "./manage_school";
import Message from "./message";
import News from "./news";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Trang chủ")
            return <MaterialIcons name="home" size={size} color={color} />;
          if (route.name === "Tin nhắn")
            return <MaterialIcons name="chat" size={size} color={color} />;
          if (route.name === "Tin tức")
            return <MaterialIcons name="article" size={size} color={color} />;
          return null;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#999",
      })}
    >
      <Tab.Screen name="Trang chủ" component={Index} />
      <Tab.Screen name="Tin nhắn" component={Message} />
      <Tab.Screen name="Tin tức" component={News} />
    </Tab.Navigator>
  );
}

function ManagerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Tài khoản")
            return <MaterialIcons name="group" size={size} color={color} />;
          if (route.name === "Tiến trình")
            return <MaterialIcons name="timeline" size={size} color={color} />;
          if (route.name === "Điểm danh")
            return (
              <MaterialIcons name="check-circle" size={size} color={color} />
            );
          if (route.name === "TKB")
            return (
              <MaterialIcons name="calendar-today" size={size} color={color} />
            );
          if (route.name === "Quản lý")
            return <MaterialIcons name="school" size={size} color={color} />;
          return null;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#999",
      })}
    >
      <Tab.Screen name="Tài khoản" component={ManageAccount} />
      <Tab.Screen name="Tiến trình" component={ManageProcess} />
      <Tab.Screen name="Điểm danh" component={ManageRollcall} />
      <Tab.Screen name="TKB" component={ManageSchedule} />
      <Tab.Screen name="Quản lý" component={ManageSchool} />
    </Tab.Navigator>
  );
}

function MainTabs({ role }: { role: string | null }) {
  if (role === "manager") return <ManagerTabs />;
  return <StudentTabs />;
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Baloo2-Bold": require("../assets/fonts/Baloo2-Bold.ttf"),
    "Baloo2-ExtraBold": require("../assets/fonts/Baloo2-ExtraBold.ttf"),
    "Baloo2-Medium": require("../assets/fonts/Baloo2-Medium.ttf"),
    "Baloo2-Regular": require("../assets/fonts/Baloo2-Regular.ttf"),
    "Baloo2-SemiBold": require("../assets/fonts/Baloo2-SemiBold.ttf"),
  });
  const router = useRouter();
  const pathname = usePathname();
  const { userData, setUserData } = useUserContext();

  // Tab cấu hình
  const studentTabs = [
    {
      name: "Trang chủ",
      route: "/",
      icon: <MaterialIcons name="home" size={24} color="#22304A" />,
    },
    {
      name: "Tin nhắn",
      route: "/message",
      icon: <MaterialIcons name="chat" size={24} color="#22304A" />,
    },
    {
      name: "Tin tức",
      route: "/news",
      icon: <MaterialIcons name="article" size={24} color="#22304A" />,
    },
  ];
  const managerTabs = [
    {
      name: "Tài khoản",
      route: "/manage_account",
      icon: <MaterialIcons name="group" size={24} color="#22304A" />,
    },
    {
      name: "Tiến trình",
      route: "/manage_process",
      icon: <MaterialIcons name="timeline" size={24} color="#22304A" />,
    },
    {
      name: "Điểm danh",
      route: "/manage_rollcall",
      icon: <MaterialIcons name="check-circle" size={24} color="#22304A" />,
    },
    {
      name: "TKB",
      route: "/manage_schedule",
      icon: <MaterialIcons name="calendar-today" size={24} color="#22304A" />,
    },
    {
      name: "Quản lý",
      route: "/manage_school",
      icon: <MaterialIcons name="school" size={24} color="#22304A" />,
    },
  ];

  // Xác định role
  let role = null;
  if (userData?.roleInfo?.type === "manager") {
    role = "manager";
  } else if (userData?.roleInfo?.type === "teacher") {
    role = "teacher";
  } else if (userData?.roleInfo?.type === "student") {
    role = "student";
  }

  // Chọn tab phù hợp
  const tabs = role === "manager" ? managerTabs : studentTabs;
  // Xác định tab nào đang active
  const currentRoute = pathname;
  // Các route cần ẩn tabbar
  const hiddenTabBarRoutes = [
    "/auth",
    "/login",
    "/news/add_news",
    "/news/edit_news",
    "/message/message_box",
    "/notification/notification_detail",
    "/notification/notification_create",
    "/note/note",
    "/note/detail_note",
    "/note/add_note",
    "/teachers/leave_request/leave_request",
    "/teachers/leave_request/leave_request_info",
    "/students/leave_request/leave_request",
    "/students/leave_request/leave_request_info",
  ];
  // Kiểm tra có cần ẩn tabbar không
  const isTabBarHidden = hiddenTabBarRoutes.some((route) =>
    pathname.startsWith(route)
  );
  // Khi bấm tab
  const handleTabPress = (route: string) => {
    if (currentRoute !== route) {
      router.replace(route as any);
    }
  };

  const tabBarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(tabBarAnim, {
      toValue: isTabBarHidden ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isTabBarHidden]);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        router.replace("/");
      } else {
        router.replace("/auth");
      }
    });
  }, []);

  useEffect(() => {
    if (role === "manager" && pathname === "/") {
      router.replace("/manage_school");
    }
  }, [role, pathname]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#29375C" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Slot />
        {role && (
          <Animated.View
            style={[
              styles.tabBar,
              {
                opacity: tabBarAnim,
                transform: [
                  {
                    translateY: tabBarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            pointerEvents={isTabBarHidden ? "none" : "auto"}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.route}
                style={[
                  styles.tabItem,
                  currentRoute === tab.route && styles.tabItemActive,
                ]}
                onPress={() => handleTabPress(tab.route)}
              >
                <View>
                  {React.cloneElement(tab.icon, {
                    color: currentRoute === tab.route ? "#29375C" : "#C4C4C4",
                  })}
                </View>
                <Text
                  style={[
                    styles.tabText,
                    currentRoute === tab.route && styles.tabTextActive,
                  ]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <NotificationProvider>
        <RootLayoutContent />
      </NotificationProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 90,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabItemActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    color: "#C4C4C4",
    marginTop: 2,
    fontFamily: "Baloo2-SemiBold",
  },
  tabTextActive: {
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
  },
});

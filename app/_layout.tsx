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
import Toast from "react-native-toast-message";
import ToastNotification from "../components/ToastNotification";
import { NotificationProvider, useNotificationContext } from "../contexts/NotificationContext";
import { UserProvider, useUserContext } from "../contexts/UserContext";

import { useColorScheme } from "@/hooks/useColorScheme";
import { fonts, responsiveValues } from "../utils/responsive";


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
  const { toastVisible, toastTitle, toastMessage, hideToast } = useNotificationContext();

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
      name: "Quản lý",
      route: "/manage_school",
      icon: <MaterialIcons name="school" size={24} color="#22304A" />,
    },
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
    
  ];

  // Xác định role
  let role = null;
  if (userData?.roleInfo?.type === "manager") {
    role = "manager";
  } else if (userData?.roleInfo?.type === "teacher" || userData?.roleInfo?.type === "homeroom_teacher") {
    role = "teacher";
  } else if (userData?.roleInfo?.type === "student") {
    role = "student";
  }

  // Chọn tab phù hợp
  const tabs = role === "manager" ? managerTabs : studentTabs;
  // Xác định tab nào đang active
  const currentRoute = pathname;
  // Các route cần HIỆN tabbar
  const shownTabBarRoutes = [
    "/manage_account",
    "/",
    "/manage_process",
    "/manage_rollcall",
    "/manage_schedule",
    "/manage_school",
    "/message",
    "/news",
  ]
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
    "/news/news_detail",
    "/news/manage_news",
    "/news/add_news",
    "/news/edit_news",
    "/teachers/lesson_request/substitute_request",
    "/teachers/lesson_request/swap_schedule",
    "/teachers/lesson_request/swap_request",
    "/teachers/lesson_request/makeup_schedule",
    "/teachers/lesson_request/makeup_request",
    "/teachers/lesson_information/lesson_evaluate",
    "/students/lesson_information/lesson_evaluate",
    "/message/add_contact",
    "/activity/add_activity",
    "/activity/detail_activity",
    "/manage/detail_account",
  ];
  // Chỉ hiện tabbar ở đúng các route này
  const isTabBarHidden = !shownTabBarRoutes.some((route) => pathname === route);
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
      
      {/* Global Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        title={toastTitle}
        message={toastMessage}
        onClose={hideToast}
        onPress={() => {
          hideToast();
          router.push("/notification/notification_list");
        }}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <NotificationProvider>
        <RootLayoutContent />
        <Toast 
          config={{
            success: (props) => {
              const router = useRouter();
              return (
                <TouchableOpacity
                  onPress={() => {
                    Toast.hide();
                    router.push("/notification/notification_list");
                  }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    marginHorizontal: 20,
                    marginTop: 80,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5,
                    borderLeftWidth: 8,
                    borderLeftColor: '#4CAF50',
                  }}
                >
                  <View style={{
                    width: 30,
                    height: 30,
                    borderRadius: 25,
                    backgroundColor: '#4CAF50',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 16,
                    marginRight: 16,
                  }}>
                    <MaterialIcons name="check" size={24} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1, paddingVertical: 16 }}>
                    <Text style={{
                      color: '#1E3A8A',
                      marginTop: 8,
                      fontSize: 16,
                      fontFamily: fonts.medium,
                      lineHeight: 20,
                    }}>
                      Bạn có thông báo mới
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={{
                      padding: 8,
                      marginRight: 8,
                    }}
                    onPress={(e) => {
                      e.stopPropagation();
                      Toast.hide();
                    }}
                  >
                    <MaterialIcons name="close" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            },
          }}
        />
      </NotificationProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E6E9F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabItemActive: {
    // Active state styling
  },
  tabText: {
    fontSize: responsiveValues.fontSize.sm,
    marginTop: 4,
    fontFamily: fonts.semiBold,
    color: '#C4C4C4',
  },
  tabTextActive: {
    color: "#29375C",
    fontFamily: fonts.bold,
  },
});

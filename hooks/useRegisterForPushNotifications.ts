import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

export function useRegisterForPushNotifications(
  onToken: (token: string) => void
) {
  useEffect(() => {
    async function register() {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Bạn cần cấp quyền thông báo để nhận notification!");
          return;
        }
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        onToken(token); // Gửi token về backend hoặc lưu vào state
        console.log("Expo Push Token:", token);
      } else {
        alert("Chỉ thiết bị thật mới nhận được push notification!");
      }
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }
    }
    register();
  }, []);
}

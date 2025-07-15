import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getNotifications,
  Notification,
} from "../services/notification.service";

interface NotificationContextProps {
  notifications: Notification[];
  hasUnreadNotification: boolean;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  hasUnreadNotification: false,
  refreshNotifications: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await getNotifications({ token });
      setNotifications(res.data || []);
      const userId = await AsyncStorage.getItem("userId");
      setHasUnreadNotification(
        (res.data || []).some(
          (n: Notification) => !n.isReadBy || !n.isReadBy.includes(userId || "")
        )
      );
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasUnreadNotification,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

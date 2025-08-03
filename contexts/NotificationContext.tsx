import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { baseURL } from "../services/api.config";
import {
  getNotifications,
  Notification,
} from "../services/notification.service";

const SOCKET_URL = `${baseURL}/`;

interface NotificationContextType {
  // Notification list by type
  notificationsUser: Notification[];
  notificationsActivity: Notification[];
  notificationsSystem: Notification[];
  hasUnreadNotification: boolean;
  refreshNotifications: () => void;
  refreshNotificationsByType: (type: 'user' | 'activity' | 'system') => void;
  
  // Toast notification
  showToast: (title: string, message: string) => void;
  hideToast: () => void;
  toastVisible: boolean;
  toastTitle: string;
  toastMessage: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Notification list state by type
  const [notificationsUser, setNotificationsUser] = useState<Notification[]>([]);
  const [notificationsActivity, setNotificationsActivity] = useState<Notification[]>([]);
  const [notificationsSystem, setNotificationsSystem] = useState<Notification[]>([]);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  
  // Socket
  const [socket, setSocket] = useState<Socket | null>(null);

  // Kết nối socket để nhận realtime notifications
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const [userId, token] = await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("token"),
        ]);

        if (userId && token) {
          setUserId(userId);
          
          const newSocket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token: `Bearer ${token}` },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
          });

          newSocket.on("connect", () => {
            console.log("✅ Notification socket connected");
          });

          newSocket.on("disconnect", () => {
            console.log("❌ Notification socket disconnected");
          });

          newSocket.on("connect_error", (error) => {
            console.error("❌ Notification socket connection error:", error);
          });

          // Lắng nghe notification mới
          newSocket.on("new_notification", (notification: Notification) => {
            // Kiểm tra xem notification có dành cho user hiện tại không
            if (notification.receivers?.includes(userId)) {
              // Thêm notification vào đúng category
              switch (notification.type) {
                case "user":
                  setNotificationsUser(prev => [notification, ...prev]);
                  break;
                case "activity":
                  setNotificationsActivity(prev => [notification, ...prev]);
                  break;
                case "system":
                  setNotificationsSystem(prev => [notification, ...prev]);
                  break;
              }
              
              // Cập nhật hasUnreadNotification
              setHasUnreadNotification(true);
              
              // Hiển thị toast
              showToast(notification.title, notification.content);
            }
          });

          newSocket.emit("join", userId);
          setSocket(newSocket);
        }
      } catch (error) {
        console.error("❌ Error initializing notification socket:", error);
      }
    };

    initializeSocket();

    // Cleanup khi component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Tính toán hasUnreadNotification dựa trên tất cả notifications và userId
  useEffect(() => {
    if (!userId) return;

    const allNotifications = [
      ...notificationsUser,
      ...notificationsActivity,
      ...notificationsSystem
    ];

    const hasUnread = allNotifications.some(
      (n) => !n.isReadBy || !n.isReadBy.includes(userId)
    );
    setHasUnreadNotification(hasUnread);
  }, [notificationsUser, notificationsActivity, notificationsSystem, userId]);

  const fetchAllNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      
      const [user, activity, system] = await Promise.all([
        getNotifications({ type: "user", token }),
        getNotifications({ type: "activity", token }),
        getNotifications({ type: "system", token }),
      ]);
      
      setNotificationsUser(user.data || []);
      setNotificationsActivity(activity.data || []);
      setNotificationsSystem(system.data || []);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  };

  const refreshNotificationsByType = async (type: 'user' | 'activity' | 'system') => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      
      const response = await getNotifications({ type, token });
      
      switch (type) {
        case "user":
          setNotificationsUser(response.data || []);
          break;
        case "activity":
          setNotificationsActivity(response.data || []);
          break;
        case "system":
          setNotificationsSystem(response.data || []);
          break;
      }
    } catch (error) {
      console.error(`❌ Error fetching ${type} notifications:`, error);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  // Toast functions
  const showToast = (title: string, message: string) => {
    setToastTitle(title);
    setToastMessage(message);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const value: NotificationContextType = {
    // Notification list by type
    notificationsUser,
    notificationsActivity,
    notificationsSystem,
    hasUnreadNotification,
    refreshNotifications: fetchAllNotifications,
    refreshNotificationsByType,
    
    // Toast notification
    showToast,
    hideToast,
    toastVisible,
    toastTitle,
    toastMessage,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

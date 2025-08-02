import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  getNotifications,
  Notification,
} from "../services/notification.service";

const SOCKET_URL = "http://192.168.1.7:8080/";

interface NotificationContextType {
  // Notification list
  notifications: Notification[];
  hasUnreadNotification: boolean;
  refreshNotifications: () => void;
  
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
  // Notification list state
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
              // Thêm notification vào list
              setNotifications(prev => [notification, ...prev]);
              
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

  // Tính toán hasUnreadNotification dựa trên notifications và userId
  useEffect(() => {
    if (!userId) return;

    const hasUnread = notifications.some(
      (n) => !n.isReadBy || !n.isReadBy.includes(userId)
    );
    setHasUnreadNotification(hasUnread);
  }, [notifications, userId]);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await getNotifications({ token });
      setNotifications(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
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
    // Notification list
    notifications,
    hasUnreadNotification,
    refreshNotifications: fetchNotifications,
    
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

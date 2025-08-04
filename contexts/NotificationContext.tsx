import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
  
  // Socket management
  reconnectSocket: () => void;
  
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
  const [userToken, setUserToken] = useState<string | null>(null);
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  
  // Socket
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  // Tạo socket connection
  const createSocket = useCallback(async () => {
    try {
      const [currentUserId, currentToken] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("token"),
      ]);

      // Nếu đang kết nối hoặc không có user/token, không làm gì
      if (isConnectingRef.current || !currentUserId || !currentToken) {
        return;
      }

      // Kiểm tra nếu user thay đổi, clear notifications cũ
      if (userId && userId !== currentUserId) {
        // Chỉ clear khi có user mới, không clear khi user logout
        if (currentUserId) {
          setNotificationsUser([]);
          setNotificationsActivity([]);
          setNotificationsSystem([]);
          setHasUnreadNotification(false);
        }
      }

      // Nếu đã có socket và đang kết nối, không làm gì
      if (socketRef.current && socketRef.current.connected) {
        return;
      }

      // Disconnect socket cũ nếu có
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      isConnectingRef.current = true;
      
      const newSocket = io(SOCKET_URL, {
        transports: ["websocket"],
        auth: { token: `Bearer ${currentToken}` },
        reconnection: false, // Tắt auto reconnection để tự quản lý
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        isConnectingRef.current = false;
        setUserId(currentUserId);
        setUserToken(currentToken);
      });

      newSocket.on("disconnect", () => {
        isConnectingRef.current = false;
      });

      newSocket.on("connect_error", (error) => {
        isConnectingRef.current = false;
      });

      // Lắng nghe notification mới
      newSocket.on("new_notification", (notification: Notification) => {
        if (notification.receivers?.includes(currentUserId)) {
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
          
          setHasUnreadNotification(true);
          showToast(notification.title, notification.content);
        }
      });

      newSocket.emit("join", currentUserId);
      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (error) {
      isConnectingRef.current = false;
    }
  }, []);

  // Check và reconnect socket mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      createSocket();
    }, 5000);

    return () => clearInterval(interval);
  }, [createSocket]);

  // Clear notifications khi user logout (userId = null)
  useEffect(() => {
    if (!userId && (notificationsUser.length > 0 || notificationsActivity.length > 0 || notificationsSystem.length > 0)) {
      // Chỉ clear khi user thực sự logout (userId = null)
      setNotificationsUser([]);
      setNotificationsActivity([]);
      setNotificationsSystem([]);
      setHasUnreadNotification(false);
    }
  }, [userId, notificationsUser.length, notificationsActivity.length, notificationsSystem.length]);

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
      const [currentUserId, token] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("token"),
      ]);
      
      if (!token || !currentUserId) return;
      
      // Kiểm tra nếu user thay đổi, chỉ clear sau khi load notifications mới
      if (userId && userId !== currentUserId && currentUserId) {
        // Load notifications mới trước
        const [user, activity, system] = await Promise.all([
          getNotifications({ type: "user", token }),
          getNotifications({ type: "activity", token }),
          getNotifications({ type: "system", token }),
        ]);
        
        // Sau đó mới clear và set notifications mới
        setNotificationsUser(user.data || []);
        setNotificationsActivity(activity.data || []);
        setNotificationsSystem(system.data || []);
      } else {
        // User không thay đổi, load bình thường
        const [user, activity, system] = await Promise.all([
          getNotifications({ type: "user", token }),
          getNotifications({ type: "activity", token }),
          getNotifications({ type: "system", token }),
        ]);
        
        setNotificationsUser(user.data || []);
        setNotificationsActivity(activity.data || []);
        setNotificationsSystem(system.data || []);
      }
    } catch (error) {
      // Handle error silently
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

  const reconnectSocket = () => {
    // Disconnect socket hiện tại
    if (socketRef.current) {
      console.log("🔄 Force disconnecting socket...");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    
    // Reset state
    setUserId(null);
    setUserToken(null);
    isConnectingRef.current = false;
    
    // Tạo socket mới ngay lập tức
    createSocket();
  };

  const value: NotificationContextType = {
    // Notification list by type
    notificationsUser,
    notificationsActivity,
    notificationsSystem,
    hasUnreadNotification,
    refreshNotifications: fetchAllNotifications,
    refreshNotificationsByType,
    
    // Socket management
    reconnectSocket,
    
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

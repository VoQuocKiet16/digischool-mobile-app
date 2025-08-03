import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
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

  // Kết nối socket để nhận realtime notifications
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const [currentUserId, currentToken] = await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("token"),
        ]);

        // Nếu đang kết nối, không làm gì
        if (isConnectingRef.current) {
          return;
        }

        // Nếu user hoặc token thay đổi, disconnect socket cũ
        if (socketRef.current && (currentUserId !== userId || currentToken !== userToken)) {
          console.log("🔄 User changed, disconnecting old socket...");
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
        }

        if (currentUserId && currentToken) {
          setUserId(currentUserId);
          setUserToken(currentToken);
          
          // Chỉ tạo socket mới nếu chưa có hoặc user thay đổi
          if (!socketRef.current || currentUserId !== userId || currentToken !== userToken) {
            console.log("🔄 Creating new socket for user:", currentUserId);
            isConnectingRef.current = true;
            
            const newSocket = io(SOCKET_URL, {
              transports: ["websocket"],
              auth: { token: `Bearer ${currentToken}` },
              reconnection: true,
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
              timeout: 20000,
            });

            newSocket.on("connect", () => {
              console.log("✅ Notification socket connected for user:", currentUserId);
              isConnectingRef.current = false;
            });

            newSocket.on("disconnect", () => {
              console.log("❌ Notification socket disconnected for user:", currentUserId);
              isConnectingRef.current = false;
            });

            newSocket.on("connect_error", (error) => {
              console.error("❌ Notification socket connection error:", error);
              isConnectingRef.current = false;
            });

            // Lắng nghe notification mới
            newSocket.on("new_notification", (notification: Notification) => {
              // Kiểm tra xem notification có dành cho user hiện tại không
              if (notification.receivers?.includes(currentUserId)) {
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

            newSocket.emit("join", currentUserId);
            socketRef.current = newSocket;
            setSocket(newSocket);
          }
        } else {
          // Nếu không có user hoặc token, disconnect socket
          if (socketRef.current) {
            console.log("🔄 No user/token, disconnecting socket...");
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
          }
          setUserId(null);
          setUserToken(null);
        }
      } catch (error) {
        console.error("❌ Error initializing notification socket:", error);
        isConnectingRef.current = false;
      }
    };

    initializeSocket();

    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Chỉ chạy một lần khi mount

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
    
    // Khởi tạo lại socket sau một chút
    setTimeout(() => {
      const initializeSocket = async () => {
        try {
          const [currentUserId, currentToken] = await Promise.all([
            AsyncStorage.getItem("userId"),
            AsyncStorage.getItem("token"),
          ]);

          if (currentUserId && currentToken) {
            console.log("🔄 Reconnecting socket for user:", currentUserId);
            isConnectingRef.current = true;
            
            const newSocket = io(SOCKET_URL, {
              transports: ["websocket"],
              auth: { token: `Bearer ${currentToken}` },
              reconnection: true,
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
              timeout: 20000,
            });

            newSocket.on("connect", () => {
              console.log("✅ Notification socket reconnected for user:", currentUserId);
              isConnectingRef.current = false;
            });

            newSocket.on("disconnect", () => {
              console.log("❌ Notification socket disconnected for user:", currentUserId);
              isConnectingRef.current = false;
            });

            newSocket.on("connect_error", (error) => {
              console.error("❌ Notification socket connection error:", error);
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
            setUserId(currentUserId);
            setUserToken(currentToken);
          }
        } catch (error) {
          console.error("❌ Error reconnecting notification socket:", error);
          isConnectingRef.current = false;
        }
      };
      
      initializeSocket();
    }, 1000); // Delay 1 giây trước khi reconnect
  };

  // Reconnect socket khi app được focus lại
  useFocusEffect(
    useCallback(() => {
      const checkAndReconnect = async () => {
        try {
          const [currentUserId, currentToken] = await Promise.all([
            AsyncStorage.getItem("userId"),
            AsyncStorage.getItem("token"),
          ]);

          // Nếu có user và token nhưng socket không kết nối, reconnect
          if (currentUserId && currentToken && (!socketRef.current || !socketRef.current.connected)) {
            console.log("🔄 App focused, reconnecting socket...");
            reconnectSocket();
          }
        } catch (error) {
          console.error("❌ Error checking socket on focus:", error);
        }
      };

      checkAndReconnect();
    }, [])
  );

  // Kiểm tra socket connection định kỳ
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [currentUserId, currentToken] = await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("token"),
        ]);

        // Nếu có user và token nhưng socket không kết nối, reconnect
        if (currentUserId && currentToken && (!socketRef.current || !socketRef.current.connected)) {
          console.log("🔄 Socket disconnected, reconnecting...");
          reconnectSocket();
        }
      } catch (error) {
        console.error("❌ Error checking socket connection:", error);
      }
    }, 30000); // Kiểm tra mỗi 30 giây

    return () => clearInterval(interval);
  }, []);

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

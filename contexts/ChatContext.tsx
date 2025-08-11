import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import chatService from "../services/chat.service";

interface ChatContextType {
  currentUserId: string | null;
  currentToken: string | null;
  connectChat: (userId: string, token: string) => void;
  disconnectChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Khi app khởi động, lấy thông tin user từ AsyncStorage
  useEffect(() => {
    (async () => {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (userId && token) {
        setCurrentUserId(userId);
        setCurrentToken(token);
        // Kết nối chat cho user này
        console.log(`ChatContext: Connecting chat for user ${userId}`);
        chatService.connect(userId, token);
      }
    })();
  }, []);

  const connectChat = (userId: string, token: string) => {
    // Nếu đang có user khác kết nối, disconnect trước
    if (currentUserId && currentUserId !== userId) {
      console.log(`ChatContext: Disconnecting previous user ${currentUserId} and connecting new user ${userId}`);
      chatService.disconnect(currentUserId);
    }
    
    setCurrentUserId(userId);
    setCurrentToken(token);
    console.log(`ChatContext: Connecting chat for user ${userId}`);
    chatService.connect(userId, token);
  };

  const disconnectChat = () => {
    if (currentUserId) {
      console.log(`ChatContext: Disconnecting chat for user ${currentUserId}`);
      chatService.disconnect(currentUserId);
      setCurrentUserId(null);
      setCurrentToken(null);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      currentUserId, 
      currentToken, 
      connectChat, 
      disconnectChat 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export default ChatProvider; 
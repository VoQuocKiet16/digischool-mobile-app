import React, { createContext, useContext, useMemo, useRef } from "react";

export interface CacheEntry<T> {
  items: T[];
  updatedAt: number;
}

interface ChatCacheContextValue {
  // Conversations: key theo myUserId
  getConversations: (userId: string) => CacheEntry<any> | undefined;
  setConversations: (userId: string, items: any[]) => void;

  // Messages: key theo peer user id (đoạn chat 1-1)
  getMessages: (peerUserId: string) => CacheEntry<any> | undefined;
  setMessages: (peerUserId: string, items: any[]) => void;
}

const ChatCacheContext = createContext<ChatCacheContextValue | undefined>(undefined);

export const ChatCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const conversationsRef = useRef<Record<string, CacheEntry<any>>>({});
  const messagesRef = useRef<Record<string, CacheEntry<any>>>({});

  const value: ChatCacheContextValue = useMemo(() => ({
    getConversations: (userId) => {
      return conversationsRef.current[userId];
    },
    setConversations: (userId, items) => {
      conversationsRef.current[userId] = { items, updatedAt: Date.now() };
    },
    getMessages: (peerUserId) => {
      return messagesRef.current[peerUserId];
    },
    setMessages: (peerUserId, items) => {
      messagesRef.current[peerUserId] = { items, updatedAt: Date.now() };
    },
  }), []);

  return (
    <ChatCacheContext.Provider value={value}>{children}</ChatCacheContext.Provider>
  );
};

export function useChatCache() {
  const ctx = useContext(ChatCacheContext);
  if (!ctx) throw new Error("useChatCache must be used within ChatCacheProvider");
  return ctx;
} 
import { useCallback, useEffect, useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { useChatStore } from '../stores/chat.store';

/**
 * Hook để quản lý chat state và real-time updates
 */
export const useChatState = () => {
  const { currentUserId, currentToken } = useChatContext();
  const [isConnected, setIsConnected] = useState(false);
  
  const getConversations = useChatStore((s) => s.getConversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const getMessages = useChatStore((s) => s.getMessages);
  const setMessages = useChatStore((s) => s.setMessages);
  const clearCache = useChatStore((s) => s.clearCache);

  // Kiểm tra connection status
  useEffect(() => {
    if (currentUserId && currentToken) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [currentUserId, currentToken]);

  // Invalidate conversation cache
  const invalidateConversations = useCallback(() => {
    if (currentUserId) {
      clearCache('conversations', currentUserId);
    }
  }, [currentUserId, clearCache]);

  // Invalidate messages cache
  const invalidateMessages = useCallback((peerUserId: string) => {
    clearCache('messages', peerUserId);
  }, [clearCache]);

  // Invalidate all chat cache
  const invalidateAllChat = useCallback(() => {
    clearCache();
  }, [clearCache]);

  // Update conversation with new message
  const updateConversationWithMessage = useCallback((message: any) => {
    if (!currentUserId) return;

    const otherUserId = message.sender === currentUserId ? message.receiver : message.sender;
    const cached = getConversations(currentUserId);
    
    if (cached?.items) {
      const updatedItems = cached.items.map((conv: any) => {
        if (conv.userId === otherUserId || conv.id === otherUserId) {
          return {
            ...conv,
            lastMessage: message.content || message.text || "[Tin nhắn mới]",
            lastMessageTime: message.time || new Date().toISOString(),
            unreadCount: message.receiver === currentUserId 
              ? (conv.unreadCount || 0) + 1 
              : conv.unreadCount || 0,
          };
        }
        return conv;
      });

      // Move updated conversation to top
      const updatedConv = updatedItems.find((conv: any) => 
        conv.userId === otherUserId || conv.id === otherUserId
      );
      if (updatedConv) {
        const filtered = updatedItems.filter((conv: any) => 
          conv.userId !== otherUserId && conv.id !== otherUserId
        );
        const newItems = [updatedConv, ...filtered];
        setConversations(currentUserId, newItems);
        invalidateConversations();
      }
    }
  }, [currentUserId, getConversations, setConversations, invalidateConversations]);

  // Mark conversation as read
  const markConversationAsRead = useCallback((peerUserId: string) => {
    if (!currentUserId) return;

    const cached = getConversations(currentUserId);
    if (cached?.items) {
      const updatedItems = cached.items.map((conv: any) => {
        if (conv.userId === peerUserId || conv.id === peerUserId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      });
      setConversations(currentUserId, updatedItems);
      invalidateConversations();
    }
  }, [currentUserId, getConversations, setConversations, invalidateConversations]);

  return {
    isConnected,
    currentUserId,
    currentToken,
    getConversations,
    setConversations,
    getMessages,
    setMessages,
    clearCache,
    invalidateConversations,
    invalidateMessages,
    invalidateAllChat,
    updateConversationWithMessage,
    markConversationAsRead,
  };
}; 
import { create, type GetState, type SetState } from 'zustand';
import storageService from '../services/storage.service';

export interface CacheEntry<T> {
  items: T[];
  updatedAt: number;
}

export interface ChatStoreState {
  conversations: Record<string, CacheEntry<any>>; // key: myUserId
  messages: Record<string, CacheEntry<any>>;      // key: peerUserId
  getConversations: (userId: string) => CacheEntry<any> | undefined;
  setConversations: (userId: string, items: any[]) => void;
  getMessages: (peerUserId: string) => CacheEntry<any> | undefined;
  setMessages: (peerUserId: string, items: any[]) => void;
  clearCache: (type?: 'conversations' | 'messages', key?: string) => void;
  // Thêm methods mới cho persistent storage
  loadConversationsFromStorage: (userId: string) => Promise<any[] | null>;
  saveConversationsToStorage: (userId: string, items: any[]) => Promise<void>;
  loadMessagesFromStorage: (peerUserId: string) => Promise<any[] | null>;
  saveMessagesToStorage: (peerUserId: string, items: any[]) => Promise<void>;
}

export const useChatStore = create<ChatStoreState>((set: SetState<ChatStoreState>, get: GetState<ChatStoreState>) => ({
  conversations: {},
  messages: {},
  
  getConversations: (userId: string) => get().conversations[userId],
  
  setConversations: (userId: string, items: any[]) => {
    set((state: ChatStoreState) => ({
      conversations: {
        ...state.conversations,
        [userId]: { items, updatedAt: Date.now() },
      },
    }));
    // Tự động lưu vào persistent storage
    storageService.saveConversations(userId, items);
  },
  
  getMessages: (peerUserId: string) => get().messages[peerUserId],
  
  setMessages: (peerUserId: string, items: any[]) => {
    set((state: ChatStoreState) => ({
      messages: {
        ...state.messages,
        [peerUserId]: { items, updatedAt: Date.now() },
      },
    }));
    // Tự động lưu vào persistent storage
    storageService.saveMessages(peerUserId, items);
  },
  
  clearCache: (type?: 'conversations' | 'messages', key?: string) => {
    if (type === 'conversations') {
      if (key) {
        // Xóa cache cho conversation cụ thể
        set((state: ChatStoreState) => {
          const newConversations = { ...state.conversations };
          delete newConversations[key];
          return { conversations: newConversations };
        });
        // Xóa khỏi persistent storage
        storageService.clearUserData(key);
      } else {
        // Xóa toàn bộ cache conversations
        set({ conversations: {} });
        // Xóa toàn bộ conversations khỏi persistent storage
        storageService.clearAllData();
      }
    } else if (type === 'messages') {
      if (key) {
        // Xóa cache cho messages cụ thể
        set((state: ChatStoreState) => {
          const newMessages = { ...state.messages };
          delete newMessages[key];
          return { messages: newMessages };
        });
        // Xóa khỏi persistent storage
        storageService.clearUserData(key);
      } else {
        // Xóa toàn bộ cache messages
        set({ messages: {} });
        // Xóa toàn bộ messages khỏi persistent storage
        storageService.clearAllData();
      }
    } else {
      // Xóa toàn bộ cache
      set({ conversations: {}, messages: {} });
      // Xóa toàn bộ data khỏi persistent storage
      storageService.clearAllData();
    }
  },

  // Methods mới cho persistent storage
  loadConversationsFromStorage: async (userId: string) => {
    try {
      const conversations = await storageService.loadConversations(userId);
      if (conversations) {
        // Cập nhật RAM cache với data từ storage
        set((state: ChatStoreState) => ({
          conversations: {
            ...state.conversations,
            [userId]: { items: conversations, updatedAt: Date.now() },
          },
        }));
        return conversations;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading conversations from storage:', error);
      return null;
    }
  },

  saveConversationsToStorage: async (userId: string, items: any[]) => {
    try {
      await storageService.saveConversations(userId, items);
    } catch (error) {
      console.error('❌ Error saving conversations to storage:', error);
    }
  },

  loadMessagesFromStorage: async (peerUserId: string) => {
    try {
      const messages = await storageService.loadMessages(peerUserId);
      if (messages) {
        // Cập nhật RAM cache với data từ storage
        set((state: ChatStoreState) => ({
          messages: {
            ...state.messages,
            [peerUserId]: { items: messages, updatedAt: Date.now() },
          },
        }));
        return messages;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading messages from storage:', error);
      return null;
    }
  },

  saveMessagesToStorage: async (peerUserId: string, items: any[]) => {
    try {
      await storageService.saveMessages(peerUserId, items);
    } catch (error) {
      console.error('❌ Error saving messages to storage:', error);
    }
  },
})); 
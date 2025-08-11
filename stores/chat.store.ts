import { create, type GetState, type SetState } from 'zustand';

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
  clearCache: (type?: 'conversations' | 'messages', key?: string) => void; // Thêm function clear cache
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
  },
  getMessages: (peerUserId: string) => get().messages[peerUserId],
  setMessages: (peerUserId: string, items: any[]) => {
    set((state: ChatStoreState) => ({
      messages: {
        ...state.messages,
        [peerUserId]: { items, updatedAt: Date.now() },
      },
    }));
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
      } else {
        // Xóa toàn bộ cache conversations
        set({ conversations: {} });
      }
    } else if (type === 'messages') {
      if (key) {
        // Xóa cache cho messages cụ thể
        set((state: ChatStoreState) => {
          const newMessages = { ...state.messages };
          delete newMessages[key];
          return { messages: newMessages };
        });
      } else {
        // Xóa toàn bộ cache messages
        set({ messages: {} });
      }
    } else {
      // Xóa toàn bộ cache
      set({ conversations: {}, messages: {} });
    }
  },
})); 
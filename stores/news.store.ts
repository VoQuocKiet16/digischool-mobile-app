import { create, type GetState, type SetState } from 'zustand';
import storageService from '../services/storage.service';

export type NewsTab = 'news' | 'favorite';

export interface NewsCacheEntry {
  items: any[];
  updatedAt: number;
}

export interface NewsStoreState {
  cache: Record<string, NewsCacheEntry>;
  getCache: (tab: NewsTab, subjectKey: string) => NewsCacheEntry | undefined;
  setCache: (tab: NewsTab, subjectKey: string, items: any[]) => void;
  clearCache: (tab?: NewsTab, subjectKey?: string) => void;
  // Thêm methods mới cho persistent storage
  loadNewsFromStorage: (tab: NewsTab, subjectKey: string) => Promise<any[] | null>;
  saveNewsToStorage: (tab: NewsTab, subjectKey: string, items: any[]) => Promise<void>;
  addNewsToStorage: (tab: NewsTab, subjectKey: string, newsItem: any) => Promise<void>;
  updateNewsInStorage: (tab: NewsTab, subjectKey: string, newsId: string, updates: any) => Promise<void>;
  removeNewsFromStorage: (tab: NewsTab, subjectKey: string, newsId: string) => Promise<void>;
}

function buildNewsKey(tab: NewsTab, subjectKey: string): string {
  return `${tab}|${subjectKey || 'all'}`;
}

export const useNewsStore = create<NewsStoreState>((set: SetState<NewsStoreState>, get: GetState<NewsStoreState>) => ({
  cache: {},
  
  getCache: (tab: NewsTab, subjectKey: string) => {
    const key = buildNewsKey(tab, subjectKey);
    return get().cache[key];
  },
  
  setCache: (tab: NewsTab, subjectKey: string, items: any[]) => {
    const key = buildNewsKey(tab, subjectKey);
    set((state: NewsStoreState) => ({
      cache: {
        ...state.cache,
        [key]: { items, updatedAt: Date.now() },
      },
    }));
    // Tự động lưu vào persistent storage
    storageService.saveNews(tab, subjectKey, items);
  },
  
  clearCache: (tab?: NewsTab, subjectKey?: string) => {
    if (tab && subjectKey) {
      // Xóa cache cho tab và subject cụ thể
      const key = buildNewsKey(tab, subjectKey);
      set((state: NewsStoreState) => {
        const newCache = { ...state.cache };
        delete newCache[key];
        return { cache: newCache };
      });
      // Xóa khỏi persistent storage
      storageService.removeNews(tab, subjectKey, 'all'); // Xóa toàn bộ news của tab/subject này
    } else if (tab) {
      // Xóa cache cho tab cụ thể
      set((state: NewsStoreState) => {
        const newCache = { ...state.cache };
        Object.keys(newCache).forEach(key => {
          if (key.startsWith(`${tab}|`)) {
            delete newCache[key];
          }
        });
        return { cache: newCache };
      });
      // Xóa toàn bộ news của tab này khỏi persistent storage
      // Cần implement method để xóa theo pattern
    } else {
      // Xóa toàn bộ cache
      set({ cache: {} });
      // Xóa toàn bộ news khỏi persistent storage
      // Cần implement method để xóa toàn bộ news
    }
  },

  // Methods mới cho persistent storage
  loadNewsFromStorage: async (tab: NewsTab, subjectKey: string) => {
    try {
      const news = await storageService.loadNews(tab, subjectKey);
      if (news) {
        // Cập nhật RAM cache với data từ storage
        const key = buildNewsKey(tab, subjectKey);
        set((state: NewsStoreState) => ({
          cache: {
            ...state.cache,
            [key]: { items: news, updatedAt: Date.now() },
          },
        }));
        return news;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading news from storage:', error);
      return null;
    }
  },

  saveNewsToStorage: async (tab: NewsTab, subjectKey: string, items: any[]) => {
    try {
      await storageService.saveNews(tab, subjectKey, items);
    } catch (error) {
      console.error('❌ Error saving news to storage:', error);
    }
  },

  addNewsToStorage: async (tab: NewsTab, subjectKey: string, newsItem: any) => {
    try {
      await storageService.addNews(tab, subjectKey, newsItem);
      // Cập nhật RAM cache
      const key = buildNewsKey(tab, subjectKey);
      const currentCache = get().cache[key];
      if (currentCache) {
        const updatedItems = [newsItem, ...currentCache.items];
        set((state: NewsStoreState) => ({
          cache: {
            ...state.cache,
            [key]: { items: updatedItems, updatedAt: Date.now() },
          },
        }));
      }
    } catch (error) {
      console.error('❌ Error adding news to storage:', error);
    }
  },

  updateNewsInStorage: async (tab: NewsTab, subjectKey: string, newsId: string, updates: any) => {
    try {
      await storageService.updateNews(tab, subjectKey, newsId, updates);
      // Cập nhật RAM cache
      const key = buildNewsKey(tab, subjectKey);
      const currentCache = get().cache[key];
      if (currentCache) {
        const updatedItems = currentCache.items.map(item => 
          item._id === newsId ? { ...item, ...updates } : item
        );
        set((state: NewsStoreState) => ({
          cache: {
            ...state.cache,
            [key]: { items: updatedItems, updatedAt: Date.now() },
          },
        }));
      }
    } catch (error) {
      console.error('❌ Error updating news in storage:', error);
    }
  },

  removeNewsFromStorage: async (tab: NewsTab, subjectKey: string, newsId: string) => {
    try {
      await storageService.removeNews(tab, subjectKey, newsId);
      // Cập nhật RAM cache
      const key = buildNewsKey(tab, subjectKey);
      const currentCache = get().cache[key];
      if (currentCache) {
        const updatedItems = currentCache.items.filter(item => item._id !== newsId);
        set((state: NewsStoreState) => ({
          cache: {
            ...state.cache,
            [key]: { items: updatedItems, updatedAt: Date.now() },
          },
        }));
      }
    } catch (error) {
      console.error('❌ Error removing news from storage:', error);
    }
  },
})); 
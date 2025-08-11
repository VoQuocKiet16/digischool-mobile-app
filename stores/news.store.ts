import { create, type GetState, type SetState } from 'zustand';

export type NewsTab = 'news' | 'favorite';

export interface NewsCacheEntry {
  items: any[];
  updatedAt: number;
}

export interface NewsStoreState {
  cache: Record<string, NewsCacheEntry>;
  getCache: (tab: NewsTab, subjectKey: string) => NewsCacheEntry | undefined;
  setCache: (tab: NewsTab, subjectKey: string, items: any[]) => void;
  clearCache: (tab?: NewsTab, subjectKey?: string) => void; // Thêm function clear cache
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
    } else {
      // Xóa toàn bộ cache
      set({ cache: {} });
    }
  },
})); 
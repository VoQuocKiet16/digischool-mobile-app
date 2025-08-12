import { useNewsStore } from '../stores/news.store';

export const useNewsState = () => {
  const {
    cache,
    getCache,
    setCache,
    clearCache,
    loadNewsFromStorage,
    saveNewsToStorage,
    addNewsToStorage,
    updateNewsInStorage,
    removeNewsFromStorage,
  } = useNewsStore();

  return {
    // Cache methods
    cache,
    getCache,
    setCache,
    clearCache,
    
    // Persistent storage methods
    loadNewsFromStorage,
    saveNewsToStorage,
    addNewsToStorage,
    updateNewsInStorage,
    removeNewsFromStorage,
    
    // Helper methods
    isNewsCached: (tab: 'news' | 'favorite', subjectKey: string) => {
      const cached = getCache(tab, subjectKey);
      return cached && cached.items && cached.items.length > 0;
    },
    
    getNewsFromCache: (tab: 'news' | 'favorite', subjectKey: string) => {
      const cached = getCache(tab, subjectKey);
      return cached?.items || [];
    },
    
    isCacheFresh: (tab: 'news' | 'favorite', subjectKey: string, staleTimeMs: number = 10 * 60 * 1000) => {
      const cached = getCache(tab, subjectKey);
      return cached && Date.now() - cached.updatedAt < staleTimeMs;
    },
    
    // Utility methods
    clearAllNewsCache: () => clearCache(),
    clearNewsCacheByTab: (tab: 'news' | 'favorite') => clearCache(tab),
    clearNewsCacheBySubject: (tab: 'news' | 'favorite', subjectKey: string) => clearCache(tab, subjectKey),
  };
}; 
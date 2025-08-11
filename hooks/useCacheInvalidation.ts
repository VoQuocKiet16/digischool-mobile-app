import { useCallback } from 'react';
import { invalidateAllCache, invalidateChatCache, invalidateNewsCache, invalidateScheduleCache } from '../utils/cache.utils';

/**
 * Hook để sử dụng cache invalidation trong components
 */
export const useCacheInvalidation = () => {
  const invalidateNews = useCallback((tab?: 'news' | 'favorite', subjectKey?: string) => {
    invalidateNewsCache(tab, subjectKey);
  }, []);

  const invalidateSchedule = useCallback((key?: string) => {
    invalidateScheduleCache(key);
  }, []);

  const invalidateChat = useCallback((type?: 'conversations' | 'messages', key?: string) => {
    invalidateChatCache(type, key);
  }, []);

  const invalidateAll = useCallback(() => {
    invalidateAllCache();
  }, []);

  return {
    invalidateNews,
    invalidateSchedule,
    invalidateChat,
    invalidateAll,
  };
}; 
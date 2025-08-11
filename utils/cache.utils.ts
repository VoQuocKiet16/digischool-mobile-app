import { useChatStore } from '../stores/chat.store';
import { useNewsStore } from '../stores/news.store';
import { useScheduleStore } from '../stores/schedule.store';

/**
 * Utility functions để quản lý cache invalidation
 */

// Invalidate cache cho News
export const invalidateNewsCache = (tab?: 'news' | 'favorite', subjectKey?: string) => {
  const clearCache = useNewsStore.getState().clearCache;
  clearCache(tab, subjectKey);
};

// Invalidate cache cho Schedule
export const invalidateScheduleCache = (key?: string) => {
  const clearCache = useScheduleStore.getState().clearCache;
  clearCache(key);
};

// Invalidate cache cho Chat
export const invalidateChatCache = (type?: 'conversations' | 'messages', key?: string) => {
  const clearCache = useChatStore.getState().clearCache;
  clearCache(type, key);
};

// Invalidate tất cả cache
export const invalidateAllCache = () => {
  invalidateNewsCache();
  invalidateScheduleCache();
  invalidateChatCache();
};

// Invalidate cache khi có thay đổi từ API
export const invalidateCacheOnApiChange = (type: 'news' | 'schedule' | 'chat', details?: any) => {
  switch (type) {
    case 'news':
      // Khi có tin tức mới, xóa cache của tab news
      invalidateNewsCache('news');
      break;
    case 'schedule':
      // Khi có thay đổi lịch học, xóa cache schedule
      if (details?.academicYear && details?.weekNumber) {
        // Xóa cache cho tuần cụ thể nếu có
        const key = `${details.role || 'student'}|${details.userKey || ''}|${details.academicYear}|${details.weekNumber}`;
        invalidateScheduleCache(key);
      } else {
        // Xóa toàn bộ cache schedule
        invalidateScheduleCache();
      }
      break;
    case 'chat':
      // Khi có tin nhắn mới, xóa cache conversations
      if (details?.userId) {
        invalidateChatCache('conversations', details.userId);
      } else {
        invalidateChatCache('conversations');
      }
      break;
  }
}; 
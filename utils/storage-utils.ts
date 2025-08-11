import storageService from '../services/storage.service';

export const getStorageInfo = async () => {
  try {
    return await storageService.getStorageInfo();
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { conversations: 0, messages: 0, news: 0 };
  }
};

export const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const clearAllChatData = async () => {
  try {
    await storageService.clearAllData();
    console.log('✅ Cleared all chat and news data');
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    throw error;
  }
};

export const clearUserChatData = async (userId: string) => {
  try {
    await storageService.clearUserData(userId);
    console.log(`✅ Cleared data for user ${userId}`);
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  }
};

export const exportChatData = async (userId: string) => {
  try {
    const conversations = await storageService.loadConversations(userId);
    const messages: any[] = [];
    
    if (conversations) {
      for (const conv of conversations) {
        const convMessages = await storageService.loadMessages(conv.userId || conv.id);
        if (convMessages) {
          messages.push(...convMessages);
        }
      }
    }

    return {
      conversations: conversations || [],
      messages,
      exportDate: new Date().toISOString(),
      userId
    };
  } catch (error) {
    console.error('❌ Error exporting chat data:', error);
    throw error;
  }
};

// Thêm functions mới cho news
export const clearNewsData = async (tab?: string, subjectKey?: string) => {
  try {
    if (tab && subjectKey) {
      // Xóa news cụ thể
      await storageService.removeNews(tab, subjectKey, 'all');
      console.log(`✅ Cleared news data for ${tab}/${subjectKey}`);
    } else {
      // Xóa toàn bộ news
      const keys = await storageService.getStorageInfo();
      console.log(`✅ Cleared all news data (${keys.news} items)`);
    }
  } catch (error) {
    console.error('❌ Error clearing news data:', error);
    throw error;
  }
};

export const exportNewsData = async (tab?: string, subjectKey?: string) => {
  try {
    if (tab && subjectKey) {
      const news = await storageService.loadNews(tab, subjectKey);
      return {
        tab,
        subjectKey,
        news: news || [],
        exportDate: new Date().toISOString()
      };
    } else {
      // Export toàn bộ news
      const allNews: any[] = [];
      const tabs = ['news', 'favorite'];
      const subjects = ['all']; // Có thể mở rộng thêm subjects khác
      
      for (const tab of tabs) {
        for (const subject of subjects) {
          const news = await storageService.loadNews(tab, subject);
          if (news && news.length > 0) {
            allNews.push(...news.map(item => ({ ...item, tab, subject })));
          }
        }
      }
      
      return {
        allNews,
        exportDate: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('❌ Error exporting news data:', error);
    throw error;
  }
};
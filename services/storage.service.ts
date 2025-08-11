import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoredConversation {
  userId: string;
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageType: string;
  lastMessageSender: string;
  lastMessageFromId: string;
  unreadCount: number;
  updatedAt: number;
}

export interface StoredMessage {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  time: string;
  createdAt: string;
  mediaUrl: string;
  updatedAt: number;
}

// Thêm interface cho News
export interface StoredNews {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  subject: string;
  hashtag: string;
  createdBy: { name: string };
  createdAt: string;
  favorites: string[];
  updatedAt: number;
}

class StorageService {
  private static instance: StorageService;
  
  private constructor() {}
  
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Conversations Storage
  async saveConversations(userId: string, conversations: any[]): Promise<void> {
    try {
      const key = `conversations_${userId}`;
      const data: StoredConversation[] = conversations.map(conv => ({
        ...conv,
        updatedAt: Date.now()
      }));
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Saved ${conversations.length} conversations for user ${userId}`);
    } catch (error) {
      console.error('❌ Error saving conversations:', error);
    }
  }

  async loadConversations(userId: string): Promise<StoredConversation[] | null> {
    try {
      const key = `conversations_${userId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const conversations = JSON.parse(data);
        console.log(`📱 Loaded ${conversations.length} conversations from storage for user ${userId}`);
        return conversations;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      return null;
    }
  }

  async updateConversation(userId: string, conversationId: string, updates: Partial<StoredConversation>): Promise<void> {
    try {
      const conversations = await this.loadConversations(userId);
      if (conversations) {
        const updatedConversations = conversations.map(conv => 
          (conv.userId === conversationId || conv.id === conversationId) 
            ? { ...conv, ...updates, updatedAt: Date.now() }
            : conv
        );
        await this.saveConversations(userId, updatedConversations);
      }
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
    }
  }

  // Messages Storage
  async saveMessages(peerUserId: string, messages: any[]): Promise<void> {
    try {
      const key = `messages_${peerUserId}`;
      const data: StoredMessage[] = messages.map(msg => ({
        ...msg,
        updatedAt: Date.now()
      }));
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Saved ${messages.length} messages for peer ${peerUserId}`);
    } catch (error) {
      console.error('❌ Error saving messages:', error);
    }
  }

  async loadMessages(peerUserId: string): Promise<StoredMessage[] | null> {
    try {
      const key = `messages_${peerUserId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const messages = JSON.parse(data);
        console.log(`📱 Loaded ${messages.length} messages from storage for peer ${peerUserId}`);
        return messages;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      return null;
    }
  }

  async addMessage(peerUserId: string, message: any): Promise<void> {
    try {
      const messages = await this.loadMessages(peerUserId) || [];
      const newMessage: StoredMessage = {
        ...message,
        updatedAt: Date.now()
      };
      messages.push(newMessage);
      await this.saveMessages(peerUserId, messages);
    } catch (error) {
      console.error('❌ Error adding message:', error);
    }
  }

  // News Storage - Thêm methods mới
  async saveNews(tab: string, subjectKey: string, news: any[]): Promise<void> {
    try {
      const key = `news_${tab}_${subjectKey}`;
      const data: StoredNews[] = news.map(item => ({
        ...item,
        updatedAt: Date.now()
      }));
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Saved ${news.length} news for ${tab}/${subjectKey}`);
    } catch (error) {
      console.error('❌ Error saving news:', error);
    }
  }

  async loadNews(tab: string, subjectKey: string): Promise<StoredNews[] | null> {
    try {
      const key = `news_${tab}_${subjectKey}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const news = JSON.parse(data);
        console.log(`📱 Loaded ${news.length} news from storage for ${tab}/${subjectKey}`);
        return news;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading news:', error);
      return null;
    }
  }

  async updateNews(tab: string, subjectKey: string, newsId: string, updates: Partial<StoredNews>): Promise<void> {
    try {
      const news = await this.loadNews(tab, subjectKey);
      if (news) {
        const updatedNews = news.map(item => 
          item._id === newsId 
            ? { ...item, ...updates, updatedAt: Date.now() }
            : item
        );
        await this.saveNews(tab, subjectKey, updatedNews);
      }
    } catch (error) {
      console.error('❌ Error updating news:', error);
    }
  }

  async addNews(tab: string, subjectKey: string, newsItem: any): Promise<void> {
    try {
      const news = await this.loadNews(tab, subjectKey) || [];
      const newNews: StoredNews = {
        ...newsItem,
        updatedAt: Date.now()
      };
      news.unshift(newNews); // Thêm vào đầu danh sách
      await this.saveNews(tab, subjectKey, news);
    } catch (error) {
      console.error('❌ Error adding news:', error);
    }
  }

  async removeNews(tab: string, subjectKey: string, newsId: string): Promise<void> {
    try {
      const news = await this.loadNews(tab, subjectKey);
      if (news) {
        const filteredNews = news.filter(item => item._id !== newsId);
        await this.saveNews(tab, subjectKey, filteredNews);
      }
    } catch (error) {
      console.error('❌ Error removing news:', error);
    }
  }

  // Clear Storage
  async clearUserData(userId: string): Promise<void> {
    try {
      const keys = [
        `conversations_${userId}`,
        `messages_${userId}`
      ];
      await AsyncStorage.multiRemove(keys);
      console.log(`🗑️ Cleared storage for user ${userId}`);
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter(key => 
        key.startsWith('conversations_') || key.startsWith('messages_') || key.startsWith('news_')
      );
      await AsyncStorage.multiRemove(chatKeys);
      console.log('🗑️ Cleared all chat and news data');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
    }
  }

  // Get Storage Info
  async getStorageInfo(): Promise<{ conversations: number; messages: number; news: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const conversationKeys = keys.filter(key => key.startsWith('conversations_'));
      const messageKeys = keys.filter(key => key.startsWith('messages_'));
      const newsKeys = keys.filter(key => key.startsWith('news_'));
      
      let totalMessages = 0;
      for (const key of messageKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const messages = JSON.parse(data);
          totalMessages += messages.length;
        }
      }

      let totalNews = 0;
      for (const key of newsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const news = JSON.parse(data);
          totalNews += news.length;
        }
      }

      return {
        conversations: conversationKeys.length,
        messages: totalMessages,
        news: totalNews
      };
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return { conversations: 0, messages: 0, news: 0 };
    }
  }
}

export default StorageService.getInstance(); 
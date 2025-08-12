import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { clearAllChatData, clearUserChatData, getStorageInfo } from '../utils/storage-utils';

interface StorageInfoProps {
  userId?: string;
}

export default function StorageInfo({ userId }: StorageInfoProps) {
  const [storageInfo, setStorageInfo] = useState<{ conversations: number; messages: number; news: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Xóa tất cả dữ liệu',
      'Bạn có chắc chắn muốn xóa tất cả dữ liệu chat và tin tức? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await clearAllChatData();
              await loadStorageInfo();
              Alert.alert('Thành công', 'Đã xóa tất cả dữ liệu');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa dữ liệu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearUserData = () => {
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID người dùng');
      return;
    }

    Alert.alert(
      'Xóa dữ liệu người dùng',
      `Bạn có chắc chắn muốn xóa tất cả dữ liệu chat của người dùng này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await clearUserChatData(userId);
              await loadStorageInfo();
              Alert.alert('Thành công', 'Đã xóa dữ liệu người dùng');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa dữ liệu người dùng');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    loadStorageInfo();
  };

  if (!storageInfo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#29375C" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={24} color="#29375C" />
        <Text style={styles.title}>Thông tin lưu trữ</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="chatbubbles" size={20} color="#666" />
          <Text style={styles.infoLabel}>Cuộc trò chuyện:</Text>
          <Text style={styles.infoValue}>{storageInfo.conversations}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color="#666" />
          <Text style={styles.infoLabel}>Tin nhắn:</Text>
          <Text style={styles.infoValue}>{storageInfo.messages}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="newspaper" size={20} color="#666" />
          <Text style={styles.infoLabel}>Tin tức:</Text>
          <Text style={styles.infoValue}>{storageInfo.news}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={handleRefresh}
          disabled={loading}
        >
          <Ionicons name="refresh" size={16} color="#29375C" />
          <Text style={styles.refreshButtonText}>Làm mới</Text>
        </TouchableOpacity>

        {userId && (
          <TouchableOpacity
            style={[styles.button, styles.clearUserButton]}
            onPress={handleClearUserData}
            disabled={loading}
          >
            <Ionicons name="person-remove" size={16} color="#dc3545" />
            <Text style={styles.clearUserButtonText}>Xóa dữ liệu người dùng</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.clearAllButton]}
          onPress={handleClearAllData}
          disabled={loading}
        >
          <Ionicons name="trash" size={16} color="#dc3545" />
          <Text style={styles.clearAllButtonText}>Xóa tất cả dữ liệu</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#29375C" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#29375C',
    marginLeft: 8,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#29375C',
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  refreshButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#29375C',
  },
  refreshButtonText: {
    color: '#29375C',
    fontWeight: '500',
    marginLeft: 8,
  },
  clearUserButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#dc3545',
  },
  clearUserButtonText: {
    color: '#dc3545',
    fontWeight: '500',
    marginLeft: 8,
  },
  clearAllButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#dc3545',
  },
  clearAllButtonText: {
    color: '#dc3545',
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
}); 
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';
import PlusIcon from '../../components/PlusIcon';
import { getMyNews } from '../../services/news.service';

export default function ManageNewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      const res = await getMyNews();
      if (res.success) {
        setNews(res.data || []);
      } else {
        setError(res.message || 'Lỗi không xác định');
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <HeaderLayout
      title="Danh sách tin đăng"
      subtitle="Tin đăng của giáo viên"
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#25345D" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: 'red', marginTop: 40 }}>{error}</Text>
        ) : (
          <FlatList
            data={news}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/news/edit_news?id=${item._id}`)} activeOpacity={0.8}>
                <View style={styles.card}>
                  <Image source={{ uri: item.coverImage }} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <Ionicons name="pin" size={20} color="#25345D" style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.content?.replace(/<[^>]+>/g, '')}</Text>
                    <View style={styles.cardFooter}>
                      <Ionicons name="time-outline" size={16} color="#7D88A7" style={{ marginRight: 4 }} />
                      <Text style={styles.cardTime}>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        <View style={styles.plusWrap}>
          <PlusIcon text="Thêm tin tức" onPress={() => router.push('/news/add_news')} />
        </View>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    paddingTop: 0,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#25345D',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 18,
    width: 320,
    alignSelf: 'center',
    padding: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#25345D',
    flex: 1,
  },
  cardDesc: {
    color: '#7D88A7',
    fontSize: 14,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTime: {
    color: '#7D88A7',
    fontSize: 13,
  },
  plusWrap: {
    marginTop: 8,
    marginBottom: 30,
    alignItems: 'flex-start',
    width: '90%',
  },
});

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SUBJECTS = [
  { key: 'all', label: 'Tất cả', icon: require('../../assets/images/all.png') },
  { key: 'math', label: 'Toán', icon: require('../../assets/images/math.png') },
  { key: 'history', label: 'Lịch sử', icon: require('../../assets/images/history.png') },
  { key: 'geography', label: 'Địa lý', icon: require('../../assets/images/geography.png') },
  { key: 'chemistry', label: 'Hóa', icon: require('../../assets/images/chemistry.png') },
  // Thêm các môn khác nếu cần
];

const NEWS = [
  {
    id: '1',
    title: 'Bí kíp chinh phục phương trình bậc hai',
    subject: 'Toán',
    subjectKey: 'math',
    time: '4 giờ trước',
    views: 54,
    author: 'Thầy Trưng',
    hashtag: '#phuongtrinh',
    image: { uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80' },
    bookmarked: false,
  },
  {
    id: '2',
    title: 'Khám phá bảng tuần hoàn hóa học',
    subject: 'Hóa',
    subjectKey: 'chemistry',
    time: '2 giờ trước',
    views: 32,
    author: 'Cô Lan',
    hashtag: '#hoahoc',
    image: { uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
    bookmarked: false,
  },
  {
    id: '3',
    title: 'Địa lý thế giới: Những điều thú vị',
    subject: 'Địa lý',
    subjectKey: 'geography',
    time: '1 ngày trước',
    views: 21,
    author: 'Thầy Sơn',
    hashtag: '#dialy',
    image: { uri: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80' },
    bookmarked: false,
  },
  {
    id: '4',
    title: 'Lịch sử Việt Nam qua các thời kỳ',
    subject: 'Lịch sử',
    subjectKey: 'history',
    time: '3 ngày trước',
    views: 45,
    author: 'Cô Hạnh',
    hashtag: '#lichsu',
    image: { uri: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80' },
    bookmarked: false,
  },
  // Thêm các tin khác nếu muốn
];

export default function NewsFeedScreen() {
  const [tab, setTab] = useState<'news' | 'favorite'>('news');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [newsList, setNewsList] = useState(NEWS);

  const filteredNews = selectedSubject === 'all'
    ? newsList
    : newsList.filter(n => n.subjectKey === selectedSubject);

  const displayedNews = tab === 'favorite'
    ? filteredNews.filter(n => n.bookmarked)
    : filteredNews;

  const handleToggleBookmark = (id: string) => {
    setNewsList(prev => prev.map(n => n.id === id ? { ...n, bookmarked: !n.bookmarked } : n));
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'news' && styles.tabBtnActive]}
          onPress={() => setTab('news')}
        >
          <Text style={[styles.tabText, tab === 'news' && styles.tabTextActive]}>Tin tức</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'favorite' && styles.tabBtnActive]}
          onPress={() => setTab('favorite')}
        >
          <Text style={[styles.tabText, tab === 'favorite' && styles.tabTextActive]}>Yêu thích</Text>
        </TouchableOpacity>
      </View>

      {/* Subject filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll} contentContainerStyle={{paddingBottom: 0, marginBottom: 0}}>
        {SUBJECTS.map((s, idx) => (
          <TouchableOpacity
            key={s.key}
            style={styles.subjectItem}
            onPress={() => setSelectedSubject(s.key)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.subjectIconWrap,
              selectedSubject === s.key && styles.subjectIconActive
            ]}>
              <Image source={s.icon} style={styles.subjectIcon} resizeMode="contain" />
            </View>
            <Text style={[
              styles.subjectLabel,
              selectedSubject === s.key && styles.subjectLabelActive
            ]}>{s.label}</Text>
            {selectedSubject === s.key && <View style={styles.subjectUnderline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News list */}
      <FlatList
        data={displayedNews}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 0,
          paddingTop: -8,
          paddingBottom: 80,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={340}
        renderItem={({ item }) => (
          <View style={styles.newsCard}>
            <Image source={item.image} style={styles.newsImage} />
            <View style={styles.overlay} />
            <TouchableOpacity style={styles.bookmarkBtn} onPress={() => handleToggleBookmark(item.id)}>
              <Ionicons name={item.bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.newsInfoRow}>
                <Image source={SUBJECTS.find(s => s.key === item.subjectKey)?.icon} style={styles.newsSubjectIcon} />
                <Text style={styles.newsInfoText}>{item.subject}</Text>
                <Text style={styles.newsInfoText}>• {item.time}</Text>
                <Text style={styles.newsInfoText}>• {item.views} người xem</Text>
              </View>
              <View style={styles.newsInfoRow}>
                <Text style={styles.newsAuthor}>{item.author}</Text>
                <Text style={styles.newsHashtag}>{item.hashtag}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB' },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#E6E9F0',
    borderRadius: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#25345D',
  },
  tabText: {
    color: '#25345D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
  },
  subjectScroll: {
    paddingVertical: 8,
    paddingLeft: 8,
    marginBottom: 8,
  },
  subjectItem: {
    alignItems: 'center',
    marginRight: 18,
    minWidth: 56,
  },
  subjectIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subjectIconActive: {
    borderColor: '#25345D',
    backgroundColor: '#E6E9F0',
  },
  subjectIcon: {
    width: 32,
    height: 32,
  },
  subjectLabel: {
    fontSize: 13,
    color: '#25345D',
    fontWeight: '500',
    marginBottom: 2,
  },
  subjectLabelActive: {
    color: '#25345D',
    fontWeight: 'bold',
  },
  subjectUnderline: {
    width: 24,
    height: 3,
    backgroundColor: '#25345D',
    borderRadius: 2,
    marginTop: 2,
  },
  newsCard: {
    width: 320,
    height: 420,
    backgroundColor: '#fff',
    borderRadius: 28,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37,52,93,0.25)',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(37,52,93,0.7)',
    borderRadius: 16,
    padding: 4,
    zIndex: 2,
  },
  newsContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
  },
  newsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  newsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  newsSubjectIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  newsInfoText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 8,
  },
  newsAuthor: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  newsHashtag: {
    color: '#fff',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
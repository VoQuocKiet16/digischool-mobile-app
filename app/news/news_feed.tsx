import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [tab, setTab] = useState<'news' | 'favorite'>('news');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [newsList, setNewsList] = useState(NEWS);
  const role = 'teacher'; // hoặc 'student'
  const router = useRouter();

  // Responsive calculations
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const isLargeScreen = screenWidth >= 768;
  const isTablet = screenWidth >= 768;

  // Dynamic card dimensions
  // Dynamic card dimensions
  const cardWidth = isTablet ? Math.min(400, screenWidth * 0.4) : Math.min(320, screenWidth * 0.85);
  const cardHeight = isTablet ? 420 : 360;
  const cardMargin = isTablet ? 16 : 20;

  // Dynamic font sizes
  const titleFontSize = isSmallScreen ? 16 : isMediumScreen ? 18 : 20;
  const tabFontSize = isSmallScreen ? 14 : 16;
  const subjectLabelFontSize = isSmallScreen ? 11 : 13;
  const infoFontSize = isSmallScreen ? 10 : 12;

  // Dynamic spacing
  const containerPadding = isTablet ? 24 : 16;
  const tabSpacing = isSmallScreen ? 4 : 8;
  const subjectSpacing = isSmallScreen ? 12 : 18;

  const [showMenu, setShowMenu] = useState(false);

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
    <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
      {/* Tabs */}
      <View style={[styles.tabRow, { gap: tabSpacing, alignItems: 'center' }]}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'news' && styles.tabBtnActive]}
          onPress={() => setTab('news')}
        >
          <Text style={[styles.tabText, tab === 'news' && styles.tabTextActive, { fontSize: tabFontSize }]}>Tin tức</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'favorite' && styles.tabBtnActive]}
          onPress={() => setTab('favorite')}
        >
          <Text style={[styles.tabText, tab === 'favorite' && styles.tabTextActive, { fontSize: tabFontSize }]}>Yêu thích</Text>
        </TouchableOpacity>
        {role === 'teacher' && (
          <View style={{ marginLeft: 8 }}>
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={{ padding: 6 }}>
              <Ionicons name="menu" size={28} color="#25345D" />
            </TouchableOpacity>
            {showMenu && (
              <View style={styles.menuPopup}>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => {
                    setShowMenu(false);
                    router.push('/news/add_news');
                  }}
                >
                  <Text style={styles.menuItemText}>Thêm tin tức</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setShowMenu(false);
                  router.push('/news/manage_news');
                }}>
                  <Text style={styles.menuItemText}>Quản lý tin tức</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Subject filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.subjectScroll} 
        contentContainerStyle={{paddingBottom: 0, marginBottom: 0}}
      >
        {SUBJECTS.map((s, idx) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.subjectItem, { marginRight: subjectSpacing, minWidth: isSmallScreen ? 48 : 56 }]}
            onPress={() => setSelectedSubject(s.key)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.subjectIconWrap,
              selectedSubject === s.key && styles.subjectIconActive,
              { 
                width: isSmallScreen ? 40 : 48, 
                height: isSmallScreen ? 40 : 48,
                borderRadius: isSmallScreen ? 20 : 24
              }
            ]}>
              <Image 
                source={s.icon} 
                style={[styles.subjectIcon, { 
                  width: isSmallScreen ? 26 : 32, 
                  height: isSmallScreen ? 26 : 32 
                }]} 
                resizeMode="contain" 
              />
            </View>
            <Text style={[
              styles.subjectLabel,
              selectedSubject === s.key && styles.subjectLabelActive,
              { fontSize: subjectLabelFontSize }
            ]}>{s.label}</Text>
            {selectedSubject === s.key && <View style={[styles.subjectUnderline, { width: isSmallScreen ? 20 : 24 }]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News list */}
      <FlatList
        data={displayedNews}
        keyExtractor={item => item.id}
        horizontal={!isTablet}
        numColumns={isTablet ? 2 : 1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 0,
          paddingTop: 0,
          paddingBottom: 80,
          justifyContent: 'center',
          alignItems: 'center',
          ...(isTablet && { paddingHorizontal: 16 })
        }}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={cardWidth + cardMargin * 2}
        renderItem={({ item }) => (
          <View style={[
            styles.newsCard,
            {
              width: cardWidth,
              height: cardHeight,
              marginHorizontal: cardMargin,
              marginBottom: isTablet ? 16 : 0
            }
          ]}>
            <Image source={item.image} style={styles.newsImage} />
            <View style={styles.overlay} />
            <TouchableOpacity style={styles.bookmarkBtn} onPress={() => handleToggleBookmark(item.id)}>
              <Ionicons name={item.bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.newsContent}>
              <Text style={[styles.newsTitle, { fontSize: titleFontSize }]} numberOfLines={2}>{item.title}</Text>
              <View style={styles.newsInfoRow}>
                <Image 
                  source={SUBJECTS.find(s => s.key === item.subjectKey)?.icon} 
                  style={[styles.newsSubjectIcon, { 
                    width: isSmallScreen ? 16 : 18, 
                    height: isSmallScreen ? 16 : 18 
                  }]} 
                />
                <Text style={[styles.newsInfoText, { fontSize: infoFontSize }]}>{item.subject}</Text>
                <Text style={[styles.newsInfoText, { fontSize: infoFontSize }]}>• {item.time}</Text>
                <Text style={[styles.newsInfoText, { fontSize: infoFontSize }]}>• {item.views} người xem</Text>
              </View>
              <View style={styles.newsInfoRow}>
                <Text style={[styles.newsAuthor, { fontSize: infoFontSize }]}>{item.author}</Text>
                <Text style={[styles.newsHashtag, { fontSize: infoFontSize }]}>{item.hashtag}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 28,
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
  menuPopup: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#25345D',
    borderRadius: 10,
    paddingVertical: 4,
    width: 160,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  menuItemText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },

});
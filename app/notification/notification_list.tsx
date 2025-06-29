import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';

const TABS = [
  { key: 'user', label: 'Người dùng' },
  { key: 'activity', label: 'Hoạt động' },
  { key: 'system', label: 'Hệ thống' },
];

const NOTIFICATIONS = [
  {
    id: '1',
    avatar: require('../../assets/images/teacher.png'),
    name: '[GV] Nguyen Van A',
    time: '2 ngày trước',
    content: 'Các em tập trung ôn tập, 26/6 thi tốt nghiệp nhé!',
  },
  {
    id: '2',
    avatar: require('../../assets/images/teacher.png'),
    name: '[GV] Nguyen Van A',
    time: '2 ngày trước',
    content: 'Các em tập trung ôn tập, 26/6 thi tốt nghiệp nhé!',
  },
  {
    id: '3',
    avatar: require('../../assets/images/teacher.png'),
    name: '[GV] Nguyen Van A',
    time: '2 ngày trước',
    content: 'Các em tập trung ôn tập, 26/6 thi tốt nghiệp nhé!',
  },
  {
    id: '4',
    avatar: require('../../assets/images/teacher.png'),
    name: '[GV] Nguyen Van A',
    time: '2 ngày trước',
    content: 'Các em tập trung ôn tập, 26/6 thi tốt nghiệp nhé!',
  },
  {
    id: '5',
    avatar: require('../../assets/images/teacher.png'),
    name: '[GV] Nguyen Van A',
    time: '2 ngày trước',
    content: 'Các em tập trung ôn tập, 26/6 thi tốt nghiệp nhé!',
  },
];

export default function NotificationListScreen() {
  const [tab, setTab] = useState('user');
  const [search, setSearch] = useState('');
  const router = useRouter();

  return (
    <HeaderLayout title="Thông báo" onBack={() => router.back()}>
      <View style={styles.tabsRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#A0A0A0" style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm thông báo..."
            placeholderTextColor="#A0A0A0"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#25345D" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        style={{ marginTop: 8 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push('/notification/notification_detail')}>
            <View style={styles.notiItem}>
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.notiContent}>
                <View style={styles.notiHeader}>
                  <Text style={styles.notiName}>{item.name}</Text>
                  <Text style={styles.notiTime}>{item.time}</Text>
                </View>
                <Text style={styles.notiText}>{item.content}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#25345D',
  },
  tabText: {
    color: '#25345D',
    fontWeight: 'bold',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6FA',
    borderRadius: 12,
    height: 40,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#25345D',
    marginLeft: 8,
    fontWeight: '500',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    marginTop: 2,
  },
  notiContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  notiName: {
    fontWeight: 'bold',
    color: '#25345D',
    fontSize: 15,
    flex: 1,
  },
  notiTime: {
    color: '#A0A0A0',
    fontSize: 13,
    marginLeft: 8,
  },
  notiText: {
    color: '#7D88A7',
    fontSize: 14,
    marginTop: 2,
  },
});

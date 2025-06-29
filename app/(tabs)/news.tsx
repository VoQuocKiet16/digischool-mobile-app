import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Header from '../../components/Header';
import NewsFeedScreen from '../news/news_feed';

export default function NewsScreen() {
  const [userName, setUserName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('role'),
      AsyncStorage.getItem('userName'),
    ]).then(([roleStr, name]) => {
      if (roleStr) setRoles(JSON.parse(roleStr));
      if (name) setUserName(name);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  if (roles.includes('teacher')) {
    // UI cho giáo viên
    return (
      <View style={styles.container}>
        <Header
          title="Tin tức"
          studentName={userName ? `GV ${userName}` : 'GV Nguyễn Văn A'}
        />
        {/* TODO: Thay bằng component news cho giáo viên nếu có */}
        <NewsFeedScreen />
      </View>
    );
  }

  if (roles.includes('manager')) {
    // UI cho manager
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  // UI cho học sinh
  return (
    <View style={styles.container}>
      <Header
        title="Tin tức"
        studentName={userName ? `HS ${userName}` : 'HS Nguyễn Văn A'}
      />
      <NewsFeedScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

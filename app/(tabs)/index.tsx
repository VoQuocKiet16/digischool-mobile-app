import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Header from '../../components/Header';
import ScheduleStudentsScreen from '../students/schedule/schedule';

export default function HomeScreen() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('role'),
      AsyncStorage.getItem('userName')
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
    // UI cho teacher (hiện tại là loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  if (roles.includes('manager')) {
    // UI cho manager (hiện tại là loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  // UI cho student
  return (
    <View style={styles.container}>
      <Header title="Trang chủ" studentName={userName ? `HS ${userName}` : 'HS Nguyễn Văn A'} />
      <ScheduleStudentsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Header from '../../components/Header';
import ScheduleScreen from '../students/schedule/schedule';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header title="Trang chủ" studentName="HS Nguyễn Văn A" />
      <ScheduleScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

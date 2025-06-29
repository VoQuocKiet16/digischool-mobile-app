import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';
import { useRouter } from 'expo-router';

export default function NotificationDetailScreen() {
const router = useRouter();
  return (
    <HeaderLayout title="Chi tiết thông báo" onBack={() => router.back()}>
      <View style={styles.contentWrap}>
        <Text style={styles.title}>Thông báo nghỉ tiết</Text>
        <Text style={styles.body}>
          Thầy xin thông báo tiết học [môn học] vào [thời gian, ngày] sẽ được nghỉ do [lý do, ví dụ: thầy/cô có việc đột xuất, lịch điều chỉnh của nhà trường]. Các em vui lòng theo dõi lịch học mới hoặc thông báo tiếp theo để cập nhật.
        </Text>
        <View style={{ height: 24 }} />
        <Text style={styles.sender}>[GV] Nguyen Van A</Text>
        <Text style={styles.time}>7 phút trước</Text>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  contentWrap: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#25345D',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
    marginBottom: 18,
  },
  sender: {
    fontWeight: 'bold',
    color: '#25345D',
    fontSize: 15,
    marginBottom: 6,
  },
  time: {
    color: '#A0A0A0',
    fontSize: 15,
    fontWeight: '500',
  },
});

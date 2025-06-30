import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import HeaderLayout from '../../components/layout/HeaderLayout';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const title = params.title || '';
  const content = params.content || '<p>Không có nội dung</p>';

  return (
    <HeaderLayout title="Chi tiết thông báo" onBack={() => router.back()}>
      <View style={styles.contentWrap}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <WebView
          originWhitelist={["*"]}
          source={{ html: content as string }}
          style={styles.webview}
          scrollEnabled={false}
        />
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
  webview: {
    width: '100%',
    minHeight: 120,
    maxHeight: 300,
    backgroundColor: 'transparent',
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

import { registerDeviceToken } from '@/services/push_token.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

async function requestUserPermission() {
  const messagingInstance = getMessaging();
  const authStatus = await requestPermission(messagingInstance);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    Alert.alert('Quyền nhận thông báo bị từ chối');
    return false;
  }
  return true;
}

async function fetchAndRegisterFcmToken() {
  try {
    const messagingInstance = getMessaging();
    const token = await getToken(messagingInstance);
    if (token) {
      console.log('FCM Token:', token);
      const [userId, authToken] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('token'),
      ]);
      if (userId && authToken) {
        await registerDeviceToken({ userId, fcmToken: token, platform: Platform.OS as 'android' | 'ios' }, authToken);
      }
    } else {
      console.log('Không lấy được FCM token');
    }
  } catch (error) {
    console.error('Lỗi lấy/đăng ký FCM token:', error);
  }
}

export function useFirebaseMessaging() {
  useEffect(() => {
    (async () => {
      const granted = await requestUserPermission();
      if (granted) {
        await fetchAndRegisterFcmToken();
      }
    })();

    const messagingInstance = getMessaging();

    // Cập nhật token khi FCM refresh
    const unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, async (newToken) => {
      console.log('FCM token refreshed:', newToken);
      const [userId, authToken] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('token'),
      ]);
      if (userId && authToken) {
        await registerDeviceToken({ userId, fcmToken: newToken, platform: Platform.OS as 'android' | 'ios' }, authToken);
      }
    });

    // Foreground messages
    const unsubscribeOnMessage = onMessage(messagingInstance, async remoteMessage => {
      const title = remoteMessage?.notification?.title || 'Thông báo mới';
      const body = remoteMessage?.notification?.body || '';
      try {
        // Fallback: Alert nếu không có toast
        Alert.alert(title, body);
      } catch {
        Alert.alert(title, body);
      }
    });

    // Opened from background
    const unsubscribeOnOpened = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      console.log('Mở từ background:', remoteMessage?.notification);
      // TODO: Điều hướng theo data nếu cần
    });

    // Opened from quit state
    getInitialNotification(messagingInstance).then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Mở từ trạng thái tắt hẳn:', remoteMessage?.notification);
        // TODO: Điều hướng theo data nếu cần
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpened();
      unsubscribeTokenRefresh();
    };
  }, []);
} 
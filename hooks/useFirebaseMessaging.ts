import { useUserContext } from '@/contexts/UserContext';
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

async function fetchAndRegisterFcmTokenForUser(userId?: string | null) {
  try {
    if (!userId) {
      // Thử lấy từ AsyncStorage nếu chưa có
      userId = await AsyncStorage.getItem('userId');
    }
    if (!userId) return;

    const [authToken] = await Promise.all([
      AsyncStorage.getItem('token'),
    ]);
    if (!authToken) return;

    const messagingInstance = getMessaging();
    const token = await getToken(messagingInstance);
    if (token) {
      console.log('FCM Token:', token);
      await registerDeviceToken({ userId, fcmToken: token, platform: Platform.OS as 'android' | 'ios' }, authToken);
    }
  } catch (error) {
    console.error('Lỗi lấy/đăng ký FCM token:', error);
  }
}

export function useFirebaseMessaging() {
  const { userData } = useUserContext();
  const derivedUserId = userData?._id || userData?.id || null;

  useEffect(() => {
    (async () => {
      const granted = await requestUserPermission();
      if (granted) {
        await fetchAndRegisterFcmTokenForUser(derivedUserId);
      }
    })();

    const messagingInstance = getMessaging();

    // Cập nhật token khi FCM refresh
    const unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, async (newToken) => {
      console.log('FCM token refreshed:', newToken);
      const userId = derivedUserId || (await AsyncStorage.getItem('userId'));
      const authToken = await AsyncStorage.getItem('token');
      if (userId && authToken) {
        await registerDeviceToken({ userId, fcmToken: newToken, platform: Platform.OS as 'android' | 'ios' }, authToken);
      }
    });

    // Foreground messages
    const unsubscribeOnMessage = onMessage(messagingInstance, async remoteMessage => {
      const title = remoteMessage?.notification?.title || 'Thông báo mới';
      const body = remoteMessage?.notification?.body || '';
      Alert.alert(title, body);
    });

    // Opened from background
    const unsubscribeOnOpened = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      console.log('Mở từ background:', remoteMessage?.notification);
    });

    // Opened from quit state
    getInitialNotification(messagingInstance).then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Mở từ trạng thái tắt hẳn:', remoteMessage?.notification);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpened();
      unsubscribeTokenRefresh();
    };
  // Re-run khi user thay đổi để đảm bảo token được gán đúng chủ sở hữu
  }, [derivedUserId]);
} 
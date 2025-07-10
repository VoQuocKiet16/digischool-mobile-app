import {
    getMessaging,
    getToken,
    onMessage,
    requestPermission as requestFirebasePermission,
} from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

const messagingInstance = getMessaging();

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    const androidVersion = Platform.Version;
    if (androidVersion >= 33) { // Android 13+
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('Kết quả xin quyền:', result);
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          await getDeviceToken();
        } else {
          Alert.alert('Permission Denied');
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      // Android < 13, không cần xin quyền
      await getDeviceToken();
    }
  } else {
    // iOS hoặc các nền tảng khác
    try {
      const authStatus = await requestFirebasePermission(messagingInstance);
      if (
        authStatus === 1 || // AUTHORIZED
        authStatus === 2    // PROVISIONAL
      ) {
        await getDeviceToken();
      } else {
        Alert.alert('Permission Denied');
      }
    } catch (error) {
      console.log(error);
    }
  }
};

export const getDeviceToken = async () => {
  try {
    const token = await getToken(messagingInstance);
    console.log('FCM Token:', token);
    // Có thể gửi token này lên server tại đây nếu muốn
  } catch (error) {
    console.log(error);
  }
};

export const listenForegroundNotification = () => {
  return onMessage(messagingInstance, async remoteMessage => {
    Alert.alert('Có thông báo mới!', JSON.stringify(remoteMessage));
  });
}; 
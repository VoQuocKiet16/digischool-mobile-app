import api from './api.config';

export interface RegisterDevicePayload {
  userId: string;
  fcmToken: string;
  platform: 'android' | 'ios';
  deviceId?: string;
}

export async function registerDeviceToken(payload: RegisterDevicePayload, authToken: string) {
  try {
    const res = await api.post('api/push/register', payload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return res.data;
  } catch (error) {
    // Không chặn luồng app nếu BE chưa có endpoint
    console.warn('registerDeviceToken error (ignored):', error?.toString?.() || error);
    return null;
  }
}

export async function unregisterDeviceToken(payload: { userId: string; fcmToken: string }, authToken: string) {
  try {
    const res = await api.post('api/push/unregister', payload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return res.data;
  } catch (error) {
    console.warn('unregisterDeviceToken error (ignored):', error?.toString?.() || error);
    return null;
  }
} 
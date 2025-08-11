import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, type Socket } from 'socket.io-client';
import { create, type GetState, type SetState } from 'zustand';
import { baseURL } from '../services/api.config';
import {
    getNotifications,
    type Notification
} from '../services/notification.service';

interface NotificationStoreState {
  // data
  notificationsUser: Notification[];
  notificationsActivity: Notification[];
  notificationsSystem: Notification[];
  hasUnreadNotification: boolean;
  isInitialized: boolean;
  lastFetchedAt: number | null;

  // auth/session
  userId: string | null;
  token: string | null;

  // toast
  toastVisible: boolean;
  toastTitle: string;
  toastMessage: string;

  // socket
  socket: Socket | null;
  isConnecting: boolean;

  // actions
  init: () => Promise<void>;
  ensureSocket: () => Promise<void>;
  reconnectSocket: () => Promise<void>;

  refreshNotifications: () => Promise<void>;
  refreshNotificationsByType: (type: 'user' | 'activity' | 'system') => Promise<void>;

  optimisticMarkNotificationAsRead: (id: string) => void;
  optimisticMarkAllAsRead: () => void;

  showToast: (title: string, message: string) => void;
  hideToast: () => void;
}

function computeHasUnread(all: Notification[], userId: string | null): boolean {
  if (!userId) return false;
  return all.some((n) => !n.isReadBy || !n.isReadBy.includes(userId));
}

export const useNotificationStore = create<NotificationStoreState>((set: SetState<NotificationStoreState>, get: GetState<NotificationStoreState>) => ({
  notificationsUser: [],
  notificationsActivity: [],
  notificationsSystem: [],
  hasUnreadNotification: false,
  isInitialized: false,
  lastFetchedAt: null,

  userId: null,
  token: null,

  toastVisible: false,
  toastTitle: '',
  toastMessage: '',

  socket: null,
  isConnecting: false,

  init: async () => {
    const [uid, tkn] = await Promise.all([
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('token'),
    ]);
    set({ userId: uid, token: tkn });
    await get().ensureSocket();
    // initial fetch
    await get().refreshNotifications();
    set({ isInitialized: true });
  },

  ensureSocket: async () => {
    const { socket, isConnecting, token, userId } = get();
    if (socket || isConnecting || !token || !userId) return;
    set({ isConnecting: true });
    const s = io(`${baseURL}/`, {
      transports: ['websocket'],
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    s.on('connect', () => set({ isConnecting: false }));
    s.on('disconnect', () => set({ isConnecting: false, socket: null }));
    s.on('new_notification', (notification: Notification) => {
      const uid = get().userId;
      if (!uid) return;
      if (notification.receivers?.includes(uid)) {
        const type = notification.type as 'user' | 'activity' | 'system';
        if (type === 'user') set((st) => ({ notificationsUser: [notification, ...st.notificationsUser] }));
        if (type === 'activity') set((st) => ({ notificationsActivity: [notification, ...st.notificationsActivity] }));
        if (type === 'system') set((st) => ({ notificationsSystem: [notification, ...st.notificationsSystem] }));
        const all = [
          ...get().notificationsUser,
          ...get().notificationsActivity,
          ...get().notificationsSystem,
        ];
        const hasUnread = computeHasUnread(all, uid);
        set({ hasUnreadNotification: hasUnread });
        get().showToast(notification.title, notification.content);
      }
    });
    s.emit('join', userId);
    set({ socket: s });
  },

  reconnectSocket: async () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnecting: false });
    }
    await get().ensureSocket();
  },

  refreshNotifications: async () => {
    const { token, userId } = get();
    if (!token || !userId) return;
    const [user, activity, system] = await Promise.all([
      getNotifications({ type: 'user', token }),
      getNotifications({ type: 'activity', token }),
      getNotifications({ type: 'system', token }),
    ]);
    set({
      notificationsUser: user.data || [],
      notificationsActivity: activity.data || [],
      notificationsSystem: system.data || [],
      lastFetchedAt: Date.now(),
    });
    const all = [
      ...(user.data || []),
      ...(activity.data || []),
      ...(system.data || []),
    ];
    set({ hasUnreadNotification: computeHasUnread(all, userId) });
  },

  refreshNotificationsByType: async (type: 'user' | 'activity' | 'system') => {
    const { token, userId } = get();
    if (!token || !userId) return;
    const res = await getNotifications({ type, token });
    if (type === 'user') set({ notificationsUser: res.data || [] });
    if (type === 'activity') set({ notificationsActivity: res.data || [] });
    if (type === 'system') set({ notificationsSystem: res.data || [] });
    set({ lastFetchedAt: Date.now() });
    const all = [
      ...(type === 'user' ? (res.data || []) : get().notificationsUser),
      ...(type === 'activity' ? (res.data || []) : get().notificationsActivity),
      ...(type === 'system' ? (res.data || []) : get().notificationsSystem),
    ];
    set({ hasUnreadNotification: computeHasUnread(all, userId) });
  },

  optimisticMarkNotificationAsRead: (id: string) => {
    const { userId } = get();
    if (!userId) return;
    const mark = (list: Notification[]) => list.map((n) => {
      if (n._id !== id) return n;
      const isReadBy = Array.isArray(n.isReadBy) ? n.isReadBy : [];
      if (isReadBy.includes(userId)) return n;
      return { ...n, isReadBy: [...isReadBy, userId] } as Notification;
    });
    set((st) => ({
      notificationsUser: mark(st.notificationsUser),
      notificationsActivity: mark(st.notificationsActivity),
      notificationsSystem: mark(st.notificationsSystem),
    }));
    const all = [
      ...get().notificationsUser,
      ...get().notificationsActivity,
      ...get().notificationsSystem,
    ];
    set({ hasUnreadNotification: computeHasUnread(all, userId) });
  },

  optimisticMarkAllAsRead: () => {
    const { userId } = get();
    if (!userId) return;
    const markAll = (list: Notification[]) => list.map((n) => {
      const isReadBy = Array.isArray(n.isReadBy) ? n.isReadBy : [];
      if (isReadBy.includes(userId)) return n;
      return { ...n, isReadBy: [...isReadBy, userId] } as Notification;
    });
    set((st) => ({
      notificationsUser: markAll(st.notificationsUser),
      notificationsActivity: markAll(st.notificationsActivity),
      notificationsSystem: markAll(st.notificationsSystem),
    }));
    set({ hasUnreadNotification: false });
  },

  showToast: (title: string, message: string) => set({ toastVisible: true, toastTitle: title, toastMessage: message }),
  hideToast: () => set({ toastVisible: false }),
})); 
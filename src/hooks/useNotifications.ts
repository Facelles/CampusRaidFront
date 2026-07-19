import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const { user } = useAuthStore();
  const lastCounts = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    if (!user) return;

    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    requestPermissions();

    const checkUnread = async () => {
      try {
        const res = await apiClient.get('/chat/my', { params: { userId: user.id } });
        const chats = res.data;

        chats.forEach((chat: any) => {
          const prevCount = lastCounts.current[chat.id] || 0;
          if (chat.unreadCount > prevCount) {
            // New message!
            Notifications.scheduleNotificationAsync({
              content: {
                title: `Нове повідомлення від ${chat.name}`,
                body: chat.lastMessage,
                data: { partnerId: chat.id },
              },
              trigger: null, // show immediately
            });
          }
          lastCounts.current[chat.id] = chat.unreadCount;
        });
      } catch (error) {
        console.log('Error checking notifications', error);
      }
    };

    // Check immediately and then every 10 seconds
    checkUnread();
    const interval = setInterval(checkUnread, 10000);

    return () => clearInterval(interval);
  }, [user]);
}

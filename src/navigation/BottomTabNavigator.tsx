import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ForumScreen from '../screens/ForumScreen';
import BossRaidScreen from '../screens/BossRaidScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FriendsScreen from '../screens/FriendsScreen';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const user = useAuthStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const res = await apiClient.get('/chat/my', { params: { userId: user.id } });
        const totalUnread = res.data.reduce((sum: number, chat: any) => sum + (chat.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch (e) {
        // silently fail polling
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const isWeb = Platform.OS === 'web';
  const bottomInset = isWeb ? 20 : Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#000000', 
          borderTopColor: '#3b0764',
          position: isWeb ? 'fixed' : 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 10,
        } as any,
        tabBarActiveTintColor: '#c084fc',
        tabBarInactiveTintColor: '#52525b',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'square';
          if (route.name === 'Forum') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Boss Raid') {
            iconName = focused ? 'skull' : 'skull-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name="Boss Raid" component={BossRaidScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen} 
        options={{ tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

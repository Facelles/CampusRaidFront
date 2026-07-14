import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ForumScreen from '../screens/ForumScreen';
import BossRaidScreen from '../screens/BossRaidScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ShopScreen from '../screens/ShopScreen';
import MessagesScreen from '../screens/MessagesScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#22c55e',
        tabBarStyle: { backgroundColor: '#09090b', borderTopColor: '#27272a' },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#52525b',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'square';
          if (route.name === 'Forum') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Boss Raid') {
            iconName = focused ? 'skull' : 'skull-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Shop') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'mail' : 'mail-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name="Boss Raid" component={BossRaidScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
  );
}

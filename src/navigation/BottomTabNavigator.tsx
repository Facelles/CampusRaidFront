import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ForumScreen from '../screens/ForumScreen';
import BossRaidScreen from '../screens/BossRaidScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FriendsScreen from '../screens/FriendsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#3b0764' },
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
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

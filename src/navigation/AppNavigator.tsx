import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import ShopScreen from '../screens/ShopScreen';
import { useNotifications } from '../hooks/useNotifications';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  useNotifications();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

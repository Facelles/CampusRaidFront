import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const res = await apiClient.get(`/chat/my?userId=${user.id}`);
        setChats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChats();
    });

    fetchChats();
    return unsubscribe;
  }, [navigation, user]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="bg-zinc-900/80 p-4 rounded-lg mb-3 border border-zinc-700/50 flex-row items-center"
      onPress={() => navigation.navigate('ChatRoom', { partnerId: item.id, partnerName: item.name })}
    >
      <View className="w-12 h-12 rounded-full bg-green-900/40 border border-green-500/50 items-center justify-center mr-4">
        <Ionicons name="person" size={24} color="#4ade80" />
      </View>
      <View className="flex-1">
        <Text className="text-green-400 font-bold text-lg">{item.name}</Text>
        <Text className="text-zinc-400 text-sm" numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#52525b" />
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={require('../../assets/monsters_bg.jpg')} 
      resizeMode="repeat" 
      className="flex-1"
    >
      <View className="flex-1 bg-zinc-950/85 p-4">
        <Text className="text-3xl font-bold text-green-500 mb-6 mt-4 uppercase text-center" style={{ textShadowColor: '#22c55e', textShadowRadius: 8 }}>Secure Comms</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Ionicons name="mail-unread-outline" size={64} color="#52525b" />
                <Text className="text-zinc-500 text-center mt-4 font-bold">No active comms channels.</Text>
              </View>
            }
          />
        )}
      </View>
    </ImageBackground>
  );
}

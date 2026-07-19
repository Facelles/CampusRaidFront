import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';

export default function MessagesScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchChats = async () => {
        try {
          const res = await apiClient.get('/chat/my', { params: { userId: user?.id } });
          if (isActive) setChats(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchChats();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ChatRoom', { partnerId: item.id, partnerName: item.name })}
      className="mb-3 rounded-2xl overflow-hidden"
    >
      <BlurView tint="dark" intensity={50} className="p-4 border border-white/10 flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-purple-900/30 border border-purple-500/30 items-center justify-center mr-4">
          <Ionicons name="person" size={24} color="#c084fc" />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-center">
              <Text className={`text-white text-base ${item.unreadCount > 0 ? 'font-black' : 'font-bold'}`}>{item.name}</Text>
              {item.titles?.length > 0 && (
                <View className="bg-white/10 px-2 py-0.5 rounded border border-white/5 ml-2">
                  <Text className="text-purple-300 text-[10px] font-bold uppercase">{item.titles[0]}</Text>
                </View>
              )}
            </View>
            {item.unreadCount > 0 && (
              <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
              </View>
            )}
          </View>
          <Text className={`${item.unreadCount > 0 ? 'text-zinc-200 font-bold' : 'text-zinc-400 text-sm'}`} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="px-4 pt-12 pb-4">
        <Text className="text-3xl font-black text-white tracking-tight mb-1">Messages</Text>
        <Text className="text-purple-300 text-sm font-medium">Chat with friends</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a855f7" className="mt-10" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#3f3f46" className="mb-4" />
              <Text className="text-zinc-500 text-center font-medium">No messages yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

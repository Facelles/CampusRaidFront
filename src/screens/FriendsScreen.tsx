import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function FriendsScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const [friendships, setFriendships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/friends/${user.id}`);
      setFriendships(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchFriends);
    fetchFriends();
    return unsubscribe;
  }, [navigation, user]);

  const handleRespond = async (friendshipId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await apiClient.post('/friends/respond', { friendshipId, status });
      fetchFriends();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to respond');
    }
  };

  const startChat = (partnerId: string, partnerName: string) => {
    navigation.navigate('ChatRoom', { partnerId, partnerName });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSender = item.user1Id === user?.id;
    const partner = isSender ? item.user2 : item.user1;

    if (item.status === 'PENDING') {
      if (isSender) {
        return (
          <BlurView tint="dark" intensity={50} className="p-4 rounded-xl mb-3 border border-zinc-700/50 flex-row items-center overflow-hidden">
            <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="#a1a1aa" />
            </View>
            <View className="flex-1">
              <Text className="text-zinc-100 font-bold">{partner.name}</Text>
              <Text className="text-zinc-400 text-xs">Request Sent</Text>
            </View>
            <Ionicons name="time-outline" size={20} color="#f59e0b" />
          </BlurView>
        );
      } else {
        return (
          <BlurView tint="dark" intensity={50} className="p-4 rounded-xl mb-3 border border-zinc-700/50 flex-row items-center overflow-hidden">
            <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="#a1a1aa" />
            </View>
            <View className="flex-1">
              <Text className="text-zinc-100 font-bold">{partner.name}</Text>
              <Text className="text-zinc-400 text-xs">Wants to be friends</Text>
            </View>
            <TouchableOpacity onPress={() => handleRespond(item.id, 'ACCEPTED')} className="bg-green-600 px-3 py-1.5 rounded-lg mr-2">
              <Text className="text-white font-bold text-xs">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRespond(item.id, 'REJECTED')} className="bg-red-600/80 px-3 py-1.5 rounded-lg">
              <Text className="text-white font-bold text-xs">Decline</Text>
            </TouchableOpacity>
          </BlurView>
        );
      }
    }

    if (item.status === 'ACCEPTED') {
      return (
        <BlurView tint="dark" intensity={50} className="p-4 rounded-xl mb-3 border border-zinc-700/50 flex-row items-center overflow-hidden">
          <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="#a1a1aa" />
          </View>
          <View className="flex-1">
            <Text className="text-zinc-100 font-bold">{partner.name}</Text>
            {partner.titles?.length > 0 && (
               <Text className="text-green-400 text-[10px] uppercase font-bold">{partner.titles[0]}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => startChat(partner.id, partner.name)} className="bg-blue-600 px-3 py-1.5 rounded-lg flex-row items-center">
            <Ionicons name="chatbubble" size={14} color="#fff" className="mr-1" />
            <Text className="text-white font-bold text-xs ml-1">Message</Text>
          </TouchableOpacity>
        </BlurView>
      );
    }
    return null;
  };

  const validFriendships = friendships.filter(f => f.status !== 'REJECTED');

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']} // Deep violet to black
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="px-4 pt-12 pb-4">
        <Text className="text-3xl font-black text-white tracking-tight mb-1">Friends</Text>
        <Text className="text-zinc-400 text-sm">Manage your university network</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#a855f7" className="mt-10" />
      ) : (
        <FlatList
          data={validFriendships}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-20">
              <Ionicons name="people-outline" size={64} color="#3f3f46" className="mb-4" />
              <Text className="text-zinc-500 font-medium text-center">No friends yet.{'\n'}Find people on the Leaderboard or Forum!</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

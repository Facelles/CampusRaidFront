import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'USERS' | 'UNIVERSITIES'>('USERS');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, uniRes] = await Promise.all([
          apiClient.get('/leaderboard/users'),
          apiClient.get('/leaderboard/universities')
        ]);
        setUsers(usersRes.data);
        setUniversities(uniRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUserClick = async (authorId: string, authorName: string) => {
    if (authorId === user?.id) {
      Alert.alert('Error', 'You cannot add yourself.');
      return;
    }
    try {
      await apiClient.post('/friends/request', {
        user1Id: user?.id,
        user2Id: authorId
      });
      Alert.alert('Success', `Friend request sent to ${authorName}!`);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to send request');
    }
  };

  const renderUser = ({ item, index }: { item: any, index: number }) => (
    <BlurView tint="dark" intensity={40} className="p-4 mb-3 rounded-2xl border border-white/10 flex-row justify-between items-center overflow-hidden">
      <View className="flex-row items-center">
        <Text className={`w-8 font-black text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
          #{index + 1}
        </Text>
        <View className="ml-2">
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-base">{item.name}</Text>
          </View>
          <Text className="text-zinc-400 text-xs mt-1">{item.university?.name || 'No University'}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-purple-400 font-black">{item.xp} XP</Text>
        <TouchableOpacity onPress={() => handleUserClick(item.id, item.name)} className="mt-2 bg-white/10 px-2 py-1 rounded-full flex-row items-center">
          <Ionicons name="person-add" size={10} color="#fff" />
          <Text className="text-white text-[10px] font-bold ml-1 uppercase">Connect</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const renderUniversity = ({ item, index }: { item: any, index: number }) => (
    <BlurView tint="dark" intensity={40} className="p-4 mb-3 rounded-2xl border border-white/10 flex-row justify-between items-center overflow-hidden">
      <View className="flex-row items-center flex-1">
        <Text className={`w-8 font-black text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
          #{index + 1}
        </Text>
        <View className="ml-2 flex-1">
          <Text className="text-white font-bold text-base" numberOfLines={1}>{item.name}</Text>
          <Text className="text-zinc-400 text-xs mt-1">{item.studentCount || 0} students</Text>
        </View>
      </View>
      <View className="items-end pl-2">
        <Text className="text-purple-400 font-black">{item.totalXp} XP</Text>
      </View>
    </BlurView>
  );

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="px-4 pt-12 pb-4">
        <Text className="text-3xl font-black text-white tracking-tight mb-1">Leaderboard</Text>
        <Text className="text-purple-300 text-sm font-medium">Global Rankings</Text>
      </View>

      <View className="flex-row px-4 mb-4 gap-2">
        <TouchableOpacity 
          onPress={() => setTab('USERS')}
          className={`flex-1 py-3 rounded-xl border ${tab === 'USERS' ? 'bg-purple-600 border-purple-400/50' : 'bg-white/5 border-white/10'}`}
        >
          <Text className={`text-center font-bold ${tab === 'USERS' ? 'text-white' : 'text-zinc-400'}`}>Students</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTab('UNIVERSITIES')}
          className={`flex-1 py-3 rounded-xl border ${tab === 'UNIVERSITIES' ? 'bg-purple-600 border-purple-400/50' : 'bg-white/5 border-white/10'}`}
        >
          <Text className={`text-center font-bold ${tab === 'UNIVERSITIES' ? 'text-white' : 'text-zinc-400'}`}>Universities</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a855f7" className="mt-10" />
      ) : (
        <FlatList
          data={tab === 'USERS' ? users : universities}
          keyExtractor={(item, index) => item.id || item.universityId || String(index)}
          renderItem={tab === 'USERS' ? renderUser : renderUniversity}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

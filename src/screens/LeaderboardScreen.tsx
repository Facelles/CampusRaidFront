import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, ImageBackground } from 'react-native';
import apiClient from '../api/client';

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await apiClient.get('/leaderboard/users');
        setUsers(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    // top 3 players get special styling
    const isTop3 = index < 3;
    const borderClass = index === 0 ? 'border-yellow-500/80' : index === 1 ? 'border-zinc-300/80' : index === 2 ? 'border-amber-700/80' : 'border-green-900/50';
    
    return (
      <View className={`flex-row items-center bg-zinc-900/80 p-4 rounded-lg mb-3 border ${borderClass}`}>
        <Text className="text-2xl font-bold text-zinc-400 w-10">{index + 1}</Text>
        <View className="flex-1">
          <Text className="text-green-400 font-bold text-lg" style={isTop3 ? { textShadowColor: '#22c55e', textShadowRadius: 3 } : {}}>{item.name}</Text>
          <Text className="text-zinc-300 text-xs font-bold">{item.university?.name || 'Unknown'}</Text>
        </View>
        <View className="items-end bg-green-900/40 px-3 py-1 rounded border border-green-500/30">
          <Text className="text-green-300 font-bold">{item.xp} XP</Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/monsters_bg.jpg')} 
      resizeMode="repeat" 
      className="flex-1"
    >
      <View className="flex-1 bg-zinc-950/85 p-4">
        <Text className="text-3xl font-bold text-green-500 mb-6 mt-4 uppercase text-center" style={{ textShadowColor: '#22c55e', textShadowRadius: 8 }}>Global Ranking</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ImageBackground>
  );
}

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, ImageBackground, Image } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export default function BossRaidScreen() {
  const [boss, setBoss] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlocks, setSelectedBlocks] = useState<any[]>([]);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const fetchBoss = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/boss/active');
      setBoss(res.data);
      setSelectedBlocks([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoss();
  }, []);

  const handleBlockSelect = (block: any) => {
    const puzzle = boss?.puzzles?.[0];
    if (puzzle?.type === 'MULTIPLE_CHOICE') {
      setSelectedBlocks([block]);
    } else {
      if (!selectedBlocks.find(b => b.id === block.id)) {
        setSelectedBlocks([...selectedBlocks, block]);
      }
    }
  };

  const handleBlockRemove = (block: any) => {
    setSelectedBlocks(selectedBlocks.filter(b => b.id !== block.id));
  };

  const handleAttack = async () => {
    if (!boss || !boss.puzzles || boss.puzzles.length === 0) return;
    const puzzle = boss.puzzles[0];
    const blockIds = selectedBlocks.map(b => b.id);
    
    try {
      const res = await apiClient.post('/boss/attack', {
        userId: user?.id,
        puzzleId: puzzle.id,
        blockIds
      });
      
      if (res.data.success) {
        Alert.alert('CRITICAL HIT!', res.data.message);
        // Optimistic update of user stats
        if (user) {
          setUser({ ...user, xp: user.xp + 50, coins: user.coins + 10 });
        }
        fetchBoss(); // refresh boss state
      } else {
        Alert.alert('ATTACK FAILED', res.data.message);
        setSelectedBlocks([]); // reset selection
      }
    } catch (error: any) {
      Alert.alert('ERROR', error?.response?.data?.message || 'Attack request failed');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!boss) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <Text className="text-zinc-400">No active threats detected.</Text>
      </View>
    );
  }

  const puzzle = boss.puzzles?.[0];
  const hpPercentage = (boss.currentHp / boss.maxHp) * 100;

  return (
    <ImageBackground 
      source={require('../../assets/monsters_bg.jpg')} 
      resizeMode="repeat" 
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-zinc-950/85 p-4">
        <View className="items-center mb-6 mt-4">
          <Text className="text-3xl font-bold text-red-500 mb-2 uppercase text-center" style={{ textShadowColor: '#ef4444', textShadowRadius: 10 }}>{boss.name}</Text>
          
          {boss.imageUrl && (
            <Image 
              source={{ uri: `https://campusraidbackend-1.onrender.com${boss.imageUrl}` }} 
              className="w-full aspect-square border-4 border-red-900/80 mb-4 shadow-xl"
              resizeMode="cover"
            />
          )}

          <View className="w-full h-4 bg-zinc-900/80 rounded-full overflow-hidden mb-2 border border-red-900/80 shadow-lg">
            <View 
              className="h-full bg-red-500"
              style={{ width: `${Math.max(0, hpPercentage)}%` }}
            />
          </View>
          <Text className="text-zinc-300 font-bold text-xs">HP: {boss.currentHp} / {boss.maxHp}</Text>
        </View>

        {puzzle && (
          <View className="bg-zinc-900/80 p-4 rounded-lg border border-red-500/50 mb-6 shadow-xl">
            <Text className="text-red-400 font-bold mb-2 uppercase text-lg" style={{ textShadowColor: '#ef4444', textShadowRadius: 3 }}>{puzzle.title}</Text>
            <Text className="text-zinc-200 text-sm mb-4 font-medium">{puzzle.description}</Text>
            {puzzle.type === 'MULTIPLE_CHOICE' ? (
              <>
                <Text className="text-zinc-400 text-xs mb-2 uppercase font-bold">Select one answer:</Text>
                <View className="flex-col gap-2 mb-6">
                  {puzzle.blocks.map((b: any) => {
                    const isSelected = selectedBlocks.find(sb => sb.id === b.id);
                    return (
                      <TouchableOpacity 
                        key={b.id} 
                        onPress={() => handleBlockSelect(b)}
                        className={`p-3 rounded border w-full ${isSelected ? 'bg-red-900/60 border-red-500/50' : 'bg-zinc-800/80 border-zinc-600/50'}`}
                      >
                        <Text className="text-zinc-200 font-mono text-xs font-bold">{b.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text className="text-zinc-400 text-xs mb-2 uppercase font-bold">Your Sequence (Tap to remove):</Text>
                <View className="min-h-[60px] bg-zinc-950/90 p-3 rounded-lg border border-zinc-700/50 mb-4 flex-row flex-wrap gap-2">
                  {selectedBlocks.map((b, idx) => (
                    <TouchableOpacity 
                      key={`selected-${b.id}`} 
                      onPress={() => handleBlockRemove(b)}
                      className="bg-red-900/60 p-2 rounded border border-red-500/50"
                    >
                      <Text className="text-red-100 font-mono text-xs font-bold">
                        {idx + 1}. {b.text.trim()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {selectedBlocks.length === 0 && (
                    <Text className="text-zinc-500 text-xs italic font-bold">Sequence empty...</Text>
                  )}
                </View>

                <Text className="text-zinc-400 text-xs mb-2 uppercase font-bold">Available Blocks (Tap to add):</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {puzzle.blocks.map((b: any) => {
                    const isSelected = selectedBlocks.find(sb => sb.id === b.id);
                    if (isSelected) return null;
                    return (
                      <TouchableOpacity 
                        key={b.id} 
                        onPress={() => handleBlockSelect(b)}
                        className="bg-zinc-800/80 p-2 rounded border border-zinc-600/50 w-full"
                      >
                        <Text className="text-zinc-200 font-mono text-xs font-bold">{b.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <TouchableOpacity 
              className={`p-4 rounded-lg items-center border ${
                (puzzle.type === 'MULTIPLE_CHOICE' ? selectedBlocks.length === 1 : selectedBlocks.length === puzzle.blocks.length)
                  ? 'bg-red-600/90 border-red-400/50' 
                  : 'bg-red-900/40 border-red-900/50'
              }`}
              onPress={handleAttack}
              disabled={puzzle.type === 'MULTIPLE_CHOICE' ? selectedBlocks.length !== 1 : selectedBlocks.length !== puzzle.blocks.length}
            >
              <Text className="text-white font-bold uppercase tracking-widest text-lg">
                Execute Attack
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

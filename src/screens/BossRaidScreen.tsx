import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Animated } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { playActionSound, playCriticalHitSound } from '../utils/audio';

export default function BossRaidScreen() {
  const [boss, setBoss] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlocks, setSelectedBlocks] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const universityId = (user as any)?.universityId || (user as any)?.university?.id;

  const hpAnim = React.useRef(new Animated.Value(100)).current;
  const shakeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const hpBarStyle = {
    width: hpAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%']
    }),
  };

  const bossAnimatedStyle = {
    transform: [
      { translateX: shakeAnim },
      { scale: scaleAnim }
    ],
  };

  const fetchBoss = async () => {
    try {
      if (!universityId) return;
      setLoading(true);
      const res = await apiClient.get(`/boss/active?universityId=${universityId}`);
      setBoss(res.data);
      setSelectedBlocks([]);
      
      // Update HP bar
      if (res.data) {
        Animated.timing(hpAnim, {
          toValue: (res.data.currentHp / res.data.maxHp) * 100,
          duration: 500,
          useNativeDriver: false
        }).start();
      }

      if (res.data?.id) {
        const lbRes = await apiClient.get(`/leaderboard/boss/${res.data.id}`);
        setLeaderboard(lbRes.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
         setBoss(null);
      } else {
         console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoss();
  }, [universityId]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
    ]).start();
  };

  const handleBlockSelect = (block: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (useAuthStore.getState().soundEnabled) playActionSound();
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (useAuthStore.getState().soundEnabled) playActionSound();
    setSelectedBlocks(selectedBlocks.filter(b => b.id !== block.id));
  };

  const handleAttack = async () => {
    if (!boss || !boss.puzzles || boss.puzzles.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const puzzle = boss.puzzles[0];
    const blockIds = selectedBlocks.map(b => b.id);
    
    try {
      const res = await apiClient.post('/boss/attack', {
        userId: user?.id,
        puzzleId: puzzle.id,
        blockIds
      });
      
      if (res.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (useAuthStore.getState().soundEnabled) playCriticalHitSound();
        triggerShake();
        Alert.alert('CRITICAL HIT!', res.data.message);
        
        if (user) {
          setUser({ ...user, xp: user.xp + 50, coins: user.coins + 10 });
        }
        fetchBoss();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('ATTACK FAILED', res.data.message);
        setSelectedBlocks([]);
      }
    } catch (error: any) {
      Alert.alert('ERROR', error?.response?.data?.message || 'Attack request failed');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!boss) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Ionicons name="shield-checkmark" size={60} color="#22c55e" className="mb-4" />
        <Text className="text-zinc-400 text-lg font-bold">No active threats detected.</Text>
      </View>
    );
  }

  const puzzle = boss.puzzles?.[0];

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <View className="px-4 pt-12 pb-4 flex-row justify-between items-end z-10">
        <View>
          <Text className="text-3xl font-black text-white tracking-tight mb-1">Boss Raid</Text>
          <Text className="text-purple-300 text-sm font-medium">{boss?.university?.name || 'Your University'}</Text>
        </View>
        <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
           <Text className="text-white font-bold text-xs uppercase">{boss.status}</Text>
        </View>
      </View>

      {/* Language Selector (MVP Placeholder) */}
      <View className="px-4 mb-4 z-10">
        <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Select Language</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {['JavaScript', 'Python', 'C++'].map((lang, idx) => (
            <TouchableOpacity
              key={lang}
              onPress={() => Alert.alert('MVP Only', `${lang} support is unavailable in MVP. Currently defaulting to pseudo-code / JS.`)}
              className={`mr-3 px-4 py-2 rounded-full border ${idx === 0 ? 'bg-purple-600/40 border-purple-400/50' : 'bg-white/5 border-white/10'}`}
            >
              <Text className={idx === 0 ? 'text-purple-100 font-bold' : 'text-zinc-400 font-medium'}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 z-10" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-2 mb-8 relative">
          <View className="absolute w-64 h-64 bg-purple-600/30 rounded-full blur-3xl" style={{ top: 20 }} />
          <Animated.View style={bossAnimatedStyle} className="items-center w-full">
            <View className="w-56 h-56 rounded-full border-4 border-purple-500/50 bg-black overflow-hidden justify-center items-center mb-4 shadow-2xl">
              <Text style={{ fontSize: 100, lineHeight: 120 }}>👾</Text>
            </View>
            <Text className="text-white font-black text-2xl tracking-widest uppercase text-center" style={{ textShadowColor: '#a855f7', textShadowRadius: 10 }}>
              {boss.name}
            </Text>
          </Animated.View>
        </View>

        <BlurView tint="dark" intensity={60} className="w-full h-8 bg-black/40 rounded-full overflow-hidden mb-2 border border-white/10 relative">
          <Animated.View 
            className="h-full bg-red-600 absolute left-0 top-0 bottom-0"
            style={hpBarStyle}
          />
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-white font-black text-xs">
              {boss.currentHp} / {boss.maxHp} HP
            </Text>
          </View>
        </BlurView>

        {puzzle && (
          <BlurView tint="dark" intensity={50} className="p-5 rounded-3xl border border-white/10 mb-6 overflow-hidden">
            <Text className="text-purple-300 font-bold mb-2 text-lg">{puzzle.title}</Text>
            <Text className="text-zinc-300 text-sm mb-6 leading-relaxed">{puzzle.description}</Text>
            
            {puzzle.type === 'MULTIPLE_CHOICE' ? (
              <>
                <Text className="text-white/50 text-xs mb-3 uppercase tracking-wider font-bold">Select one answer</Text>
                <View className="flex-col gap-3 mb-6">
                  {puzzle.blocks.map((b: any) => {
                    const isSelected = selectedBlocks.find(sb => sb.id === b.id);
                    return (
                      <TouchableOpacity 
                        key={b.id} 
                        onPress={() => handleBlockSelect(b)}
                        className={`p-4 rounded-xl border ${isSelected ? 'bg-purple-600/40 border-purple-400/50' : 'bg-black/40 border-white/10'}`}
                      >
                        <Text className="text-zinc-200 font-mono text-xs">{b.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text className="text-white/50 text-xs mb-3 uppercase tracking-wider font-bold">Your Sequence</Text>
                <View className="min-h-[60px] bg-black/40 p-4 rounded-xl border border-white/10 flex-row flex-wrap gap-2 mb-6">
                  {selectedBlocks.map((b, idx) => (
                    <TouchableOpacity 
                      key={`selected-${b.id}`} 
                      onPress={() => handleBlockRemove(b)}
                      className="bg-purple-600/40 p-2 rounded-lg border border-purple-400/50"
                    >
                      <Text className="text-white font-mono text-xs">
                        {idx + 1}. {b.text.trim()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {selectedBlocks.length === 0 && (
                    <Text className="text-white/40 text-xs italic">Tap blocks below to arrange...</Text>
                  )}
                </View>

                <Text className="text-white/50 text-xs mb-3 uppercase tracking-wider font-bold">Available Blocks</Text>
                <View className="flex-row flex-wrap gap-3 mb-6">
                  {puzzle.blocks.map((b: any) => {
                    const isSelected = selectedBlocks.find(sb => sb.id === b.id);
                    if (isSelected) return null;
                    return (
                      <TouchableOpacity 
                        key={b.id} 
                        onPress={() => handleBlockSelect(b)}
                        className="bg-black/30 p-3 rounded-lg border border-white/5 w-full"
                      >
                        <Text className="text-zinc-300 font-mono text-xs">{b.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <TouchableOpacity 
              onPress={handleAttack}
              disabled={selectedBlocks.length === 0}
              className={`mt-4 p-4 rounded-xl items-center ${selectedBlocks.length === 0 ? 'bg-white/5 border border-white/5' : 'bg-green-600/80 border border-green-500/50'}`}
            >
              <Text className={`font-black tracking-widest ${selectedBlocks.length === 0 ? 'text-white/20' : 'text-white'}`}>
                EXECUTE ATTACK
              </Text>
            </TouchableOpacity>
          </BlurView>
        )}

        {puzzle && (
        <BlurView tint="dark" intensity={50} className="p-5 rounded-3xl border border-white/10 mb-10 overflow-hidden">
          <View className="flex-row items-center mb-4">
            <Ionicons name="trophy" size={20} color="#c084fc" className="mr-2" />
            <Text className="text-white font-black text-lg">Top Raiders</Text>
          </View>
          
          {leaderboard.length === 0 ? (
            <Text className="text-white/40 text-center py-4 font-medium">No damage dealt yet.</Text>
          ) : (
            leaderboard.map((item, index) => (
              <View key={item.userId} className="flex-row justify-between items-center py-3 border-b border-white/5">
                <View className="flex-row items-center">
                  <Text className={`w-6 font-black ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
                    #{index + 1}
                  </Text>
                  <View className="ml-2 flex-row items-center">
                    <Text className="text-white font-bold">{item.user.name}</Text>
                  </View>
                </View>
                <Text className="text-purple-400 font-black">{item._sum.damage} DMG</Text>
              </View>
            ))
          )}
        </BlurView>
        )}
        
      </ScrollView>
    </View>
  );
}

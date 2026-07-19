import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator, Alert, Switch } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { getVIPType } from '../utils/vip';
import AnimatedVIPText from '../components/AnimatedVIPText';

export default function ProfileScreen({ navigation }: any) {
  const { user, setUser, logout, soundEnabled, setSoundEnabled } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  const openUniModal = async () => {
    setModalVisible(true);
    if (universities.length === 0) {
      setLoading(true);
      try {
        const res = await apiClient.get('/universities');
        setUniversities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const selectUniversity = async (uniId: string) => {
    try {
      const res = await apiClient.put('/user/university', {
        userId: user?.id,
        universityId: uniId
      });
      setUser(res.data); // Update user in Zustand
      setModalVisible(false);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to update university');
    }
  };

  const selectAvatar = async (emoji: string) => {
    try {
      const res = await apiClient.put('/user/avatar', {
        avatar: emoji
      });
      setUser(res.data); // Update user
      setAvatarModalVisible(false);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to update avatar');
    }
  };

  return (

    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <ScrollView className="flex-1 px-4 pt-10">
        <View className="items-center mt-8 mb-8">
          <TouchableOpacity 
            onPress={() => setAvatarModalVisible(true)}
            className="w-24 h-24 rounded-full bg-purple-900/30 border-2 border-purple-500/50 items-center justify-center mb-4"
          >
            {user?.avatar ? (
              <Text style={{ fontSize: 48 }}>{user.avatar}</Text>
            ) : (
              <Ionicons name="person" size={48} color="#c084fc" />
            )}
          </TouchableOpacity>
          {getVIPType(user?.titles) ? (
            <AnimatedVIPText text={user?.name || 'Student'} type={getVIPType(user?.titles)!} style={{ fontSize: 30, fontWeight: '900', color: '#fff' }} />
          ) : (
            <Text className="text-3xl font-black text-white tracking-tight">{user?.name || 'Student'}</Text>
          )}
          
          {user?.titles && user.titles.length > 0 && (
            <View className="bg-amber-500/20 px-3 py-1 mt-2 rounded-full border border-amber-500/50 flex-row items-center">
              <Ionicons name="medal" size={14} color="#fbbf24" />
              <Text className="text-amber-400 font-bold ml-1 text-sm">{user.titles[0]}</Text>
            </View>
          )}

          <Text className="text-purple-300 font-medium mt-2">{user?.email}</Text>
        </View>

        <BlurView tint="dark" intensity={50} className="p-2 rounded-3xl border border-white/10 mb-8 overflow-hidden">
          {/* XP */}
          <View className="flex-row justify-between items-center py-4 px-4 border-b border-white/5">
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#facc15" className="mr-3" />
              <Text className="text-zinc-200 font-bold ml-3">Experience</Text>
            </View>
            <Text className="text-purple-400 font-black text-lg">{user?.xp || 0} XP</Text>
          </View>

          <View className="flex-row justify-between items-center py-4 px-4 border-b border-white/5">
            <View className="flex-row items-center">
              <Ionicons name="cash" size={20} color="#3b82f6" className="mr-3" />
              <Text className="text-zinc-200 font-bold ml-3">Coins</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-blue-400 font-black text-lg mr-4">{user?.coins || 0}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Shop')} className="bg-purple-600 px-3 py-1.5 rounded-full flex-row items-center">
                <Ionicons name="cart" size={14} color="#fff" />
                <Text className="text-white font-bold ml-1 text-xs">SHOP</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center py-4 px-4 border-b border-white/5">
            <View className="flex-row items-center">
              <Ionicons name="school" size={20} color="#a855f7" className="mr-3" />
              <Text className="text-zinc-200 font-bold ml-3">University</Text>
            </View>
            <TouchableOpacity onPress={openUniModal} className="flex-row items-center bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Text className="text-zinc-200 font-medium text-xs mr-2">{(user as any)?.university?.name || 'Select'}</Text>
              <Ionicons name="pencil" size={12} color="#a855f7" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between items-center py-4 px-4">
            <View className="flex-row items-center">
              <Ionicons name="volume-high" size={20} color="#10b981" className="mr-3" />
              <Text className="text-zinc-200 font-bold ml-3">Sound Effects & Music</Text>
            </View>
            <Switch 
              value={soundEnabled} 
              onValueChange={setSoundEnabled} 
              trackColor={{ false: "#3f3f46", true: "#8b5cf6" }}
              thumbColor={soundEnabled ? "#ffffff" : "#a1a1aa"}
            />
          </View>
        </BlurView>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 justify-end bg-black/80">
            <View className="bg-zinc-900 h-2/3 rounded-t-3xl p-5 border-t border-zinc-800">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-zinc-100">Select University</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#a1a1aa" />
                </TouchableOpacity>
              </View>
              
              {loading ? (
                <ActivityIndicator color="#a855f7" />
              ) : (
                <FlatList 
                  data={universities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => selectUniversity(item.id)}
                      className="py-4 border-b border-zinc-800/50"
                    >
                      <Text className="text-zinc-300 font-medium">{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

        <Modal visible={avatarModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 justify-end bg-black/80">
            <View className="bg-zinc-900 pb-10 pt-5 px-5 rounded-t-3xl border-t border-zinc-800">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-zinc-100">Select Avatar</Text>
                <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#a1a1aa" />
                </TouchableOpacity>
              </View>
              
              <View className="flex-row flex-wrap justify-between">
                {['👾', '🐱', '🦄', '🚀', '💀', '🤡', '🤖', '👻', '💩', '🐸', '👑', '🔥', '🤓', '👽', '🦊', '🐼'].map(emoji => (
                  <TouchableOpacity 
                    key={emoji}
                    onPress={() => selectAvatar(emoji)}
                    className="w-16 h-16 items-center justify-center bg-zinc-800 rounded-2xl m-1"
                  >
                    <Text style={{ fontSize: 32 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        <BlurView tint="dark" intensity={50} className="p-2 rounded-3xl border border-white/10 mb-8 overflow-hidden">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Shop')}
            className="flex-row justify-between items-center py-4 px-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="cart" size={20} color="#f59e0b" className="mr-3" />
              <Text className="text-zinc-200 font-bold ml-3">Shop (Titles & Hints)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#71717a" />
          </TouchableOpacity>
        </BlurView>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-900/30 p-4 rounded-xl border border-red-500/30 flex-row justify-center items-center mt-auto mb-10"
        >
          <Ionicons name="log-out-outline" size={20} color="#fca5a5" />
          <Text className="text-red-300 font-bold ml-2 uppercase">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import AnimatedVIPText from '../components/AnimatedVIPText';
import AnimatedVIPBorder from '../components/AnimatedVIPBorder';

export default function ShopScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiClient.get('/shop/items');
        setItems(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const buyItem = async (item: any) => {
    if (!user) return;
    try {
      const res = await apiClient.post('/shop/buy', { 
        userId: user.id,
        itemId: item.id 
      });
      setUser(res.data.user);
      Alert.alert('Success', `You purchased ${item.name}!`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Purchase failed');
    }
  };

  const equipItem = async (item: any) => {
    if (!user) return;
    try {
      const res = await apiClient.post('/shop/equip', { 
        userId: user.id,
        itemId: item.id 
      });
      setUser(res.data.user);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to equip');
    }
  };

  const getTypeFromTitle = (title: string) => {
    if (title.includes('Glitch')) return 'glitch';
    if (title.includes('Gold')) return 'gold';
    return 'neon';
  };

  const renderItem = ({ item }: { item: any }) => {
    const isOwned = user?.titles?.includes(item.name);
    const isEquipped = user?.titles?.[0] === item.name;
    const animationType = getTypeFromTitle(item.name);

    return (
      <View className="mb-6">
        <AnimatedVIPBorder type={animationType} borderWidth={2} borderRadius={20}>
          <View className="p-5 bg-black">
            <View className="flex-row justify-between items-center mb-2">
              <AnimatedVIPText 
                text={item.name} 
                type={animationType} 
                style={{ fontSize: 24, fontWeight: '900', color: '#fff' }} 
              />
              <View className="flex-row items-center bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/30">
                <Ionicons name="diamond" size={16} color="#c084fc" />
                <Text className="text-purple-300 font-bold ml-1">{item.price}</Text>
              </View>
            </View>
            <Text className="text-zinc-400 leading-5 mb-4">{item.description}</Text>
            
            <TouchableOpacity
              disabled={isEquipped || loading}
              onPress={() => isOwned ? equipItem(item) : buyItem(item)}
              className={`py-3 rounded-xl items-center justify-center ${
                isEquipped ? 'bg-zinc-800' : (isOwned ? 'bg-blue-600' : 'bg-purple-600')
              }`}
            >
              <Text className={`font-bold ${isEquipped ? 'text-zinc-500' : 'text-white'}`}>
                {isEquipped ? 'EQUIPPED' : (isOwned ? 'EQUIP' : 'PURCHASE')}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedVIPBorder>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="px-4 pt-12 pb-4 flex-row justify-between items-end">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2 bg-white/10 rounded-full">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-3xl font-black text-white tracking-tight mb-1">Shop</Text>
            <Text className="text-purple-300 text-sm font-medium">Get items & perks</Text>
          </View>
        </View>
        <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/5 flex-row items-center">
           <Ionicons name="cash" size={16} color="#10b981" className="mr-1" />
           <Text className="text-green-400 font-bold">{user?.coins || 0}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a855f7" className="mt-10" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListEmptyComponent={<Text className="text-zinc-500 text-center mt-10 font-bold">Shop is empty.</Text>}
        />
      )}
    </View>
  );
}

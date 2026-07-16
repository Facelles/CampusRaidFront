import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export default function ShopScreen() {
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
      const res = await apiClient.post('/shop/buy', { itemId: item.id });
      setUser(res.data.user);
      Alert.alert('Success', `You purchased ${item.name}!`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Purchase failed');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <BlurView tint="dark" intensity={50} className="p-4 mb-4 rounded-3xl border border-white/10 flex-row justify-between items-center overflow-hidden">
      <View className="flex-1 mr-4">
        <Text className="text-white font-bold text-lg mb-1">{item.name}</Text>
        <Text className="text-zinc-400 text-sm mb-2 leading-tight">{item.description}</Text>
        <View className="bg-white/10 self-start px-2 py-1 rounded-md border border-white/5">
          <Text className="text-purple-300 text-[10px] font-bold uppercase">{item.type}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={() => buyItem(item)}
        className="bg-purple-600/90 py-3 px-5 rounded-xl border border-purple-400/50 items-center justify-center shadow-lg shadow-purple-600/30"
      >
        <Ionicons name="cart" size={16} color="#fff" className="mb-1" />
        <Text className="text-white font-black">{item.price}</Text>
      </TouchableOpacity>
    </BlurView>
  );

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="px-4 pt-12 pb-4 flex-row justify-between items-end">
        <View>
          <Text className="text-3xl font-black text-white tracking-tight mb-1">Shop</Text>
          <Text className="text-purple-300 text-sm font-medium">Get items & perks</Text>
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

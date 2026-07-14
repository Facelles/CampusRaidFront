import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export default function ShopScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

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

  const handleBuy = async (item: any) => {
    if (!user) return;
    try {
      const res = await apiClient.post('/shop/buy', {
        userId: user.id,
        itemId: item.id
      });
      if (res.data.success) {
        Alert.alert('Transaction Successful', res.data.message);
        setUser(res.data.user);
      }
    } catch (error: any) {
      Alert.alert('Transaction Failed', error?.response?.data?.error || 'Unknown error');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-zinc-900/80 p-4 rounded-lg mb-4 border border-purple-500/40 shadow-lg flex-row justify-between items-center">
      <View className="flex-1 pr-4">
        <Text className="text-purple-300 font-bold text-lg mb-1">{item.name}</Text>
        <Text className="text-zinc-300 text-xs mb-2 font-medium">{item.description}</Text>
        <View className="bg-yellow-900/40 self-start px-2 py-1 rounded border border-yellow-700/50">
          <Text className="text-yellow-400 font-bold text-xs">{item.price} Coins</Text>
        </View>
      </View>
      <TouchableOpacity 
        className="bg-purple-600/90 px-4 py-3 rounded-lg border border-purple-400/50"
        onPress={() => handleBuy(item)}
      >
        <Text className="text-white font-bold uppercase text-xs tracking-wider">Buy</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../assets/monsters_bg.jpg')} 
      resizeMode="repeat" 
      className="flex-1"
    >
      <View className="flex-1 bg-zinc-950/85 p-4">
        {/* Profile Section */}
        <View className="bg-zinc-900/90 p-5 rounded-lg border border-purple-500/50 mb-6 mt-4 shadow-xl">
          <Text className="text-purple-400 text-xs uppercase mb-1 font-bold tracking-widest">Operator Profile</Text>
          <Text className="text-3xl font-bold text-purple-300 mb-2" style={{ textShadowColor: '#a855f7', textShadowRadius: 5 }}>{user?.name}</Text>
          
          <View className="flex-row gap-6 mt-2 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/80">
            <View>
              <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">XP Level</Text>
              <Text className="text-green-400 font-bold text-lg">{user?.xp} XP</Text>
            </View>
            <View>
              <Text className="text-zinc-400 text-xs uppercase font-bold mb-1">Credits</Text>
              <Text className="text-yellow-400 font-bold text-lg">{user?.coins} 🪙</Text>
            </View>
          </View>

          {user?.titles && user.titles.length > 0 && (
            <View className="mt-4">
              <Text className="text-purple-400 text-xs mb-2 uppercase font-bold tracking-widest">Titles</Text>
              <View className="flex-row flex-wrap gap-2">
                {user.titles.map((t, idx) => (
                  <View key={idx} className="bg-purple-900/60 border border-purple-400/50 px-3 py-1.5 rounded">
                    <Text className="text-purple-100 text-xs font-bold">{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <Text className="text-2xl font-bold text-purple-400 mb-4 uppercase tracking-widest" style={{ textShadowColor: '#a855f7', textShadowRadius: 5 }}>Black Market</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#a855f7" />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ImageBackground>
  );
}

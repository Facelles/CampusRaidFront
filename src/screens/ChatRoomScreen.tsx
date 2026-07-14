import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function ChatRoomScreen({ route, navigation }: any) {
  const { partnerId, partnerName } = route.params;
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: partnerName || 'Chat',
      headerStyle: { backgroundColor: '#09090b' },
      headerTintColor: '#22c55e',
    });
  }, [navigation, partnerName]);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get(`/chat/history?user1Id=${user.id}&user2Id=${partnerId}`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll for new messages
    return () => clearInterval(interval);
  }, [user, partnerId]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    try {
      await apiClient.post('/chat', {
        senderId: user.id,
        receiverId: partnerId,
        content: message.trim()
      });
      setMessage('');
      fetchMessages(); // Optimistically we could add it to state, but let's just fetch
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View className={`mb-3 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View className={`max-w-[80%] p-3 rounded-lg border ${isMe ? 'bg-green-900/60 border-green-500/50 rounded-br-none' : 'bg-zinc-800/80 border-zinc-600/50 rounded-bl-none'}`}>
          <Text className={isMe ? 'text-green-50' : 'text-zinc-200'}>{item.content}</Text>
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
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-1 bg-zinc-950/85">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={<Text className="text-zinc-500 text-center mt-10 font-bold">Start a secure connection.</Text>}
            />
          )}

          <View className="p-4 bg-zinc-900/90 border-t border-zinc-800/80 flex-row items-center">
            <TextInput
              className="flex-1 bg-zinc-950/80 text-green-400 px-4 py-3 rounded-full border border-zinc-700/50 mr-2"
              placeholder="Encrypting message..."
              placeholderTextColor="#52525b"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity 
              className={`w-12 h-12 rounded-full items-center justify-center border ${message.trim() ? 'bg-green-600 border-green-400' : 'bg-zinc-800 border-zinc-700'}`}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <Ionicons name="send" size={20} color={message.trim() ? '#fff' : '#52525b'} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

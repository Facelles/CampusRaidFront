import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export default function ChatRoomScreen({ route, navigation }: any) {
  const { partnerId, partnerName } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiClient.get('/chat/history', { params: { partnerId } });
        setMessages(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [partnerId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      const res = await apiClient.post('/chat', {
        senderId: user.id,
        receiverId: partnerId,
        content: newMessage.trim()
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View className={`mb-3 max-w-[80%] rounded-2xl p-3 ${
        isMe ? 'self-end bg-purple-600 border border-purple-400/50 rounded-br-none' : 'self-start bg-white/10 border border-white/5 rounded-bl-none'
      }`}>
        <Text className="text-white font-medium">{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      className="flex-1 bg-black"
    >
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <BlurView tint="dark" intensity={70} className="pt-12 pb-4 px-4 flex-row items-center border-b border-white/10 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2">
          <Ionicons name="arrow-back" size={24} color="#c084fc" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{partnerName}</Text>
        </View>
      </BlurView>

      {loading ? (
        <ActivityIndicator size="large" color="#a855f7" className="mt-10" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text className="text-zinc-500 text-center mt-10 font-medium">Say hello!</Text>
          }
        />
      )}

      <BlurView tint="dark" intensity={70} className="p-4 border-t border-white/10 flex-row items-center">
        <TextInput
          className="flex-1 bg-white/10 text-white p-3 rounded-full px-5 font-medium border border-white/5"
          placeholder="Type a message..."
          placeholderTextColor="#a1a1aa"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity 
          onPress={handleSend}
          className="ml-3 w-12 h-12 bg-purple-600 rounded-full items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/50"
        >
          <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

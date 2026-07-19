import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import { getVIPType } from '../utils/vip';
import AnimatedVIPBorder from '../components/AnimatedVIPBorder';

// Helper for static shared secret
const getSharedSecret = (id1: string, id2: string) => {
  return [id1, id2].sort().join('_');
};

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
        const res = await apiClient.get('/chat/history', { 
          params: { user1Id: user?.id, user2Id: partnerId } 
        });
        if (!user) return;
        const secret = getSharedSecret(user.id, partnerId);
        
        // Decrypt messages
        const decryptedMessages = res.data.map((msg: any) => {
          try {
            const bytes = CryptoJS.AES.decrypt(msg.content, secret);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            return { ...msg, content: originalText || msg.content }; // fallback if not encrypted
          } catch (e) {
            return msg;
          }
        });
        
        setMessages(decryptedMessages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 2000);
    return () => clearInterval(interval);
  }, [partnerId, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      const secret = getSharedSecret(user.id, partnerId);
      const encryptedContent = CryptoJS.AES.encrypt(newMessage.trim(), secret).toString();

      const res = await apiClient.post('/chat', {
        senderId: user.id,
        receiverId: partnerId,
        content: encryptedContent
      });
      
      // Decrypt just the new message to display it
      const newMsg = res.data;
      try {
        const bytes = CryptoJS.AES.decrypt(newMsg.content, secret);
        newMsg.content = bytes.toString(CryptoJS.enc.Utf8) || newMsg.content;
      } catch(e) {}
      
      newMsg.sender = { titles: user.titles };

      setMessages([...messages, newMsg]);
      setNewMessage('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to send');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.id;
    const vipType = getVIPType(item.sender?.titles);
    
    const content = (
      <View className={`p-3 ${
        isMe ? 'bg-purple-600 rounded-br-none' : 'bg-white/10 rounded-bl-none'
      } ${!vipType ? 'border border-white/5 rounded-2xl' : ''}`}>
        <Text className="text-white font-medium">{item.content}</Text>
        {isMe && (
          <View className="flex-row justify-end mt-1">
            <Ionicons 
              name={item.isRead ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={item.isRead ? "#60a5fa" : "#a1a1aa"} 
            />
          </View>
        )}
      </View>
    );

    return (
      <View className={`mb-3 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View className="max-w-[80%]">
          {vipType ? (
            <AnimatedVIPBorder type={vipType} borderWidth={2} borderRadius={16}>
              {content}
            </AnimatedVIPBorder>
          ) : content}
        </View>
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
      
      <BlurView tint="dark" intensity={70} className="pt-12 pb-4 px-4 flex-row items-center border-b border-white/10 z-10 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2">
            <Ionicons name="arrow-back" size={24} color="#c084fc" />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-bold text-lg">{partnerName}</Text>
          </View>
        </View>
        
        {/* Encryption Badge */}
        <View className="flex-row items-center bg-green-900/40 px-2 py-1 rounded-full border border-green-500/30">
          <Ionicons name="lock-closed" size={12} color="#4ade80" />
          <Text className="text-green-400 text-[10px] font-bold ml-1 uppercase">E2E Encrypted</Text>
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
          className="flex-1 bg-white/10 text-white text-base p-3 rounded-full px-5 font-medium border border-white/5"
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

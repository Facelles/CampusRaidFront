import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function PostDetailScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/posts/${postId}`);
      setPost(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load post details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await apiClient.post(`/posts/${postId}/comments`, {
        content: newComment.trim(),
        userId: user?.id,
      });
      // Оновлюємо локальний стейт
      setPost((prev: any) => ({
        ...prev,
        comments: [...(prev.comments || []), res.data]
      }));
      setNewComment('');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  if (!post) return null;

  const score = (post.upvotes || 0) - (post.downvotes || 0);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1 bg-zinc-950">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-zinc-800">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#a1a1aa" />
          </TouchableOpacity>
          <Text className="text-zinc-100 font-bold text-lg flex-1" numberOfLines={1}>Thread</Text>
        </View>

        <FlatList
          data={post.comments || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={() => (
            <View className="bg-zinc-900/80 p-5 rounded-2xl border border-green-900/50 mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center mr-3 border border-zinc-700">
                  <Ionicons name="person" size={20} color="#a1a1aa" />
                </View>
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-zinc-300 font-bold">{post.user?.name || 'Anonymous'}</Text>
                    {post.user?.titles?.length > 0 && (
                      <View className="bg-green-900/20 px-2 py-0.5 rounded ml-2 border border-green-500/20">
                        <Text className="text-green-400 text-[10px] uppercase font-bold">{post.user.titles[0]}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-zinc-500 text-xs">Score: {score}</Text>
                </View>
              </View>
              <Text className="text-green-400 font-bold text-xl mb-3 leading-relaxed">{post.title}</Text>
              <Text className="text-zinc-300 leading-6">{post.content}</Text>
              <View className="h-px w-full bg-zinc-800 my-4" />
              <Text className="text-zinc-500 font-bold text-xs uppercase tracking-wider">
                {post.comments?.length || 0} Comments
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 mb-3 ml-4 border-l-2 border-l-zinc-700">
              <View className="flex-row items-center mb-2">
                <Text className="text-zinc-400 font-bold text-xs mr-2">{item.user?.name || 'Anonymous'}</Text>
                {item.user?.titles?.length > 0 && (
                  <Text className="text-zinc-600 text-[10px] uppercase font-bold">({item.user.titles[0]})</Text>
                )}
              </View>
              <Text className="text-zinc-300 text-sm leading-5">{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10">
              <Ionicons name="chatbubbles-outline" size={48} color="#3f3f46" className="mb-3" />
              <Text className="text-zinc-500 font-medium">No comments yet. Be the first!</Text>
            </View>
          )}
        />

        {/* Comment Input */}
        <View className="p-4 bg-zinc-900 border-t border-zinc-800 flex-row items-center">
          <TextInput 
            className="flex-1 bg-zinc-800 text-zinc-100 p-3 px-4 rounded-full border border-zinc-700 mr-3"
            placeholder="Add a comment..."
            placeholderTextColor="#71717a"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            onPress={handleAddComment}
            disabled={isSubmitting || !newComment.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${newComment.trim() ? 'bg-green-600' : 'bg-zinc-800'}`}
          >
            {isSubmitting ? (
               <ActivityIndicator color="#fff" size="small" />
            ) : (
               <Ionicons name="send" size={18} color={newComment.trim() ? '#fff' : '#52525b'} style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

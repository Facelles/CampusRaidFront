import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { getVIPType } from '../utils/vip';
import AnimatedVIPText from '../components/AnimatedVIPText';
import AnimatedVIPBorder from '../components/AnimatedVIPBorder';

export default function PostDetailScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

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
        parentId: replyingTo?.id
      });
      // Оновлюємо локальний стейт (оптимістично)
      fetchPost();
      setNewComment('');
      setReplyingTo(null);
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  if (!post) return null;

  const score = (post.upvotes || 0) - (post.downvotes || 0);

  const renderComment = ({ item }: { item: any }) => {
    const rootVipType = getVIPType(item.user?.titles);
    
    const rootContent = (
      <BlurView tint="dark" intensity={40} className={`p-4 rounded-xl border ${rootVipType ? 'border-transparent' : 'border-white/10'} z-10`}>
        <View className="flex-row items-center mb-2">
          {rootVipType ? (
            <AnimatedVIPText text={item.user?.name || 'Anonymous'} type={rootVipType} style={{ fontSize: 14, fontWeight: 'bold', marginRight: 8, color: '#fff' }} />
          ) : (
            <Text className="text-zinc-300 font-bold text-sm mr-2">{item.user?.name || 'Anonymous'}</Text>
          )}
          {item.user?.titles?.length > 0 && (
            <Text className="text-purple-400 text-[10px] uppercase font-bold">({item.user.titles[0]})</Text>
          )}
        </View>
        <Text className="text-zinc-300 text-sm leading-5 mb-3">{item.content}</Text>
        <TouchableOpacity 
          onPress={() => setReplyingTo({ id: item.id, name: item.user?.name || 'Anonymous' })}
          className="flex-row items-center self-start bg-white/5 px-2 py-1 rounded border border-white/5"
        >
          <Ionicons name="return-down-forward" size={12} color="#a1a1aa" />
          <Text className="text-zinc-400 text-xs font-bold ml-1">Reply</Text>
        </TouchableOpacity>
      </BlurView>
    );

    return (
    <View className="mb-4">
      {/* Root Comment */}
      {rootVipType ? (
        <AnimatedVIPBorder type={rootVipType} borderRadius={16} borderWidth={2}>{rootContent}</AnimatedVIPBorder>
      ) : rootContent}
      
      {/* Nested Replies with Reddit-style Vertical Line */}
      {item.replies && item.replies.length > 0 && (
        <View className="ml-4 mt-1 border-l-2 border-purple-500/30 pl-3">
          {item.replies.map((reply: any, index: number) => (
            <View key={reply.id} className="py-2">
              
              {/* Reply Content */}
              <View className="flex-1 pr-2">
                <View className="flex-row items-center mb-1">
                  {getVIPType(reply.user?.titles) ? (
                    <AnimatedVIPText text={reply.user?.name || 'Anonymous'} type={getVIPType(reply.user?.titles)!} style={{ fontSize: 12, fontWeight: 'bold', marginRight: 8, color: '#fff' }} />
                  ) : (
                    <Text className="text-zinc-400 font-bold text-xs mr-2">{reply.user?.name || 'Anonymous'}</Text>
                  )}
                  {reply.user?.titles?.length > 0 && (
                    <Text className="text-purple-500 text-[9px] uppercase font-bold">({reply.user.titles[0]})</Text>
                  )}
                </View>
                <Text className="text-zinc-400 text-xs leading-5 mb-2">{reply.content}</Text>
                
                <TouchableOpacity 
                  onPress={() => setReplyingTo({ id: item.id, name: reply.user?.name || 'Anonymous' })}
                  className="flex-row items-center self-start"
                >
                  <Ionicons name="return-down-forward" size={10} color="#71717a" />
                  <Text className="text-zinc-500 text-[10px] font-bold ml-1 uppercase">Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#000' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1 bg-black">
        <LinearGradient
          colors={['#1e1b4b', '#000000']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        
        {/* Header */}
        <View className="flex-row items-center pt-14 pb-4 px-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white/10 p-2 rounded-full mr-4">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl flex-1">Discussion</Text>
        </View>

        <FlatList
          data={post.comments || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => {
            const postVipType = getVIPType(post.user?.titles);
            const postHeaderContent = (
              <BlurView tint="dark" intensity={50} className={`p-5 rounded-3xl border ${postVipType ? 'border-transparent' : 'border-purple-500/30'} mb-6 overflow-hidden`}>
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-purple-900/40 items-center justify-center mr-3 border border-purple-500/20">
                    <Ionicons name="person" size={20} color="#c084fc" />
                  </View>
                  <View>
                    <View className="flex-row items-center">
                      {postVipType ? (
                        <AnimatedVIPText text={post.user?.name || 'Anonymous'} type={postVipType} style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }} />
                      ) : (
                        <Text className="text-white font-bold">{post.user?.name || 'Anonymous'}</Text>
                      )}
                      {post.user?.titles?.length > 0 && (
                        <View className="bg-purple-900/40 px-2 py-0.5 rounded ml-2 border border-purple-500/20">
                          <Text className="text-purple-400 text-[10px] uppercase font-bold">{post.user.titles[0]}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-purple-300/60 text-xs">Score: {score}</Text>
                  </View>
                </View>
                <Text className="text-white font-black text-2xl mb-3 leading-tight">{post.title}</Text>
                <Text className="text-zinc-300 leading-6 text-base">{post.content}</Text>
                <View className="h-px w-full bg-white/10 my-4" />
                <Text className="text-purple-400 font-bold text-xs uppercase tracking-wider">
                  {(post.comments?.length || 0) + (post.comments?.reduce((acc: number, c: any) => acc + (c.replies?.length || 0), 0) || 0)} Comments
                </Text>
              </BlurView>
            );

            return postVipType ? (
              <AnimatedVIPBorder type={postVipType} borderRadius={24} borderWidth={3} style={{ marginBottom: 24 }}>
                {postHeaderContent}
              </AnimatedVIPBorder>
            ) : postHeaderContent;
          }}
          renderItem={renderComment}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10">
              <Ionicons name="chatbubbles-outline" size={48} color="#a1a1aa" className="mb-3 opacity-50" />
              <Text className="text-zinc-400 font-medium">No comments yet. Be the first!</Text>
            </View>
          )}
        />

        {/* Comment Input */}
        <View className="p-4 bg-black/80 border-t border-white/5" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          {replyingTo && (
            <View className="flex-row items-center justify-between bg-purple-900/30 p-2 rounded-t-xl px-4 border border-purple-500/20 border-b-0">
              <Text className="text-purple-300 text-xs">Replying to <Text className="font-bold">{replyingTo.name}</Text></Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={16} color="#c084fc" />
              </TouchableOpacity>
            </View>
          )}
          <View className="flex-row items-end">
            <TextInput 
              className={`flex-1 bg-white/10 text-white p-3 px-4 ${replyingTo ? 'rounded-b-xl rounded-tr-xl' : 'rounded-2xl'} border border-white/10 mr-3 max-h-32`}
              placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
              placeholderTextColor="#71717a"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              onPress={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${newComment.trim() ? 'bg-purple-600' : 'bg-white/5'}`}
            >
              {isSubmitting ? (
                 <ActivityIndicator color="#fff" size="small" />
              ) : (
                 <Ionicons name="send" size={18} color={newComment.trim() ? '#fff' : '#52525b'} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

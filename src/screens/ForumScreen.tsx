import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, ImageBackground, RefreshControl } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { getVIPType } from '../utils/vip';
import AnimatedVIPText from '../components/AnimatedVIPText';
import AnimatedVIPBorder from '../components/AnimatedVIPBorder';

export default function ForumScreen({ navigation }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  const fetchPosts = async () => {
    try {
      if (!posts.length) setLoading(true);
      setRefreshing(true);
      const res = await apiClient.get('/posts');
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPosts();
    });
    fetchPosts();
    return unsubscribe;
  }, [navigation]);

  const handleCreatePost = async () => {
    if (!newTitle || !newContent) return;
    try {
      await apiClient.post('/posts', {
        title: newTitle,
        content: newContent,
        userId: user?.id,
        universityId: user?.universityId || 'some-id',
      });
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      fetchPosts();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to create post');
    }
  };

  const handleVote = async (postId: string, type: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      // Send vote request and update state with real data from server
      const res = await apiClient.post(`/posts/${postId}/vote`, { type, userId: user?.id });
      setPosts(currentPosts => 
        currentPosts.map(p => p.id === postId ? res.data : p)
      );
    } catch (error) {
      console.error('Vote failed', error);
      fetchPosts(); // revert on failure
    }
  };

  const handleUserClick = async (author: any) => {
    if (author.id === user?.id) {
      Alert.alert('Error', 'You cannot add yourself.');
      return;
    }
    
    // Optimistic: just send a friend request
    try {
      await apiClient.post('/friends/request', {
        user1Id: user?.id,
        user2Id: author.id
      });
      Alert.alert('Success', `Friend request sent to ${author.name}!`);
    } catch (error: any) {
      if (error?.response?.data?.error?.includes('вже')) {
        // Already requested or friends. Just go to chat
        navigation.navigate('ChatRoom', { partnerId: author.id, partnerName: author.name });
      } else {
        Alert.alert('Error', error?.response?.data?.error || 'Failed to send request');
      }
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const score = (item.upvotes || 0) - (item.downvotes || 0);
    const vipType = getVIPType(item.user?.titles);
    
    const content = (
      <BlurView tint="dark" intensity={40} className={`p-4 border ${vipType ? 'border-transparent' : 'border-white/10'} flex-row`}>
        {/* Voting Sidebar */}
        <View className="items-center justify-start mr-3">
          <TouchableOpacity onPress={() => handleVote(item.id, 'UPVOTE')} className="p-1">
            <Ionicons name="caret-up" size={24} color={score > 0 ? '#a855f7' : '#a1a1aa'} />
          </TouchableOpacity>
          <Text className={`font-black my-1 text-xs ${score > 0 ? 'text-purple-400' : score < 0 ? 'text-red-400' : 'text-zinc-300'}`}>
            {score}
          </Text>
          <TouchableOpacity onPress={() => handleVote(item.id, 'DOWNVOTE')} className="p-1">
            <Ionicons name="caret-down" size={24} color={score < 0 ? '#f87171' : '#a1a1aa'} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-white font-black text-lg mb-1 tracking-tight">{item.title}</Text>
          <Text className="text-zinc-300/80 mb-3 text-sm leading-5">{item.content}</Text>
          <View className="flex-row justify-between items-center mt-auto">
            <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-full border border-white/10">
              {item.user?.avatar ? (
                <Text style={{ fontSize: 12 }}>{item.user.avatar}</Text>
              ) : (
                <Ionicons name="person" size={12} color="#a855f7" />
              )}
              {vipType ? (
                <AnimatedVIPText text={item.user?.name} type={vipType} style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4, color: '#fff' }} />
              ) : (
                <Text className="text-purple-300/90 text-xs font-bold ml-1">{item.user?.name}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => handleUserClick(item.user)} className="flex-row items-center ml-3 bg-white/10 px-2 py-1 rounded-full">
              <Ionicons name="person-add" size={12} color="#fff" className="mr-1" />
              <Text className="text-white text-[10px] font-bold ml-1 uppercase">Connect</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center ml-3">
              <Ionicons name="chatbubble" size={14} color="#a1a1aa" className="mr-1" />
              <Text className="text-zinc-400 text-xs font-bold ml-1">{item._count?.comments || 0}</Text>
            </View>
          </View>
        </View>
      </BlurView>
    );

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        className="mb-4 rounded-2xl overflow-hidden"
      >
        {vipType ? (
          <AnimatedVIPBorder type={vipType} borderRadius={16} borderWidth={2}>
            {content}
          </AnimatedVIPBorder>
        ) : content}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="px-4 pt-12 pb-4 flex-row justify-between items-end">
        <View>
            <Text className="text-3xl font-black text-white tracking-tight mb-1">Campus Forum</Text>
            <Text className="text-purple-300 text-sm font-medium">Discuss with your peers</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="bg-white/10 p-2 rounded-full">
            <Ionicons name="log-out-outline" size={20} color="#fca5a5" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#a855f7" className="mt-10" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPosts} tintColor="#a855f7" />}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        />
      )}

      {isCreating && (
        <View className="absolute inset-0 z-50 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <BlurView tint="dark" intensity={80} className="w-11/12 rounded-3xl overflow-hidden border border-purple-500/30">
            {/* Header */}
            <LinearGradient
              colors={['#4c1d95', '#1e1b4b']}
              className="px-6 pt-6 pb-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="create" size={22} color="#c084fc" />
                  <Text className="text-white font-black text-xl ml-2 tracking-tight">New Discussion</Text>
                </View>
                <TouchableOpacity
                  onPress={() => { setIsCreating(false); setNewTitle(''); setNewContent(''); }}
                  className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Body */}
            <View className="px-6 py-4">
              <Text className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Title</Text>
              <TextInput
                className="bg-white/5 text-white text-base px-4 py-3 rounded-xl border border-white/10 mb-4 font-medium"
                placeholder="What's the topic?"
                placeholderTextColor="#52525b"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Content</Text>
              <TextInput
                className="bg-white/5 text-white text-base px-4 py-3 rounded-xl border border-white/10 mb-6 font-medium"
                style={{ height: 120 }}
                placeholder="Share your thoughts with the community..."
                placeholderTextColor="#52525b"
                value={newContent}
                onChangeText={setNewContent}
                multiline
                textAlignVertical="top"
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => { setIsCreating(false); setNewTitle(''); setNewContent(''); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 items-center"
                >
                  <Text className="text-zinc-400 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreatePost}
                  disabled={!newTitle || !newContent}
                  className={`flex-1 py-3 rounded-xl items-center ${!newTitle || !newContent ? 'bg-purple-900/40 border border-purple-700/30' : 'bg-purple-600'}`}
                >
                  <LinearGradient
                    colors={!newTitle || !newContent ? ['#4c1d95', '#4c1d95'] : ['#9333ea', '#7e22ce']}
                    className="absolute inset-0 rounded-xl"
                  />
                  <Text className={`font-bold ${!newTitle || !newContent ? 'text-purple-400' : 'text-white'}`}>Post 🚀</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      )}

      <TouchableOpacity 
        onPress={() => setIsCreating(true)}
        className="absolute bottom-28 right-6 w-16 h-16 bg-purple-600 rounded-full items-center justify-center shadow-lg shadow-purple-900"
        style={{ elevation: 10 }}
      >
        <LinearGradient
          colors={['#9333ea', '#7e22ce']}
          className="w-full h-full rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={32} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

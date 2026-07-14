import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function ForumScreen({ navigation }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const res = await apiClient.get('/posts');
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
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

  const startChat = (author: any) => {
    if (author.id === user?.id) {
      Alert.alert('Error', 'You cannot chat with yourself.');
      return;
    }
    navigation.navigate('ChatRoom', { partnerId: author.id, partnerName: author.name });
  };

  const renderItem = ({ item }: { item: any }) => {
    const score = (item.upvotes || 0) - (item.downvotes || 0);
    
    return (
      <View className="bg-zinc-900/80 p-4 rounded-lg mb-4 border border-green-900/50 flex-row">
        {/* Voting Sidebar */}
        <View className="items-center justify-start mr-3">
          <TouchableOpacity onPress={() => handleVote(item.id, 'UPVOTE')} className="p-1">
            <Ionicons name="arrow-up-circle-outline" size={28} color="#4ade80" />
          </TouchableOpacity>
          <Text className={`font-bold my-1 ${score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
            {score}
          </Text>
          <TouchableOpacity onPress={() => handleVote(item.id, 'DOWNVOTE')} className="p-1">
            <Ionicons name="arrow-down-circle-outline" size={28} color="#f87171" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-green-400 font-bold text-lg mb-1">{item.title}</Text>
          <Text className="text-zinc-300 mb-3 text-sm">{item.content}</Text>
          <View className="flex-row justify-between items-center mt-auto">
            <TouchableOpacity 
              className="flex-row items-center bg-green-900/30 px-2 py-1 rounded border border-green-500/30"
              onPress={() => startChat(item.user)}
            >
              <Ionicons name="person-circle-outline" size={16} color="#4ade80" />
              <Text className="text-green-400 text-xs font-bold ml-1">{item.user?.name}</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={14} color="#4ade80" />
              <Text className="text-green-500/80 text-xs ml-1 font-bold">{item._count?.comments || 0}</Text>
            </View>
          </View>
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
      <View className="flex-1 bg-zinc-950/85 p-4">
        <View className="flex-row justify-between items-center mb-6 mt-4">
          <Text className="text-2xl font-bold text-green-500" style={{ textShadowColor: '#22c55e', textShadowRadius: 5 }}>CAMPUS THREADS</Text>
          
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-green-600/90 px-4 py-2 rounded-lg border border-green-400/50 mr-2"
              onPress={() => setIsCreating(!isCreating)}
            >
              <Text className="text-white font-bold uppercase text-xs">{isCreating ? 'Cancel' : 'New Post'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-red-900/60 px-3 py-2 rounded-lg border border-red-500/50 items-center justify-center"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={16} color="#fca5a5" />
            </TouchableOpacity>
          </View>
        </View>

        {isCreating && (
          <View className="bg-zinc-900/90 p-4 rounded-lg mb-6 border border-green-500/50">
            <TextInput
              className="bg-zinc-950/80 text-green-400 p-3 rounded-lg mb-3 border border-green-900/50"
              placeholder="Post Title"
              placeholderTextColor="#52525b"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              className="bg-zinc-950/80 text-green-400 p-3 rounded-lg mb-3 border border-green-900/50"
              placeholder="What's on your mind?..."
              placeholderTextColor="#52525b"
              multiline
              numberOfLines={4}
              value={newContent}
              onChangeText={setNewContent}
            />
            <TouchableOpacity 
              className="bg-green-600/90 p-3 rounded-lg items-center border border-green-400/50"
              onPress={handleCreatePost}
            >
              <Text className="text-white font-bold uppercase">Submit Post</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text className="text-zinc-500 text-center mt-10 font-bold">No threads found.</Text>}
          />
        )}
      </View>
    </ImageBackground>
  );
}

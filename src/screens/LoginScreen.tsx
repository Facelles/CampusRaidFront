import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { useEffect } from 'react';

export default function LoginScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [isCustomUni, setIsCustomUni] = useState(false);
  const { setUser, setToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isLogin && universities.length === 0) {
      apiClient.get('/universities').then(res => setUniversities(res.data)).catch(console.error);
    }
  }, [isLogin]);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!name || !universityName))) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name, universityName };
      
      const res = await apiClient.post(endpoint, payload);
      
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      
      // Navigate to Main (BottomTabNavigator)
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.response?.data?.error || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <View className="flex-1 justify-center p-6 relative z-10">
        <View className="absolute w-72 h-72 bg-purple-600/20 rounded-full blur-3xl -top-10 -left-10" />
        <View className="absolute w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl bottom-10 -right-10" />

        <View className="mb-10 items-center">
          <Text className="text-5xl font-black text-white tracking-tighter mb-2" style={{ textShadowColor: '#c084fc', textShadowRadius: 10 }}>CAMPUS</Text>
          <Text className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 tracking-widest uppercase">Raid</Text>
        </View>

        <BlurView tint="dark" intensity={70} className="p-6 rounded-3xl border border-white/10 overflow-hidden">
          <Text className="text-white text-2xl font-bold mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          
          {!isLogin && (
            <>
              <TextInput
                className="bg-black/40 text-white p-4 rounded-xl border border-white/5 mb-4 font-medium"
                placeholder="Full Name"
                placeholderTextColor="#a1a1aa"
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity 
                className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4 flex-row justify-between items-center"
                onPress={() => setModalVisible(true)}
              >
                <Text className={`font-medium ${universityName ? 'text-white' : 'text-zinc-400'}`}>
                  {universityName || "Select University"}
                </Text>
              </TouchableOpacity>
            </>
          )}
          
          <TextInput
            className="bg-black/40 text-white p-4 rounded-xl border border-white/5 mb-4 font-medium"
            placeholder="Email"
            placeholderTextColor="#a1a1aa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            className="bg-black/40 text-white p-4 rounded-xl border border-white/5 mb-6 font-medium"
            placeholder="Password"
            placeholderTextColor="#a1a1aa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            className="bg-purple-600 p-4 rounded-full items-center shadow-lg shadow-purple-600/30"
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">{isLogin ? 'Sign In' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-zinc-400 font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-purple-400 font-bold">{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-zinc-900 h-2/3 rounded-t-3xl p-5 border-t border-zinc-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-zinc-100">
                {isCustomUni ? 'Enter University Name' : 'Select University'}
              </Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setIsCustomUni(false); }}>
                <Ionicons name="close" size={24} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
            
            {isCustomUni ? (
              <View>
                <TextInput
                  className="bg-black/40 text-white p-4 rounded-xl border border-white/5 mb-4 font-medium"
                  placeholder="University Name (e.g. KNU)"
                  placeholderTextColor="#a1a1aa"
                  value={universityName}
                  onChangeText={setUniversityName}
                  autoFocus
                />
                <TouchableOpacity 
                  className="bg-purple-600 p-4 rounded-full items-center shadow-lg shadow-purple-600/30"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-bold text-lg">Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="p-4 items-center mt-2"
                  onPress={() => setIsCustomUni(false)}
                >
                  <Text className="text-zinc-400 font-medium">Back to list</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList 
                  data={universities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        setUniversityName(item.name);
                        setModalVisible(false);
                      }}
                      className="py-4 border-b border-zinc-800/50"
                    >
                      <Text className="text-zinc-300 font-medium">{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text className="text-zinc-500 py-4 text-center">No universities found.</Text>
                  }
                />
                <TouchableOpacity 
                  className="mt-4 p-4 border border-purple-500/30 rounded-xl items-center flex-row justify-center"
                  onPress={() => {
                    setIsCustomUni(true);
                    setUniversityName('');
                  }}
                >
                  <Ionicons name="add" size={20} color="#c084fc" />
                  <Text className="text-purple-400 font-bold ml-2">My university is not listed</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

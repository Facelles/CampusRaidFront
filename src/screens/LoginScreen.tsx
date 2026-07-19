import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';

export default function LoginScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

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
      
      setUser(res.data);
      
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
              <TextInput
                className="bg-black/40 text-white p-4 rounded-xl border border-white/5 mb-4 font-medium"
                placeholder="University Name (e.g. KNU)"
                placeholderTextColor="#a1a1aa"
                value={universityName}
                onChangeText={setUniversityName}
              />
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
    </KeyboardAvoidingView>
  );
}

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, ScrollView } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // If already authenticated and persistence restored, redirect
    if (user) {
      navigation.replace('Main');
    }
  }, [user, navigation]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    if (!isLogin && (!name || !universityName)) {
      Alert.alert('Error', 'Please enter name and university');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await apiClient.post('/auth/login', { 
          email: email.trim(), 
          password 
        });
        setUser(response.data);
        navigation.replace('Main');
      } else {
        const response = await apiClient.post('/auth/register', { 
          email: email.trim(), 
          password,
          name: name.trim(), 
          universityName: universityName.trim() 
        });
        setUser(response.data);
        navigation.replace('Main');
      }
    } catch (error: any) {
      Alert.alert('Connection Failed', error?.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/monsters_bg.jpg')} 
      resizeMode="repeat" 
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center bg-zinc-950/85 px-6 py-12">
          <Text className="text-5xl font-bold text-green-500 mb-2 tracking-widest text-center" style={{ textShadowColor: '#22c55e', textShadowRadius: 10 }}>CAMPUS RAID</Text>
          <Text className="text-zinc-300 text-lg mb-8 text-center font-bold">Establish secure connection</Text>
          
          {/* Tabs */}
          <View className="flex-row w-full mb-6 bg-zinc-900/80 rounded-lg p-1 border border-zinc-700/50">
            <TouchableOpacity 
              className={`flex-1 p-3 rounded-md items-center ${isLogin ? 'bg-green-600/90' : ''}`}
              onPress={() => setIsLogin(true)}
            >
              <Text className={`font-bold ${isLogin ? 'text-white' : 'text-zinc-400'}`}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 p-3 rounded-md items-center ${!isLogin ? 'bg-green-600/90' : ''}`}
              onPress={() => setIsLogin(false)}
            >
              <Text className={`font-bold ${!isLogin ? 'text-white' : 'text-zinc-400'}`}>REGISTER</Text>
            </TouchableOpacity>
          </View>

          <View className="w-full space-y-4 mb-8">
            <View>
              <Text className="text-green-400 mb-1 ml-1 uppercase text-xs font-bold mt-2">Contact Email</Text>
              <TextInput
                className="w-full bg-zinc-900/80 text-green-400 p-4 rounded-lg border border-green-900/50"
                placeholder="neo@matrix.com"
                placeholderTextColor="#52525b"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-green-400 mb-1 ml-1 uppercase text-xs font-bold mt-4">Password</Text>
              <TextInput
                className="w-full bg-zinc-900/80 text-green-400 p-4 rounded-lg border border-green-900/50"
                placeholder="********"
                placeholderTextColor="#52525b"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {!isLogin && (
              <>
                <View>
                  <Text className="text-green-400 mb-1 ml-1 uppercase text-xs font-bold mt-4">Operator Name</Text>
                  <TextInput
                    className="w-full bg-zinc-900/80 text-green-400 p-4 rounded-lg border border-green-900/50"
                    placeholder="Neo"
                    placeholderTextColor="#52525b"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-green-400 mb-1 ml-1 uppercase text-xs font-bold mt-4">University Faction</Text>
                  <TextInput
                    className="w-full bg-zinc-900/80 text-green-400 p-4 rounded-lg border border-green-900/50"
                    placeholder="e.g. KNU, KPI, LNU"
                    placeholderTextColor="#52525b"
                    value={universityName}
                    onChangeText={setUniversityName}
                  />
                </View>
              </>
            )}
          </View>

          <TouchableOpacity 
            className={`w-full p-4 rounded-lg items-center border border-green-500/50 ${loading ? 'bg-green-900/80' : 'bg-green-600/90'}`}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text className="text-zinc-50 font-bold text-lg uppercase tracking-wider">
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

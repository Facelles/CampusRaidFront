import "./global.css";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import InstallPromptWeb from './src/components/InstallPromptWeb';
import { useAuthStore } from './src/store/useAuthStore';
import { playBackgroundMusic, stopBackgroundMusic } from './src/utils/audio';

export default function App() {
  const soundEnabled = useAuthStore((state) => state.soundEnabled);

  useEffect(() => {
    if (soundEnabled) {
      playBackgroundMusic();
      
      // Handle web autoplay restrictions
      if (Platform.OS === 'web') {
        const handleInteraction = () => {
          if (useAuthStore.getState().soundEnabled) {
             playBackgroundMusic();
          }
          window.removeEventListener('click', handleInteraction);
          window.removeEventListener('touchstart', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
      }
    } else {
      stopBackgroundMusic();
    }
    
    return () => {
      stopBackgroundMusic();
    };
  }, [soundEnabled]);

  return (
    <>
      <AppNavigator />
      <InstallPromptWeb />
      <StatusBar style="light" />
    </>
  );
}

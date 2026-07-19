import "./global.css";
import { useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import InstallPromptWeb from './src/components/InstallPromptWeb';
import DesktopNotSupported from './src/components/DesktopNotSupported';
import { useAuthStore } from './src/store/useAuthStore';
import { playBackgroundMusic, stopBackgroundMusic } from './src/utils/audio';

export default function App() {
  const soundEnabled = useAuthStore((state) => state.soundEnabled);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    let handleInteraction: () => void;

    if (soundEnabled && !isDesktop) {
      playBackgroundMusic();
      
      if (Platform.OS === 'web') {
        handleInteraction = () => {
          if (useAuthStore.getState().soundEnabled) {
             playBackgroundMusic();
          }
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
      }
    } else {
      stopBackgroundMusic();
    }
    
    return () => {
      stopBackgroundMusic();
      if (Platform.OS === 'web' && handleInteraction) {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      }
    };
  }, [soundEnabled, isDesktop]);

  if (isDesktop) {
    return (
      <SafeAreaProvider style={{ flex: 1 }}>
        <DesktopNotSupported />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AppNavigator />
      <InstallPromptWeb />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

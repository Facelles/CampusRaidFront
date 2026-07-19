import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function InstallPromptWeb() {
  const [isVisible, setIsVisible] = useState(false);
  const [device, setDevice] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web') return;

    try {
      // Check if the app is already installed / running standalone
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone || 
        document.referrer.includes('android-app://');

      if (isStandalone) return;

      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setDevice('ios');
      } else if (/android/.test(ua)) {
        setDevice('android');
      }

      // Show prompt only for mobile users, slightly delayed so it doesn't block the very first render
      if (/iphone|ipad|ipod|android/.test(ua)) {
        const timer = setTimeout(() => setIsVisible(true), 2500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Failed to detect PWA environment', e);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <Modal transparent animationType="slide" visible={isVisible}>
      <View style={styles.container}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsVisible(false)} />
        <BlurView intensity={80} tint="dark" style={styles.bottomSheet}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="download-outline" size={28} color="#c084fc" />
            </View>
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <Ionicons name="close" size={24} color="#71717a" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.title}>Install CampusRaid 🚀</Text>
          <Text style={styles.description}>
            Get the full app experience: fullscreen, faster performance, and an icon on your home screen.
          </Text>

          {device === 'ios' && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                1. Tap the <Ionicons name="share-outline" size={18} color="#e4e4e7" /> Share button in Safari.
              </Text>
              <Text style={styles.instructionText}>
                2. Scroll down and tap "Add to Home Screen".
              </Text>
            </View>
          )}

          {device === 'android' && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                1. Tap the browser menu (⋮) in the top right.
              </Text>
              <Text style={styles.instructionText}>
                2. Tap "Add to Home screen" or "Install App".
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={() => setIsVisible(false)}>
            <Text style={styles.buttonText}>Got it!</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(24,24,27,0.95)', // Fallback if blur fails
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#a1a1aa',
    marginBottom: 20,
    lineHeight: 22,
  },
  instructionContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  instructionText: {
    color: '#e4e4e7',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});

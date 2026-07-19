import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DesktopNotSupported() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <BlurView tint="dark" intensity={50} style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="phone-portrait-outline" size={80} color="#a855f7" />
        </View>
        
        <Text style={styles.title}>Mobile Only Experience</Text>
        <Text style={styles.description}>
          CampusRaid is designed exclusively for smartphones. 
          Please open this link on your mobile device to join the raid!
        </Text>
        
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code-outline" size={100} color="#c084fc" style={{ opacity: 0.5 }} />
          <Text style={styles.qrText}>Scan on Mobile</Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#d4d4d8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  qrText: {
    color: '#a855f7',
    fontWeight: 'bold',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedVIPTextProps {
  text: string;
  style?: any;
  type?: 'neon' | 'glitch' | 'gold';
}

export default function AnimatedVIPText({ text, style, type = 'neon' }: AnimatedVIPTextProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const animatedStyle = {
    transform: [{
      translateX: progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['-100%', '100%']
      })
    }]
  };

  const getColors = () => {
    switch (type) {
      case 'gold': return ['#eab308', '#fef08a', '#eab308', '#fef08a'] as const;
      case 'glitch': return ['#22c55e', '#86efac', '#22c55e', '#86efac'] as const;
      case 'neon':
      default: return ['#a855f7', '#ec4899', '#a855f7', '#ec4899'] as const;
    }
  };

  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]}>
          {text}
        </Text>
      }
    >
      <View style={{ flexDirection: 'row' }}>
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
        <Animated.View style={[StyleSheet.absoluteFill, { width: '200%' }, animatedStyle]}>
          <LinearGradient
            colors={getColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </MaskedView>
  );
}

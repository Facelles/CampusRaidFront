import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedVIPBorderProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  type?: 'neon' | 'glitch' | 'gold';
  borderWidth?: number;
  borderRadius?: number;
}

export default function AnimatedVIPBorder({ 
  children, 
  style, 
  type = 'neon', 
  borderWidth = 2,
  borderRadius = 16 
}: AnimatedVIPBorderProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const animatedStyle = {
    transform: [{
      rotate: rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      })
    }]
  };

  const getColors = () => {
    switch (type) {
      case 'gold': return ['#eab308', '#fef08a', '#ca8a04', '#fef08a', '#eab308'] as const;
      case 'glitch': return ['#22c55e', '#86efac', '#16a34a', '#86efac', '#22c55e'] as const;
      case 'neon':
      default: return ['#a855f7', '#ec4899', '#8b5cf6', '#ec4899', '#a855f7'] as const;
    }
  };

  return (
    <View style={[{ borderRadius, overflow: 'hidden', padding: borderWidth }, style]}>
      {/* Background Animated Gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '200%', height: '200%' }}
        />
      </Animated.View>

      {/* Inner Content Container */}
      <View style={{ flex: 1, backgroundColor: '#000', borderRadius: borderRadius - borderWidth, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}

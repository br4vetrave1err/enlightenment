import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export function CourseCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.placeholderOrbit} />
      <View style={styles.placeholderTitle} />
      <View style={styles.placeholderDescription} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderOrbit: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A2A3E',
    marginRight: 12,
  },
  placeholderTitle: {
    height: 16,
    width: 120,
    backgroundColor: '#2A2A3E',
    borderRadius: 4,
    marginBottom: 8,
  },
  placeholderDescription: {
    height: 12,
    width: 180,
    backgroundColor: '#2A2A3E',
    borderRadius: 4,
  },
});

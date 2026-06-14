import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface MessageSkeletonProps {
  isUser?: boolean;
}

export function MessageSkeleton({ isUser = false }: MessageSkeletonProps) {
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
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.agentContainer,
        { opacity },
      ]}
    >
      <View style={[styles.placeholder, isUser ? styles.userPlaceholder : styles.agentPlaceholder]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#00D4FF',
  },
  agentContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A2E',
  },
  placeholder: {
    height: 16,
    width: 120,
    borderRadius: 4,
  },
  userPlaceholder: {
    backgroundColor: '#0088AA',
  },
  agentPlaceholder: {
    backgroundColor: '#2A2A3E',
  },
});

import { View, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
}

export function ProgressBar({ progress, height = 8, color = '#00D4FF' }: ProgressBarProps) {
  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.background, { height }]} />
      <View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color,
            width: `${Math.min(100, Math.max(0, progress))}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#2A2A3E',
    borderRadius: 4,
  },
  fill: {
    borderRadius: 4,
  },
});

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { spaceColors } from '@/theme/colors'
import { borderRadius } from '@/theme/spacing'
import { animations } from '@/theme/animations'

interface OrbitProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: string
}

export function OrbitProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = spaceColors.aurora,
}: OrbitProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const glowOpacity = useSharedValue(0.6)

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(1, {
        duration: animations.durations.slow,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    )
  }, [])

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.glow, glowStyle, { width: size, height: size }]} />

      <View style={styles.svgContainer}>
        <View
          style={[
            styles.track,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: spaceColors.locked,
            },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        {label && (
          <Text style={[styles.label, { color: spaceColors.starlight }]}>{label}</Text>
        )}
        {sublabel && (
          <Text style={[styles.sublabel, { color: spaceColors.starlightMuted }]}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    backgroundColor: spaceColors.aurora,
    opacity: 0.1,
  },
  svgContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 24,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 12,
    marginTop: 4,
  },
})

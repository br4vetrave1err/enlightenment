import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { spaceColors } from '@/theme/colors'
import { animations } from '@/theme/animations'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
}

interface StarFieldProps {
  starCount?: number
  opacity?: number
}

const { width, height } = Dimensions.get('window')

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 3000,
  }))
}

const StarDot: React.FC<{ star: Star }> = ({ star }) => {
  const opacity = useSharedValue(star.opacity)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2 + Math.random() * 0.6, {
        duration: animations.durations.slow + star.delay,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: spaceColors.starlight,
        },
      ]}
    />
  )
}

export function StarField({ starCount = 50, opacity = 1 }: StarFieldProps) {
  const stars = useRef(generateStars(starCount)).current

  return (
    <View style={[styles.container, { opacity }]}>
      {stars.map((star) => (
        <StarDot key={star.id} star={star} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
})

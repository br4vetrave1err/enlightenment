import React from 'react'
import { Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { spaceColors } from '@/theme/colors'
import { borderRadius, spacing } from '@/theme/spacing'
import { animations } from '@/theme/animations'

interface NebulaButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  icon?: string
}

const variantStyles = {
  primary: {
    background: spaceColors.cosmic,
    text: spaceColors.starlight,
    glow: spaceColors.cosmic,
  },
  secondary: {
    background: spaceColors.nebula,
    text: spaceColors.starlight,
    glow: spaceColors.nebulaBlue,
  },
  ghost: {
    background: 'transparent',
    text: spaceColors.starlightMuted,
    glow: 'transparent',
  },
}

export function NebulaButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
}: NebulaButtonProps) {
  const scale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.3)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.96, {
        duration: animations.durations.fast,
        easing: Easing.out(Easing.ease),
      })
    }
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: animations.durations.fast,
      easing: Easing.out(Easing.ease),
    })
  }

  const colors = variantStyles[variant]

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            { backgroundColor: colors.glow },
          ]}
        />
        <View
          style={[
            styles.button,
            { backgroundColor: colors.background },
          ]}
        >
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.md + 2,
    opacity: 0.3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 120,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
})

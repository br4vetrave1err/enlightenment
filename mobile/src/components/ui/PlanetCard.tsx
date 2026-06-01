import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { spaceColors } from '@/theme/colors'
import { borderRadius, spacing } from '@/theme/spacing'
import { animations } from '@/theme/animations'

interface PlanetCardProps {
  title: string
  subtitle?: string
  progress?: number
  icon?: string
  onPress?: () => void
  status?: 'locked' | 'available' | 'in-progress' | 'completed'
}

const statusColors = {
  locked: spaceColors.locked,
  available: spaceColors.available,
  'in-progress': spaceColors.inProgress,
  completed: spaceColors.completed,
}

export function PlanetCard({
  title,
  subtitle,
  progress = 0,
  icon,
  onPress,
  status = 'available',
}: PlanetCardProps) {
  const scale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.3)

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.98, {
      duration: animations.durations.fast,
      easing: Easing.out(Easing.ease),
    })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: animations.durations.fast,
      easing: Easing.out(Easing.ease),
    })
  }

  React.useEffect(() => {
    glowOpacity.value = withTiming(statusColors[status] === spaceColors.completed ? 0.4 : 0.2, {
      duration: animations.durations.slow,
    })
  }, [status])

  const statusColor = statusColors[status]

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.container, pressStyle]}>
        <Animated.View style={[styles.glow, glowStyle, { backgroundColor: statusColor }]} />

        <View style={[styles.card, { borderColor: statusColor }]}>
          {icon && <Text style={styles.icon}>{icon}</Text>}

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.lg + 4,
    opacity: 0.2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: spaceColors.nebula,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: spaceColors.starlight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: spaceColors.starlightMuted,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: spaceColors.locked,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: spaceColors.starlightMuted,
    minWidth: 36,
    textAlign: 'right',
  },
})

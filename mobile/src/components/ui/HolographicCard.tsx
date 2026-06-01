import React from 'react'
import { View, StyleSheet } from 'react-native'
import { spaceColors } from '@/theme/colors'
import { borderRadius, spacing } from '@/theme/spacing'

interface HolographicCardProps {
  children: React.ReactNode
  style?: any
}

export function HolographicCard({ children, style }: HolographicCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.glass} />
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: spaceColors.border,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: spaceColors.glass,
  },
  content: {
    position: 'relative',
    padding: spacing.lg,
  },
})

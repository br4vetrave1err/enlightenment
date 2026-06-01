import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { OrbitProgress, HolographicCard } from '@/components/ui'
import { spaceColors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { LearningStats, KnowledgeProfile } from '@/shared/api-contract'

interface OrbitTrackerProps {
  stats: LearningStats
  profile?: KnowledgeProfile
}

interface OrbitRingProps {
  label: string
  value: number
  maxValue: number
  color: string
  unit?: string
}

function OrbitRing({ label, value, maxValue, color, unit = '' }: OrbitRingProps) {
  const progress = maxValue > 0 ? (value / maxValue) * 100 : 0

  return (
    <View style={styles.ringContainer}>
      <OrbitProgress
        progress={progress}
        size={100}
        strokeWidth={6}
        label={`${value}${unit}`}
        sublabel={label}
        color={color}
      />
    </View>
  )
}

export function OrbitTracker({ stats, profile }: OrbitTrackerProps) {
  const orbits: OrbitRingProps[] = [
    {
      label: 'Nodes Completed',
      value: stats.total_nodes_completed,
      maxValue: 100,
      color: spaceColors.aurora,
    },
    {
      label: 'Current Streak',
      value: stats.current_streak_days,
      maxValue: 30,
      color: spaceColors.solar,
      unit: 'd',
    },
    {
      label: 'Courses Active',
      value: stats.courses_in_progress,
      maxValue: 10,
      color: spaceColors.nebulaBlue,
    },
    {
      label: 'Nodes/Week',
      value: stats.nodes_per_week,
      maxValue: 20,
      color: spaceColors.galaxy,
    },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Orbit</Text>
        <Text style={styles.subtitle}>
          {stats.time_spent_total_hours.toFixed(1)} hours total exploration time
        </Text>
      </View>

      <HolographicCard style={styles.orbitCard}>
        <View style={styles.orbitGrid}>
          {orbits.map((orbit, index) => (
            <OrbitRing key={index} {...orbit} />
          ))}
        </View>
      </HolographicCard>

      {profile && profile.knowledge_gaps.length > 0 && (
        <HolographicCard style={styles.gapsCard}>
          <Text style={styles.sectionTitle}>Knowledge Gaps</Text>
          {profile.knowledge_gaps.map((gap, index) => (
            <View key={index} style={styles.gapItem}>
              <Text style={styles.gapTopic}>{gap.topic}</Text>
              <Text style={styles.gapRecommendation}>
                Recommended: {gap.recommended_course}
              </Text>
            </View>
          ))}
        </HolographicCard>
      )}

      {profile && profile.topics.length > 0 && (
        <HolographicCard style={styles.topicsCard}>
          <Text style={styles.sectionTitle}>Topic Mastery</Text>
          {profile.topics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <Text style={styles.topicName}>{topic.name}</Text>
              <View style={styles.masteryBar}>
                <View
                  style={[
                    styles.masteryFill,
                    {
                      width: `${topic.mastery_level}%`,
                      backgroundColor: getMasteryColor(topic.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.masteryStatus}>{topic.status}</Text>
            </View>
          ))}
        </HolographicCard>
      )}
    </ScrollView>
  )
}

function getMasteryColor(status: string): string {
  switch (status) {
    case 'new':
      return spaceColors.starlightDim
    case 'learning':
      return spaceColors.nebulaBlue
    case 'proficient':
      return spaceColors.solar
    case 'mastered':
      return spaceColors.aurora
    default:
      return spaceColors.starlightDim
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: spaceColors.cosmos,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: spaceColors.starlight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: spaceColors.starlightMuted,
  },
  orbitCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  orbitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
  },
  ringContainer: {
    width: '45%',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  gapsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: spaceColors.starlight,
    marginBottom: spacing.md,
  },
  gapItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: spaceColors.border,
  },
  gapTopic: {
    fontSize: 16,
    color: spaceColors.starlight,
    marginBottom: spacing.xs,
  },
  gapRecommendation: {
    fontSize: 14,
    color: spaceColors.starlightMuted,
  },
  topicsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: spaceColors.border,
  },
  topicName: {
    fontSize: 14,
    color: spaceColors.starlight,
    width: '35%',
  },
  masteryBar: {
    flex: 1,
    height: 6,
    backgroundColor: spaceColors.locked,
    borderRadius: 3,
    marginHorizontal: spacing.sm,
  },
  masteryFill: {
    height: 6,
    borderRadius: 3,
  },
  masteryStatus: {
    fontSize: 12,
    color: spaceColors.starlightDim,
    width: 70,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
})

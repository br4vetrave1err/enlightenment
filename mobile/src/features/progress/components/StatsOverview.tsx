import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { getLearningStats, LearningStats } from '../../../lib/api-client';
import { CourseCardSkeleton } from '../../courses/components/CourseCardSkeleton';

export function StatsOverview() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getLearningStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <CourseCardSkeleton />;
  }

  if (!stats) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="time" size={24} color="#00D4FF" />
        <Text style={styles.value}>{stats.time_spent_total_hours}</Text>
        <Text style={styles.label}>Hours</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={24} color="#00D4FF" />
        <Text style={styles.value}>{stats.total_nodes_completed}</Text>
        <Text style={styles.label}>Completed</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="flame" size={24} color="#00D4FF" />
        <Text style={styles.value}>{stats.current_streak_days}</Text>
        <Text style={styles.label}>Day Streak</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="trending-up" size={24} color="#00D4FF" />
        <Text style={styles.value}>{stats.nodes_per_week}</Text>
        <Text style={styles.label}>Per Week</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});

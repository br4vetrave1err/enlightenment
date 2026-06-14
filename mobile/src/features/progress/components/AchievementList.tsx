import { View, StyleSheet, Text, FlatList } from 'react-native';
import { AchievementCard } from './AchievementCard';
import { useEffect, useState } from 'react';
import { getLearningStats, getKnowledgeProfile } from '../../../lib/api-client';
import { CourseCardSkeleton } from '../../courses/components/CourseCardSkeleton';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function AchievementList() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const [stats, profile] = await Promise.all([
          getLearningStats(),
          getKnowledgeProfile(),
        ]);

        const unlockedAchievements: Achievement[] = [];

        // First steps achievement
        if (stats.total_nodes_completed > 0) {
          unlockedAchievements.push({
            id: 'first-steps',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'rocket',
            unlocked: true,
          });
        }

        // Streak achievement
        if (stats.current_streak_days >= 7) {
          unlockedAchievements.push({
            id: 'streak-master',
            title: 'Streak Master',
            description: 'Maintain a 7-day streak',
            icon: 'flame',
            unlocked: true,
          });
        }

        // Skills mastered achievement
        const masteredSkills = profile.topics.filter(t => t.status === 'mastered');
        if (masteredSkills.length > 0) {
          unlockedAchievements.push({
            id: 'skills-mastered',
            title: 'Skills Mastered',
            description: `Mastered ${masteredSkills.length} skill(s)`,
            icon: 'star',
            unlocked: true,
          });
        }

        // Add locked achievements for milestones not yet reached
        const allAchievements: Achievement[] = [
          ...unlockedAchievements,
          {
            id: 'first-steps',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'rocket',
            unlocked: stats.total_nodes_completed > 0,
          },
          {
            id: 'streak-master',
            title: 'Streak Master',
            description: 'Maintain a 7-day streak',
            icon: 'flame',
            unlocked: stats.current_streak_days >= 7,
          },
          {
            id: 'course-conqueror',
            title: 'Course Conqueror',
            description: 'Complete your first course',
            icon: 'trophy',
            unlocked: stats.courses_in_progress === 0 && stats.total_nodes_completed > 10,
          },
          {
            id: 'speed-learner',
            title: 'Speed Learner',
            description: 'Complete 5 lessons in one week',
            icon: 'flash',
            unlocked: stats.nodes_per_week >= 5,
          },
        ];

        // Deduplicate by id
        const seen = new Set<string>();
        const uniqueAchievements = allAchievements.filter(a => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });

        setAchievements(uniqueAchievements);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  if (loading) {
    return <CourseCardSkeleton />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AchievementCard achievement={item} />}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
});

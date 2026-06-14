import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { getKnowledgeProfile, KnowledgeProfile } from '../../../lib/api-client';
import { CourseCardSkeleton } from '../../courses/components/CourseCardSkeleton';

export function SkillTree() {
  const [profile, setProfile] = useState<KnowledgeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getKnowledgeProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load skill tree:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return <CourseCardSkeleton />;
  }

  if (!profile || profile.topics.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Skill Tree</Text>
        <Text style={styles.emptyText}>No skills tracked yet. Start learning!</Text>
      </View>
    );
  }

  const getIconForStatus = (status: string) => {
    switch (status) {
      case 'mastered': return 'star';
      case 'proficient': return 'checkmark-circle';
      case 'learning': return 'ellipse';
      default: return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skill Tree</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {profile.topics.map((topic, index) => (
          <View key={index} style={styles.skill}>
            <View style={[styles.iconContainer, topic.status === 'mastered' && styles.iconMastered]}>
              <Ionicons name={getIconForStatus(topic.status) as any} size={32} color="#00D4FF" />
            </View>
            <Text style={styles.skillName}>{topic.name}</Text>
            <View style={styles.levelBar}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.levelDot, i < topic.mastery_level && styles.levelDotActive]}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  skill: {
    alignItems: 'center',
    marginRight: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconMastered: {
    backgroundColor: '#2A2A3E',
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  skillName: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelBar: {
    flexDirection: 'row',
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A3E',
    marginHorizontal: 2,
  },
  levelDotActive: {
    backgroundColor: '#00D4FF',
  },
});

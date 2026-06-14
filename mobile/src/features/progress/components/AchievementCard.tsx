import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <View style={[styles.container, !achievement.unlocked && styles.locked]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={achievement.icon as any}
          size={24}
          color={achievement.unlocked ? '#00D4FF' : '#666666'}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !achievement.unlocked && styles.titleLocked]}>
          {achievement.title}
        </Text>
        <Text style={styles.description}>{achievement.description}</Text>
      </View>
      {achievement.unlocked && (
        <Ionicons name="checkmark-circle" size={20} color="#00D4FF" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  titleLocked: {
    color: '#666666',
  },
  description: {
    fontSize: 12,
    color: '#666666',
  },
});

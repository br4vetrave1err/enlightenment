import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
  streak: number;
  longestStreak: number;
}

export function StreakCounter({ streak, longestStreak }: StreakCounterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.currentStreak}>
        <Ionicons name="flame" size={32} color="#FFD700" />
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>
      <View style={styles.longestStreak}>
        <Text style={styles.longestLabel}>Longest: {longestStreak} days</Text>
      </View>
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
    marginBottom: 16,
  },
  currentStreak: {
    flex: 1,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  longestStreak: {
    alignItems: 'flex-end',
  },
  longestLabel: {
    fontSize: 12,
    color: '#666666',
  },
});

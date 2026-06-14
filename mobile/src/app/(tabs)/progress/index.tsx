import { View, StyleSheet, ScrollView } from 'react-native';
import { StatsOverview } from '../../../features/progress/components/StatsOverview';
import { SkillTree } from '../../../features/progress/components/SkillTree';
import { AchievementList } from '../../../features/progress/components/AchievementList';

export default function ProgressScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>Your Progress</View>
      </View>

      <StatsOverview />
      <SkillTree />
      <AchievementList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

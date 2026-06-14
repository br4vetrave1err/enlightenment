import { View, StyleSheet, Text } from 'react-native';
import { OrbitProgress } from '../../../components/ui/OrbitProgress';
import { StarField } from '../../../components/ui/StarField';
import { Course } from '../../../lib/api-client';

interface CourseHeroProps {
  course: Course;
}

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <View style={styles.container}>
      <StarField />
      <View style={styles.progressContainer}>
        <OrbitProgress progress={course.progress} size={120} />
      </View>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.meta}>
        {course.completedNodes} / {course.totalNodes} lessons completed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#0A0A1A',
  },
  progressContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: '#00D4FF',
  },
});

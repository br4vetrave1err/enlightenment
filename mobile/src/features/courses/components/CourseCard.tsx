import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Course } from '../../../lib/api-client';
import { OrbitProgress } from '../../../components/ui/OrbitProgress';
import { HolographicCard } from '../../../components/ui/HolographicCard';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  return (
    <HolographicCard onPress={() => router.push(`/courses/${course.id}`)}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <OrbitProgress progress={course.progress} size={60} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>
          <Text style={styles.meta}>
            {course.completedNodes} / {course.totalNodes} lessons
          </Text>
        </View>
      </View>
    </HolographicCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
  },
  progressContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#00D4FF',
  },
});

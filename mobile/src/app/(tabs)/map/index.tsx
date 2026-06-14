import { View, StyleSheet, Text } from 'react-native';
import { useEffect } from 'react';
import { NodeGraph } from '../../../features/map/components/NodeGraph';
import { useCourseStore } from '../../../lib/store/course-store';

export default function MapScreen() {
  const { courses, fetchCourses } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const firstCourseId = courses.length > 0 ? courses[0].id : undefined;

  return (
    <View style={styles.container}>
      <NodeGraph courseId={firstCourseId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
});

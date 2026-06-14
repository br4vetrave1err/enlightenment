import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCourseStore } from '../../../lib/store/course-store';
import { CourseHero } from '../../../features/courses/components/CourseHero';
import { CourseSyllabus } from '../../../features/courses/components/CourseSyllabus';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchCourse, currentCourse, isLoading } = useCourseStore();

  useEffect(() => {
    if (id) fetchCourse(id);
  }, [id]);

  if (isLoading || !currentCourse) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <CourseHero course={currentCourse} />
      <View style={styles.content}>
        <Text style={styles.description}>{currentCourse.description}</Text>
        <CourseSyllabus courseId={currentCourse.id} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A1A',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
  },
});

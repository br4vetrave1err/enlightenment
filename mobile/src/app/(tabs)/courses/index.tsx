import { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList } from 'react-native';
import { useCourseStore } from '../../../lib/store/course-store';
import { CourseCard } from '../../../features/courses/components/CourseCard';

export default function CoursesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { courses, fetchCourses, isLoading } = useCourseStore();

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourseCard course={item} />}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={fetchCourses}
      />
    </View>
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
  searchInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
});

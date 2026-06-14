import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCourse, RoadmapGraph } from '../../../lib/api-client';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  available: boolean;
}

interface CourseSyllabusProps {
  courseId: string;
}

export function CourseSyllabus({ courseId }: CourseSyllabusProps) {
  const [expanded, setExpanded] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        const course = await getCourse(courseId);
        const mappedLessons = course.nodes.map((node) => ({
          id: node.node_id,
          title: node.title,
          duration: `${node.estimated_minutes} min`,
          completed: node.status === 'completed',
          available: node.status === 'available' || node.status === 'in_progress',
        }));
        setLessons(mappedLessons);
      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={[styles.lessonItem, !item.available && styles.lessonLocked]}
      disabled={!item.available}
    >
      <View style={styles.lessonIcon}>
        <Ionicons
          name={item.completed ? 'checkmark-circle' : item.available ? 'play-circle' : 'lock-closed'}
          size={24}
          color={item.completed ? '#00D4FF' : item.available ? '#FFD700' : '#666666'}
        />
      </View>
      <View style={styles.lessonInfo}>
        <Text style={[styles.lessonTitle, !item.available && styles.lessonTextLocked]}>
          {item.title}
        </Text>
        <Text style={styles.lessonDuration}>{item.duration}</Text>
      </View>
      {item.completed && (
        <Ionicons name="checkmark-done" size={20} color="#00D4FF" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
          <Text style={styles.headerTitle}>Syllabus</Text>
          <Ionicons name="chevron-down" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.headerTitle}>Syllabus ({lessons.length} lessons)</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#FFD700"
        />
      </TouchableOpacity>
      {expanded && (
        <FlatList
          data={lessons}
          renderItem={renderLesson}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16162A',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#16162A',
    borderRadius: 8,
  },
  lessonLocked: {
    opacity: 0.5,
  },
  lessonIcon: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonTextLocked: {
    color: '#666666',
  },
  lessonDuration: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
});

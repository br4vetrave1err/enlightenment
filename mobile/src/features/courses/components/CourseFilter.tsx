import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';

interface CourseFilterProps {
  categories: string[];
  selected: string[];
  onSelect: (category: string) => void;
}

export function CourseFilter({ categories, selected, onSelect }: CourseFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.pill, selected.includes(category) && styles.pillActive]}
          onPress={() => onSelect(category)}
        >
          <Text style={[styles.pillText, selected.includes(category) && styles.pillTextActive]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#00D4FF',
  },
  pillText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#000000',
  },
});

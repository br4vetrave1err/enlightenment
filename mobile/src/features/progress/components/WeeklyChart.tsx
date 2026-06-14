import { View, StyleSheet, Text } from 'react-native';

interface WeeklyChartProps {
  data: number[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Activity</Text>
      <View style={styles.chart}>
        {data.map((value, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={[styles.bar, { height: `${(value / maxValue) * 100}%` }]} />
            <Text style={styles.day}>{days[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    backgroundColor: '#00D4FF',
    borderRadius: 4,
  },
  day: {
    fontSize: 10,
    color: '#666666',
    marginTop: 8,
  },
});

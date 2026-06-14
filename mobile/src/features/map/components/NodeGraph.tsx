import { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated, Text } from 'react-native';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { getCourse, RoadmapGraph } from '../../../lib/api-client';
import { useCourseStore } from '../../../lib/store/course-store';

const { width, height } = Dimensions.get('window');

interface NodeGraphProps {
  courseId?: string;
}

export function NodeGraph({ courseId }: NodeGraphProps = {}) {
  const [graph, setGraph] = useState<RoadmapGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentCourse, fetchCourse } = useCourseStore();

  useEffect(() => {
    async function loadGraph() {
      setLoading(true);
      try {
        if (courseId) {
          await fetchCourse(courseId);
          setGraph(currentCourse);
        }
      } catch (error) {
        console.error('Failed to load graph:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [courseId, currentCourse, fetchCourse]);

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading roadmap...</Text>
      </View>
    );
  }

  if (!graph) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Select a course to view roadmap</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      {graph.edges.map((edge, index) => {
        const fromNode = graph.nodes.find((n) => n.node_id === edge.from);
        const toNode = graph.nodes.find((n) => n.node_id === edge.to);
        if (fromNode && toNode) {
          return (
            <GraphEdge
              key={`${edge.from}-${edge.to}`}
              from={{
                id: fromNode.node_id,
                title: fromNode.title,
                x: fromNode.position.x,
                y: fromNode.position.y,
                status: fromNode.status,
              }}
              to={{
                id: toNode.node_id,
                title: toNode.title,
                x: toNode.position.x,
                y: toNode.position.y,
                status: toNode.status,
              }}
            />
          );
        }
        return null;
      })}

      {graph.nodes.map((node) => (
        <GraphNode
          key={node.node_id}
          node={{
            id: node.node_id,
            title: node.title,
            x: node.position.x,
            y: node.position.y,
            status: node.status,
          }}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666666',
    fontSize: 14,
  },
});

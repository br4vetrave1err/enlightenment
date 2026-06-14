import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Node {
  id: string;
  title: string;
  x: number;
  y: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

interface GraphNodeProps {
  node: Node;
}

export function GraphNode({ node }: GraphNodeProps) {
  const getStatusColor = () => {
    switch (node.status) {
      case 'completed':
        return '#00D4FF';
      case 'in_progress':
        return '#FFD700';
      case 'available':
        return '#4CAF50';
      case 'locked':
      default:
        return '#666666';
    }
  };

  const getStatusIcon = () => {
    switch (node.status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'ellipse';
      case 'available':
        return 'arrow-forward-circle';
      case 'locked':
      default:
        return 'lock-closed';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { left: node.x, top: node.y, borderColor: getStatusColor() }]}
      disabled={node.status === 'locked'}
    >
      <Ionicons name={getStatusIcon() as any} size={24} color={getStatusColor()} />
      <Text style={[styles.title, { color: getStatusColor() }]}>{node.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120,
    height: 80,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
});

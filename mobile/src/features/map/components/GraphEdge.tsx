import { View, StyleSheet } from 'react-native';

interface Node {
  id: string;
  x: number;
  y: number;
  status: 'locked' | 'current' | 'completed';
}

interface GraphEdgeProps {
  from: Node;
  to: Node;
}

export function GraphEdge({ from, to }: GraphEdgeProps) {
  const getLineColor = () => {
    if (from.status === 'completed' && to.status === 'completed') {
      return '#00D4FF';
    }
    if (from.status === 'completed' && to.status === 'current') {
      return '#FFD700';
    }
    return '#2A2A3E';
  };

  const getNodeCenter = (node: Node) => ({
    x: node.x + 60,
    y: node.y + 40,
  });

  const fromCenter = getNodeCenter(from);
  const toCenter = getNodeCenter(to);

  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <View
      style={[
        styles.container,
        {
          left: fromCenter.x,
          top: fromCenter.y,
          width: length,
          transform: [{ rotate: `${angle}deg` }],
          backgroundColor: getLineColor(),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left',
  },
});

import type { Node, Edge } from '@xyflow/react';

interface Topic {
  id: string;
  name: string;
  status: string;
  type?: string;
  difficulty?: string;
  estimated_hours?: number;
  tags?: string[];
  resources?: any[];
}

interface Phase {
  id: string;
  name: string;
  topics: Topic[];
}

interface TopicGraphEdge {
  from: string;
  to: string;
  type: string;
}

export function getLayoutedElements(
  phases: Phase[],
  topicGraph: TopicGraphEdge[],
  searchTerm: string = '',
  selectedVariantSkipTopics: Set<string> = new Set()
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 56;
  const PHASE_PADDING_X = 40;
  const PHASE_PADDING_Y = 50;
  const PHASE_SPACING = 60;
  
  let currentY = 80;

  const topicNodeMap = new Map<string, Node>();

  phases.forEach((phase) => {
    // Filter out topics that are skipped by the active variant
    const activeTopics = phase.topics.filter(
      (topic) => !selectedVariantSkipTopics.has(topic.id)
    );

    if (activeTopics.length === 0) return;

    // Arrange topics in a clean, vertical 2-column grid
    const cols = Math.min(2, activeTopics.length);
    const colWidth = NODE_WIDTH + 40; // Spacing between columns
    const rowHeight = NODE_HEIGHT + 35; // Spacing between rows

    const rowsCount = Math.ceil(activeTopics.length / cols);
    const groupWidth = Math.max(500, cols * colWidth - 40 + PHASE_PADDING_X * 2);
    const groupHeight = rowsCount * rowHeight - 35 + PHASE_PADDING_Y * 2;
    const groupX = 250 - groupWidth / 2; // Center horizontally at X = 250

    // 2. Create the parent group node
    const phaseGroupNode: Node = {
      id: phase.id,
      type: 'groupNode',
      data: { label: phase.name },
      position: { x: groupX, y: currentY },
      style: {
        width: groupWidth,
        height: groupHeight,
      },
    };
    nodes.push(phaseGroupNode);

    // 3. Create positioned child nodes relative to parent
    activeTopics.forEach((topic, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      // Calculate local coordinates inside the parent group
      const localX = PHASE_PADDING_X + col * colWidth;
      const localY = PHASE_PADDING_Y + row * rowHeight;

      // Determine if searched
      const isSearched =
        searchTerm === '' ||
        topic.name.toLowerCase().includes(searchTerm.toLowerCase());

      const topicNode: Node = {
        id: topic.id,
        parentId: phase.id,
        type: 'roadmapNode',
        data: {
          label: topic.name,
          status: topic.status,
          type: topic.type || 'core',
          isDimmed: !isSearched,
          topicObj: topic,
        },
        position: { x: localX, y: localY },
        extent: 'parent',
      };

      nodes.push(topicNode);
      topicNodeMap.set(topic.id, topicNode);
    });

    // Advance currentY by groupHeight and phaseSpacing
    currentY += groupHeight + PHASE_SPACING;
  });

  // 4. Map the global topic graph edges
  topicGraph.forEach((edge, index) => {
    // Only add edge if both source and target nodes exist/are visible
    if (topicNodeMap.has(edge.from) && topicNodeMap.has(edge.to)) {
      edges.push({
        id: `edge-${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        type: 'roadmapEdge',
        data: {
          type: edge.type,
          status: getEdgeStatus(edge.from, edge.to, topicNodeMap),
        },
      });
    }
  });

  return { nodes, edges };
}

function getEdgeStatus(fromId: string, toId: string, nodeMap: Map<string, Node>): string {
  const fromNode = nodeMap.get(fromId);
  const toNode = nodeMap.get(toId);
  if (!fromNode || !toNode) return 'locked';

  const fromStatus = fromNode.data.status;
  const toStatus = toNode.data.status;

  if (fromStatus === 'completed' || fromStatus === 'done') {
    if (toStatus === 'completed' || toStatus === 'done' || toStatus === 'in_progress') {
      return 'active';
    }
    return 'unlocked';
  }
  return 'locked';
}

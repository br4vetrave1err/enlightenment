import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../lib/api';
import { 
  Check, 
  Lock, 
  ArrowLeft, 
  Compass, 
  Gift 
} from 'lucide-react';
import './RoadmapPath.css';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';
import { TopicDetailsPanel } from '../../components/TopicDetailsPanel';
import { VariantSelector } from '../../components/VariantSelector';
import type { RoadmapData, UserProgressData } from '../../types';

const isStructuralNode = (nodeId: string, title: string, courseTitle?: string): boolean => {
  if (!title) return true;
  if (title === nodeId) return true;
  const t = title.toLowerCase();
  if (courseTitle && t === courseTitle.toLowerCase()) return true;
  return (
    t === 'horizontal node' ||
    t === 'vertical node' ||
    t === 'roadmap.sh' ||
    t.includes('interactive version') ||
    t.includes('has lots of services') ||
    t.includes('best way to learn') ||
    t.includes('continue learning') ||
    t.includes('relevant tracks') ||
    t.includes('detailed version')
  );
};

// Compute visible nodes using BFS traversal starting from in-degree 0 nodes.
// If a node is disabled (e.g. skipped or structural), we still traverse through it to reach its children
// (Edge Bridging), but the disabled node itself will not be added to the visible set.
function getVisibleNodes(nodes: any[], edges: any[], disabledNodeIds: Set<string>): Set<string> {
  const visible = new Set<string>();
  const traversed = new Set<string>();
  const adjList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(n => {
    adjList.set(n.node_id, []);
    inDegree.set(n.node_id, 0);
  });

  edges.forEach(e => {
    const source = e.from_node || e.from || e.source;
    const target = e.to_node || e.to || e.target;
    if (source && target && adjList.has(source) && adjList.has(target)) {
      adjList.get(source)!.push(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    }
  });

  const queue: string[] = [];
  nodes.forEach(n => {
    if ((inDegree.get(n.node_id) || 0) === 0) {
      queue.push(n.node_id);
      traversed.add(n.node_id);
      if (!disabledNodeIds.has(n.node_id)) {
        visible.add(n.node_id);
      }
    }
  });

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adjList.get(curr) || [];
    neighbors.forEach(neighbor => {
      if (!traversed.has(neighbor)) {
        traversed.add(neighbor);
        queue.push(neighbor);
        if (!disabledNodeIds.has(neighbor)) {
          visible.add(neighbor);
        }
      }
    });
  }

  return visible;
}

// Topological sort algorithm to linearize the course DAG
function sortNodesTopologically(nodes: any[], edges: any[]): any[] {
  const nodeMap = new Map(nodes.map(n => [n.node_id, n]));
  const adjList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(n => {
    adjList.set(n.node_id, []);
    inDegree.set(n.node_id, 0);
  });

  edges.forEach(e => {
    const source = e.from_node || e.from || e.source;
    const target = e.to_node || e.to || e.target;
    if (source && target && adjList.has(source) && adjList.has(target)) {
      adjList.get(source)!.push(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    }
  });

  const queue: string[] = [];
  nodes.forEach(n => {
    if ((inDegree.get(n.node_id) || 0) === 0) {
      queue.push(n.node_id);
    }
  });

  const sortedIds: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    sortedIds.push(curr);
    const neighbors = adjList.get(curr) || [];
    neighbors.forEach(neighbor => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  const sortedNodes = sortedIds.map(id => nodeMap.get(id)!).filter(Boolean);
  const sortedSet = new Set(sortedIds);
  nodes.forEach(n => {
    if (!sortedSet.has(n.node_id)) {
      sortedNodes.push(n);
    }
  });

  return sortedNodes;
}

function mapBackendToRoadmap(data: any): RoadmapData {
  if (!data) return { roadmap: {} as any };

  return {
    roadmap: {
      id: data.course_id,
      slug: data.course_id,
      title: data.title,
      description: data.description || `Step by step learning path for ${data.title}`,
      roadmap_type: 'skill',
      version: '2.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      meta: data.meta || {
        level: 'beginner',
        total_duration: '3 months',
        total_phases: data.phases ? data.phases.length : 0,
        total_topics: 0,
        tags: [],
        prerequisites: []
      },
      phases: data.phases ? data.phases.map((p: any) => ({
        ...p,
        topics: (p.topics || []).map((t: any) => ({
          ...t,
          resources: (t.resources || t.links || []).map((r: any) => ({
            id: r.id || Math.random().toString(),
            title: r.title || r.label || 'Resource Link',
            url: r.url || r.href || null,
            type: r.type || 'article',
            free: r.free ?? true,
            duration_minutes: r.duration_minutes ?? null,
            quality_score: r.quality_score ?? 5,
            verified: r.verified ?? true,
            added_at: r.added_at || new Date().toISOString(),
            language: r.language || 'en'
          }))
        }))
      })) : [],
      topic_graph: data.topic_graph || [],
      variants: data.variants || []
    }
  };
}

function mapBackendToProgress(data: any): UserProgressData {
  if (!data) return { user_progress: { topics: [] } } as any;

  const flatTopics = data.phases 
    ? data.phases.flatMap((p: any) => p.topics) 
    : [];
    
  const topics = flatTopics.map((node: any) => ({
    topic_id: node.id || node.node_id,
    status: node.status || 'not_started',
    started_at: null,
    done_at: null,
    note: null,
    resource_interactions: []
  }));

  return {
    user_progress: {
      user_id: 'current-user',
      roadmap_id: data.course_id,
      roadmap_version: '2.0.0',
      variant_id: null,
      percent_complete: 0,
      started_at: null,
      last_activity_at: null,
      estimated_completion: null,
      topics,
      milestones: []
    }
  };
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Persistence of skipped branch node IDs
  const [disabledNodeIds, setDisabledNodeIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`disabled-nodes-${courseId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Interactive elements states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      const res = await authFetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setCourse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course data.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const courseNodes = course?.phases 
    ? course.phases.flatMap((p: any) => p.topics.map((t: any) => ({ node_id: t.id, title: t.name, ...t })))
    : [];
    
  const courseEdges = course?.topic_graph 
    ? course.topic_graph.map((edge: any) => ({ from_node: edge.from, to_node: edge.to, type: edge.type }))
    : [];

  // Identify structural/layout nodes to filter them out of the visible roadmap
  const structuralNodeIds = new Set<string>(
    courseNodes
      .filter((n: any) => isStructuralNode(n.node_id, n.title, course?.title))
      .map((n: any) => n.node_id as string)
  );

  // Combine user-skipped nodes and structural layout nodes for edge bridging
  const skippedAndStructuralNodeIds = new Set<string>([
    ...Array.from(disabledNodeIds),
    ...Array.from(structuralNodeIds)
  ]);

  // Compute visible node IDs using BFS visibility solver with edge bridging
  const visibleNodeIds = course 
    ? getVisibleNodes(courseNodes, courseEdges, skippedAndStructuralNodeIds) 
    : new Set<string>();
  
  // Filter course nodes to keep only visible ones
  const visibleNodes = course ? courseNodes.filter((n: any) => visibleNodeIds.has(n.node_id)) : [];
  
  // Sort visible nodes topologically
  const sortedVisibleNodes = course ? sortNodesTopologically(visibleNodes, courseEdges) : [];
  
  // Map back to phases structure for useRoadmapProgress
  const visibleNodeIdSet = new Set(sortedVisibleNodes.map(n => n.node_id));
  const nodeIndexMap = new Map(sortedVisibleNodes.map((n, idx) => [n.node_id, idx]));
  
  const mappedCourseData = course ? { 
    ...course, 
    phases: course.phases.map((p: any) => {
      const filteredTopics = p.topics.filter((t: any) => visibleNodeIdSet.has(t.id));
      filteredTopics.sort((a: any, b: any) => {
        const idxA = nodeIndexMap.get(a.id) ?? 0;
        const idxB = nodeIndexMap.get(b.id) ?? 0;
        return idxA - idxB;
      });
      return {
        ...p,
        topics: filteredTopics
      };
    })
  } : null;
  const roadmapData = mapBackendToRoadmap(mappedCourseData);
  const progressData = mapBackendToProgress(mappedCourseData);

  const { 
    getTopicStatus, 
    selectedVariantId, 
    setSelectedVariantId,
    isPhaseSkipped,
    isTopicSkipped
  } = useRoadmapProgress(
    roadmapData, 
    progressData
  );

  const handleNodeClick = (item: any) => {
    if (item.status === 'locked') return;
    
    if (selectedNodeId === item.id) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(item.id);
    }
  };

  const openDrawer = async (item: any) => {
    setSelectedNodeId(null);
    setSelectedTopic(item.topicObj);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError('');
    setNodeDetails(null);
    
    try {
      const res = await authFetch(`/api/courses/${courseId}/nodes/${item.id}`);
      const data = await res.json();
      setNodeDetails(data);
    } catch (err: any) {
      setDrawerError(err.message || 'Error downloading database logs.');
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedTopic(null);
      setNodeDetails(null);
    }, 300);
  };

  const handleMarkComplete = async (nodeId: string) => {
    setMarkingComplete(true);
    try {
      await authFetch(`/api/user/progress/${courseId}/node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: nodeId,
          action: 'complete',
          time_spent_seconds: 120
        })
      });
      
      closeDrawer();
      setLoading(true);
      await fetchCourseData();
    } catch (err: any) {
      alert(`Progress transmission failed: ${err.message}`);
    } finally {
      setMarkingComplete(false);
    }
  };

  const toggleBranch = useCallback((nodeId: string) => {
    setDisabledNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      localStorage.setItem(`disabled-nodes-${courseId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [courseId]);

  if (loading && !course) {
    return <div className="p-8 text-center text-slate-400 italic">Scanning the constellation map...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  // 1. Get filtered list of phases and topics based on active variant
  const visiblePhases = roadmapData.roadmap.phases.filter(p => !isPhaseSkipped(p.id));
  
  // 2. Generate flat positioned items list
  let currentY = 40;
  let circleIndex = 0;
  const positionedItems: any[] = [];

  visiblePhases.forEach((phase) => {
    // Add phase header node
    positionedItems.push({
      id: phase.id,
      title: phase.name,
      status: 'available',
      type: 'header',
      x: 250,
      y: currentY + 40
    });
    currentY += 120;

    // Add topic nodes
    phase.topics.forEach((topic) => {
      if (isTopicSkipped(topic.id)) return;

      const isChest = topic.type === 'optional' || topic.name.toLowerCase().includes('chest') || (circleIndex > 0 && circleIndex % 5 === 0);
      const xOffset = Math.sin(circleIndex * 0.9) * 80;
      const x = 250 + xOffset;

      positionedItems.push({
        id: topic.id,
        title: topic.name,
        status: getTopicStatus(topic.id),
        type: isChest ? 'chest' : 'lesson',
        topicObj: topic,
        x,
        y: currentY + 38
      });

      currentY += 145;
      circleIndex++;
    });
  });

  const circularItems = positionedItems.filter(item => item.type !== 'header');
  const activeItem = 
    circularItems.find(item => item.status === 'in_progress') || 
    circularItems.find(item => item.status === 'available') ||
    circularItems.find(item => item.status !== 'completed' && item.status !== 'done' && item.status !== 'locked');

  // Generate SVG Bezier Path connectors
  const renderPaths = () => {
    const paths: React.ReactNode[] = [];
    for (let i = 0; i < circularItems.length - 1; i++) {
      const pStart = circularItems[i];
      const pEnd = circularItems[i + 1];
      
      const isTargetUnlocked = 
        pEnd.status === 'completed' || 
        pEnd.status === 'done' ||
        pEnd.status === 'in_progress' || 
        pEnd.status === 'available';
        
      const d = `M ${pStart.x} ${pStart.y} C ${pStart.x} ${pStart.y + 65}, ${pEnd.x} ${pEnd.y - 65}, ${pEnd.x} ${pEnd.y}`;
      
      paths.push(
        <g key={`seg-${i}`}>
          <path
            d={d}
            fill="none"
            stroke={isTargetUnlocked ? 'rgba(0, 212, 255, 0.15)' : 'rgba(42, 42, 63, 0.2)'}
            strokeWidth={14}
            strokeLinecap="round"
            style={{ filter: isTargetUnlocked ? 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.5))' : 'none' }}
          />
          <path
            d={d}
            fill="none"
            stroke={isTargetUnlocked ? 'var(--starlight)' : '#232338'}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={!isTargetUnlocked ? '6,6' : 'none'}
          />
        </g>
      );
    }
    return paths;
  };

  const svgHeight = positionedItems.length > 0 ? positionedItems[positionedItems.length - 1].y + 120 : 800;

  // Retrieve option nodes for the branch selector widget in the drawer
  const getBranchChildNodes = () => {
    if (!courseEdges || !courseNodes || !selectedTopic) return [];
    
    const childEdges = courseEdges.filter((e: any) => e.from_node === selectedTopic.id);
    
    return childEdges.map((e: any) => {
      return courseNodes.find((n: any) => n.node_id === e.to_node);
    }).filter(Boolean);
  };

  const branchChildNodes = getBranchChildNodes();

  // Merge selected topic data with fetched details
  const mergedTopicObj = selectedTopic ? {
    ...selectedTopic,
    description: nodeDetails?.content || selectedTopic.description,
    resources: nodeDetails?.links || selectedTopic.resources
  } : null;

  return (
    <div className="roadmap-page-container">
      <div className="roadmap-scroll-area">
        
        {/* Header Block */}
        <div className="roadmap-header-banner">
          <div className="roadmap-header-card">
            <div>
              <h2>{course?.title}</h2>
              <p>Follow the planetary serpentine checkposts.</p>
            </div>
            <button className="roadmap-back-btn" onClick={() => navigate('/courses')}>
              <ArrowLeft size={16} /> Map Room
            </button>
          </div>
        </div>

        {/* Variant Selector */}
        {roadmapData.roadmap.variants && roadmapData.roadmap.variants.length > 0 && (
          <VariantSelector 
            variants={roadmapData.roadmap.variants} 
            selectedVariantId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />
        )}

        {/* Serpentine Graph Path Canvas */}
        <div className="roadmap-path-wrapper" style={{ height: `${svgHeight}px` }}>
          
          {/* SVG Backing Connector lines */}
          <svg className="roadmap-svg-canvas" viewBox={`0 0 500 ${svgHeight}`}>
            {renderPaths()}
          </svg>

          {/* Astronaut Mascot overlay */}
          {activeItem && (
            <div 
              className="roadmap-mascot"
              style={{
                left: `${activeItem.x}px`,
                top: `${activeItem.y - 70}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <svg viewBox="0 0 64 64" width="54" height="54">
                <circle cx="32" cy="24" r="14" fill="#e0e0ff" />
                <rect x="22" y="16" width="20" height="12" rx="6" fill="#0a0a1a" stroke="#00D4FF" strokeWidth="2" />
                <circle cx="38" cy="20" r="2" fill="#ffffff" />
                <rect x="20" y="38" width="24" height="18" rx="8" fill="#e0e0ff" />
                <rect x="16" y="35" width="32" height="16" rx="4" fill="#8a8aab" />
                <rect x="14" y="38" width="6" height="10" rx="3" fill="#8a8aab" />
                <rect x="44" y="38" width="6" height="10" rx="3" fill="#8a8aab" />
                <polygon points="32,43 33.5,46 36.5,46 34.2,47.5 35,50.5 32,49 29,50.5 29.8,47.5 27.5,46 30.5,46" fill="#FF00FF" />
              </svg>
            </div>
          )}

          {/* Render individual items (nodes and step banners) */}
          {positionedItems.map((item) => {
            const isHeader = item.type === 'header';
            
            if (isHeader) {
              return (
                <div 
                  key={item.id}
                  className="roadmap-unit-banner-wrapper"
                  style={{ left: `${item.x}px`, top: `${item.y}px` }}
                >
                  <div className="roadmap-unit-banner">
                    <h3 className="roadmap-unit-title">{item.title}</h3>
                    <p className="roadmap-unit-desc">Launch Checkpoint Sequence</p>
                  </div>
                </div>
              );
            }
            
            const isCompleted = item.status === 'completed' || item.status === 'done';
            const isActive = activeItem?.id === item.id;
            const isLocked = item.status === 'locked';
            const isAvailable = item.status === 'available' || item.status === 'in_progress';

            let circleClass = 'locked';
            if (isCompleted) circleClass = 'completed';
            else if (isActive) circleClass = 'active';
            else if (isAvailable) circleClass = 'available';

            return (
              <div 
                key={item.id}
                className="roadmap-node-wrapper"
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
              >
                {isActive && <div className="active-pulse-ring" />}

                <div 
                  className={`roadmap-node-circle ${circleClass}`}
                  onClick={() => handleNodeClick(item)}
                >
                  {isCompleted ? (
                    <Check size={30} strokeWidth={3.5} color="#fff" />
                  ) : isLocked ? (
                    <Lock size={26} strokeWidth={2.5} />
                  ) : item.type === 'chest' ? (
                    <Gift size={28} strokeWidth={2.5} />
                  ) : (
                    <Compass size={28} strokeWidth={2.5} />
                  )}
                </div>

                <span className="roadmap-node-label">{item.title}</span>

                {selectedNodeId === item.id && (
                  <div className="roadmap-tooltip">
                    <h4 className="roadmap-tooltip-title">{item.title}</h4>
                    <p className="roadmap-tooltip-meta">
                      {item.type === 'chest' ? '💎 Reward Station' : `⏱️ 30 mins lesson`}
                    </p>
                    <button 
                      className="roadmap-tooltip-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(item);
                      }}
                    >
                      {isCompleted ? 'Review Logs' : 'Begin Mission'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="roadmap-drawer-backdrop" onClick={closeDrawer} />
          
          <TopicDetailsPanel 
            topic={mergedTopicObj} 
            onClose={closeDrawer} 
            isLoading={drawerLoading}
            error={drawerError}
            onMarkComplete={handleMarkComplete}
            isCompleted={selectedTopic ? (getTopicStatus(selectedTopic.id) === 'done' || getTopicStatus(selectedTopic.id) === 'completed') : false}
            markingComplete={markingComplete}
            branchChildNodes={branchChildNodes}
            disabledNodeIds={disabledNodeIds}
            onToggleBranch={toggleBranch}
          />
        </>
      )}
    </div>
  );
}

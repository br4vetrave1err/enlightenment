import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../lib/api';
import { 
  ArrowLeft, 
  Search
} from 'lucide-react';
import './RoadmapPath.css';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';
import { TopicDetailsPanel } from '../../components/TopicDetailsPanel';
import { VariantSelector } from '../../components/VariantSelector';
import type { RoadmapData, UserProgressData } from '../../types';

import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getLayoutedElements } from '../../features/courses/utils/layout';
import RoadmapNode from './RoadmapNode';
import GroupNode from './GroupNode';
import RoadmapEdge from './RoadmapEdge';

const nodeTypes = {
  roadmapNode: RoadmapNode,
  groupNode: GroupNode,
};

const edgeTypes = {
  roadmapEdge: RoadmapEdge,
};

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
  
  const [searchTerm, setSearchTerm] = useState('');

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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

  const roadmapData = useMemo(() => mapBackendToRoadmap(course), [course]);
  const progressData = useMemo(() => mapBackendToProgress(course), [course]);

  const { 
    getTopicStatus, 
    selectedVariantId, 
    setSelectedVariantId
  } = useRoadmapProgress(
    roadmapData, 
    progressData
  );

  const handleStatusToggle = useCallback(async (nodeId: string, currentStatus: string) => {
    const isCompleted = currentStatus === 'completed' || currentStatus === 'done';
    const nextAction = isCompleted ? 'not_started' : 'complete';
    
    setMarkingComplete(true);
    try {
      await authFetch(`/api/user/progress/${courseId}/node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: nodeId,
          action: nextAction,
          time_spent_seconds: 120
        })
      });
      
      await fetchCourseData();
    } catch (err: any) {
      alert(`Progress transmission failed: ${err.message}`);
    } finally {
      setMarkingComplete(false);
    }
  }, [courseId, fetchCourseData]);

  const handleNodeDetailsClick = useCallback(async (nodeId: string) => {
    // Locate the topic object
    let foundTopic: any = null;
    if (course?.phases) {
      for (const phase of course.phases) {
        const t = phase.topics?.find((topic: any) => topic.id === nodeId);
        if (t) {
          foundTopic = t;
          break;
        }
      }
    }

    if (!foundTopic) return;

    setSelectedTopic(foundTopic);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError('');
    setNodeDetails(null);
    
    try {
      const res = await authFetch(`/api/courses/${courseId}/nodes/${nodeId}`);
      const data = await res.json();
      setNodeDetails(data);
    } catch (err: any) {
      setDrawerError(err.message || 'Error downloading database logs.');
    } finally {
      setDrawerLoading(false);
    }
  }, [course, courseId]);

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

  // Layout and filter nodes dynamically when course, search, variant, or disabled nodes change
  useEffect(() => {
    if (course?.phases) {
      // 1. Gather skip list from active variant
      const skipTopicsSet = new Set<string>();
      if (course.variants && selectedVariantId) {
        const variantObj = course.variants.find((v: any) => v.id === selectedVariantId);
        if (variantObj) {
          variantObj.skip_topics.forEach((tId: string) => skipTopicsSet.add(tId));
        }
      }
      // Add manual user disabled branch node IDs to skip set
      disabledNodeIds.forEach(id => skipTopicsSet.add(id));

      // 2. Map backend topics to updated statuses for layout
      const updatedPhases = course.phases.map((p: any) => ({
        ...p,
        topics: (p.topics || []).map((t: any) => ({
          ...t,
          status: getTopicStatus(t.id)
        }))
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        updatedPhases,
        course.topic_graph || [],
        searchTerm,
        skipTopicsSet
      );

      // Add callbacks into node data
      const finalNodes = layoutedNodes.map(node => {
        if (node.type === 'roadmapNode') {
          return {
            ...node,
            data: {
              ...node.data,
              onStatusToggle: handleStatusToggle,
              onNodeDetailsClick: handleNodeDetailsClick,
            }
          };
        }
        return node;
      });

      setNodes(finalNodes);
      setEdges(layoutedEdges);
    }
  }, [course, selectedVariantId, disabledNodeIds, searchTerm, getTopicStatus, handleStatusToggle, handleNodeDetailsClick, setNodes, setEdges]);

  if (loading && !course) {
    return <div className="p-8 text-center text-slate-400 italic">Scanning the constellation map...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  // Retrieve option nodes for the branch selector widget in the drawer
  const getBranchChildNodes = () => {
    if (!course?.topic_graph || !course?.phases || !selectedTopic) return [];
    
    const childEdges = course.topic_graph.filter((e: any) => e.from === selectedTopic.id);
    const flatNodes = course.phases.flatMap((p: any) => p.topics);
    
    return childEdges.map((e: any) => {
      const matched = flatNodes.find((n: any) => n.id === e.to);
      return matched ? { node_id: matched.id, title: matched.name, ...matched } : null;
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
    <div className="roadmap-page-container" style={{ background: '#09090b', height: 'calc(100vh - 64px)', position: 'relative' }}>
      
      {/* Floating Header Card - Aligned with roadmap.sh UI */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          right: '20px',
          zIndex: 10, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none' // Allow canvas clicks behind spacing
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', pointerEvents: 'auto' }}>
          <button 
            className="roadmap-back-btn" 
            onClick={() => navigate('/courses')}
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#f4f4f5',
              padding: '10px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '8px 16px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: 0, fontSize: '15px', color: '#f4f4f5', fontWeight: 600 }}>{course?.title}</h2>
          </div>
        </div>

        {/* Search Input and Variant Selector container */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', pointerEvents: 'auto' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: '#18181b',
                color: '#f4f4f5',
                width: '200px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Variant Selector */}
          {roadmapData.roadmap.variants && roadmapData.roadmap.variants.length > 0 && (
            <VariantSelector 
              variants={roadmapData.roadmap.variants} 
              selectedVariantId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          )}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#27272a" gap={16} size={1} />
          <Controls 
            showInteractive={false}
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          />
        </ReactFlow>
      </div>

      {/* Details Side Drawer */}
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

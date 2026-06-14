import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../lib/api';
import ReactMarkdown from 'react-markdown';
import '../../features/courses/markdown.css';

export default function NodeDetail() {
  const { courseId, nodeId } = useParams<{ courseId: string; nodeId: string }>();
  const navigate = useNavigate();
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchNode = async () => {
      try {
        const res = await authFetch(`/api/courses/${courseId}/nodes/${nodeId}`);
        const data = await res.json();
        setNode(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load node content');
      } finally {
        setLoading(false);
      }
    };
    fetchNode();
  }, [courseId, nodeId]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await authFetch(`/api/user/progress/${courseId}/node`, {
        method: 'POST',
        body: JSON.stringify({
          node_id: nodeId,
          action: 'complete',
          time_spent_seconds: 120 // mock time
        })
      });
      // After complete, go back to constellation map
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      alert(`Failed to mark complete: ${err.message}`);
      setMarkingComplete(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Decrypting transmission...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      <button 
        onClick={() => navigate(`/courses/${courseId}`)}
        style={{ marginBottom: '20px', background: 'transparent', border: '1px solid var(--starlight)', color: 'var(--starlight)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
      >
        ← Back to Constellation
      </button>

      <div className="auth-box">
        <h1 style={{ color: 'var(--starlight)', marginTop: 0 }}>{node.title}</h1>
        <div style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9em' }}>
          Estimated Time: {node.estimated_minutes} mins
        </div>

        <div className="markdown-content" style={{ lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '40px' }}>
          <ReactMarkdown>{node.content}</ReactMarkdown>
        </div>

        {node.links && node.links.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: 'var(--nebula)' }}>External Resources</h3>
            <ul style={{ paddingLeft: '20px' }}>
              {node.links.map((link: any, idx: number) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--starlight)' }}>
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button 
          onClick={handleMarkComplete}
          disabled={markingComplete}
          style={{ width: '100%', padding: '16px', background: 'var(--starlight)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer' }}
        >
          {markingComplete ? 'Saving Progress...' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  );
}

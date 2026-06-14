import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../../../lib/store/course-store';

export default function CourseList() {
  const { courses, isLoading, error, fetchCourses } = useCourseStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '40px' }}>Scanning the galaxy for courses...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Failed to load galaxy map: {error}</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
      {courses.map((course: any) => (
        <div 
          key={course.course_id}
          className="auth-box"
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          onClick={() => navigate(`/courses/${course.course_id}`)}
        >
          <div style={{ fontSize: '2em', marginBottom: '12px', textAlign: 'center' }}>
            {course.icon || '🪐'}
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--starlight)', textAlign: 'center' }}>{course.title}</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9em', textAlign: 'center', flexGrow: 1 }}>
            {course.description}
          </p>
          <button style={{ marginTop: '20px', padding: '8px', background: 'transparent', border: '1px solid var(--starlight)', color: 'var(--starlight)', borderRadius: '4px' }}>
            Explore System
          </button>
        </div>
      ))}
      
      {courses.length === 0 && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No star systems discovered yet. The universe is empty!
        </div>
      )}
    </div>
  );
}

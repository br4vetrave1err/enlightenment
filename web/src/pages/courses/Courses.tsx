import CourseList from '../../features/courses/components/CourseList';

export default function Courses() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--starlight)', fontWeight: 300, marginBottom: '8px' }}>Your Galaxy</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Select a star system to begin your learning journey.</p>
      
      <CourseList />
    </div>
  );
}

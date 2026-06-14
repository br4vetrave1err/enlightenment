import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <div className="stars"></div>
      <main className="content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        <Link to="/courses">Courses</Link>
        <Link to="/map">Map</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/progress">Progress</Link>
      </nav>
    </div>
  );
}

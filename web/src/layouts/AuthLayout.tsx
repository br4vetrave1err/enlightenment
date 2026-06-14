import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="stars"></div>
      <main className="auth-container">
        <Outlet />
      </main>
    </div>
  );
}

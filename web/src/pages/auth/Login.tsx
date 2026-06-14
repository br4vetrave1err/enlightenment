import { Link } from 'react-router-dom';
import LoginForm from '../../features/auth/components/LoginForm';
import GoogleAuthButton from '../../features/auth/components/GoogleAuthButton';

export default function Login() {
  return (
    <div className="auth-box">
      <h2>Welcome Back Explorer</h2>
      <LoginForm />
      <GoogleAuthButton />
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
        Don't have an account? <Link to="/auth/register" style={{ color: '#00D4FF' }}>Join the academy</Link>
      </div>
    </div>
  );
}

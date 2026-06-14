import { Link } from 'react-router-dom';
import RegisterForm from '../../features/auth/components/RegisterForm';
import GoogleAuthButton from '../../features/auth/components/GoogleAuthButton';

export default function Register() {
  return (
    <div className="auth-box">
      <h2>Join the Academy</h2>
      <RegisterForm />
      <GoogleAuthButton />
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
        Already have an account? <Link to="/auth/login" style={{ color: '#00D4FF' }}>Log in</Link>
      </div>
    </div>
  );
}

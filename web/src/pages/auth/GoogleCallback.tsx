import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/auth-store';
import { API_URL } from '../../lib/api';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = sessionStorage.getItem('oauth_state');

    if (!code) {
      setError('No authorization code found');
      return;
    }

    if (state !== storedState) {
      setError('Invalid state parameter. Possible CSRF attack.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange Google code');
        }

        const { access_token, refresh_token, user } = await response.json();
        login(access_token, refresh_token, user);
        
        // Clean up session storage
        sessionStorage.removeItem('oauth_state');
        
        navigate('/courses');
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      }
    };

    exchangeCode();
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-box" style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Authenticating...</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>Connecting with Google, please wait.</p>
      )}
    </div>
  );
}

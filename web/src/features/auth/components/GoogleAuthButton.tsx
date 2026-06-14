import { useState } from 'react';
import { API_URL } from '../../../lib/api';

export default function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize Google Auth');
      }

      const data = await response.json();
      // data.auth_url contains the Google OAuth redirect URL
      // data.state contains the state parameter
      // Save state to sessionStorage for validation upon return
      sessionStorage.setItem('oauth_state', data.state);
      
      // Redirect user to Google
      window.location.href = data.auth_url;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button 
        onClick={handleGoogleLogin} 
        disabled={isLoading}
        style={{ 
          padding: '10px 20px', 
          cursor: 'pointer', 
          backgroundColor: '#fff', 
          color: '#000',
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 16, height: 16, marginRight: 8 }} />
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </button>
      {error && <div style={{ color: 'red', marginTop: '8px', fontSize: '0.8em' }}>{error}</div>}
    </div>
  );
}

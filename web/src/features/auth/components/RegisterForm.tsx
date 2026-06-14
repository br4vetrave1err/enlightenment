import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useAuthStore } from '../../../lib/store/auth-store';
import { API_URL } from '../../../lib/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function RegisterForm() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      display_name: '',
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail?.message || 'Registration failed');
        }

        const { access_token, refresh_token, user } = await response.json();
        login(access_token, refresh_token, user);
        navigate('/courses');
      } catch (err: any) {
        setError(err.message);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
      
      <div>
        <form.Field
          name="display_name"
          children={(field) => (
            <>
              <label htmlFor={field.name}>Display Name</label>
              <input
                id={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '4px' }}
              />
              {field.state.meta.errors ? (
                <em style={{ color: 'red', fontSize: '0.8em' }}>{field.state.meta.errors.join(', ')}</em>
              ) : null}
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="email"
          children={(field) => (
            <>
              <label htmlFor={field.name}>Email</label>
              <input
                id={field.name}
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '4px' }}
              />
              {field.state.meta.errors ? (
                <em style={{ color: 'red', fontSize: '0.8em' }}>{field.state.meta.errors.join(', ')}</em>
              ) : null}
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="password"
          children={(field) => (
            <>
              <label htmlFor={field.name}>Password</label>
              <input
                id={field.name}
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '4px' }}
              />
              {field.state.meta.errors ? (
                <em style={{ color: 'red', fontSize: '0.8em' }}>{field.state.meta.errors.join(', ')}</em>
              ) : null}
            </>
          )}
        />
      </div>

      <button type="submit" disabled={form.state.isSubmitting} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        {form.state.isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authFetch } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const response = await authFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ display_name: name, email, password }),
    });
    const data = await response.json();
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    set({ user: data.user, isAuthenticated: true });
  },

  loginWithGoogle: async (idToken) => {
    const response = await authFetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await response.json();
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await authFetch('/api/auth/me');
      const data = await response.json();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (access_token: string, refresh_token: string, user_data: User) => void;
  logout: () => void;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  login: (access_token, refresh_token, user_data) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user_data));
    set({ isAuthenticated: true, user: user_data, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ isAuthenticated: false, user: null, isLoading: false });
  },

  restoreSession: () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ isAuthenticated: true, user, isLoading: false });
      } catch (e) {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } else {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));

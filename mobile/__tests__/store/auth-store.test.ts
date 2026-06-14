import { useAuthStore } from '../../src/lib/store/auth-store';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../../src/lib/api', () => ({
  authFetch: jest.fn(),
  getCourses: jest.fn(),
  getCourse: jest.fn(),
  API_URL: 'http://localhost:8000',
}));

const { authFetch } = require('../../src/lib/api');

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockUser = { id: '1', name: 'Test', email: 'test@example.com', picture: '' };
      const mockResponse = {
        user: mockUser,
        access_token: 'access-123',
        refresh_token: 'refresh-123',
      };

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await useAuthStore.getState().login('test@example.com', 'password');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'access-123');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'refresh-123');
    });
  });

  describe('register', () => {
    it('should register successfully and store tokens', async () => {
      const mockUser = { id: '2', name: 'New User', email: 'new@example.com', picture: '' };
      const mockResponse = {
        user: mockUser,
        access_token: 'access-456',
        refresh_token: 'refresh-456',
      };

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await useAuthStore.getState().register('New User', 'new@example.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'access-456');
    });
  });

  describe('loginWithGoogle', () => {
    it('should login with Google and store tokens', async () => {
      const mockUser = { id: '3', name: 'Google User', email: 'google@example.com', picture: '' };
      const mockResponse = {
        user: mockUser,
        access_token: 'google-access-789',
        refresh_token: 'google-refresh-789',
      };

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await useAuthStore.getState().loginWithGoogle('google-id-token');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'google-access-789');
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      useAuthStore.setState({
        user: { id: '1', name: 'Test', email: 'test@example.com', picture: '' },
        isAuthenticated: true,
      });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('restoreSession', () => {
    it('should restore session when token exists', async () => {
      const mockUser = { id: '1', name: 'Test', email: 'test@example.com', picture: '' };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('existing-token');
      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ user: mockUser }),
      });

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should not restore session when no token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should handle restore error and clear tokens', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('old-token');
      (authFetch as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
    });
  });
});

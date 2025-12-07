import { create } from 'zustand';
import { api, endpoints } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  tenantId: string;
  tenantName: string;
  plan?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Load user from localStorage on init
const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadUserFromStorage(),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>(endpoints.auth.login, { email, password }, false);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },
  
  logout: async () => {
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const response = await api.get<{ user: User }>(endpoints.auth.me);
      localStorage.setItem('user', JSON.stringify(response.user));
      set({
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
}));

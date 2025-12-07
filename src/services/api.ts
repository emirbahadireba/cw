// API Client Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return null;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
    } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If 401 and has refresh token, try to refresh
    if (response.status === 401 && requiresAuth && this.getRefreshToken()) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...config,
          headers: requestHeaders,
        });
      } else {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }

  // Convenience methods
  get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  post<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  put<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }

  // File upload
  async uploadFile(endpoint: string, file: File, requiresAuth = true): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (requiresAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }
}

export const api = new ApiClient();

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  // Users
  users: {
    list: '/users',
    get: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  // Displays
  displays: {
    list: '/displays',
    get: (id: string) => `/displays/${id}`,
    create: '/displays',
    update: (id: string) => `/displays/${id}`,
    delete: (id: string) => `/displays/${id}`,
    pair: (id: string) => `/displays/${id}/pair`,
    status: (id: string) => `/displays/${id}/status`,
    heartbeat: (id: string) => `/displays/${id}/heartbeat`,
    restart: (id: string) => `/displays/${id}/restart`,
  },
  // Media
  media: {
    list: '/media',
    get: (id: string) => `/media/${id}`,
    upload: '/media/upload',
    update: (id: string) => `/media/${id}`,
    delete: (id: string) => `/media/${id}`,
    stats: '/media/stats',
  },
  // Layouts
  layouts: {
    list: '/layouts',
    get: (id: string) => `/layouts/${id}`,
    create: '/layouts',
    update: (id: string) => `/layouts/${id}`,
    delete: (id: string) => `/layouts/${id}`,
    duplicate: (id: string) => `/layouts/${id}/duplicate`,
  },
  // Playlists
  playlists: {
    list: '/playlists',
    get: (id: string) => `/playlists/${id}`,
    create: '/playlists',
    update: (id: string) => `/playlists/${id}`,
    delete: (id: string) => `/playlists/${id}`,
    duplicate: (id: string) => `/playlists/${id}/duplicate`,
    reorderItems: (id: string) => `/playlists/${id}/items/reorder`,
  },
  // Schedules
  schedules: {
    list: '/schedules',
    get: (id: string) => `/schedules/${id}`,
    create: '/schedules',
    update: (id: string) => `/schedules/${id}`,
    delete: (id: string) => `/schedules/${id}`,
  },
  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    displays: '/analytics/displays',
    content: '/analytics/content',
    events: '/analytics/events',
  },
  // Applications
  applications: {
    list: '/applications',
    get: (id: string) => `/applications/${id}`,
    create: '/applications',
    update: (id: string) => `/applications/${id}`,
    delete: (id: string) => `/applications/${id}`,
  },
  // Settings
  settings: {
    get: '/settings',
    update: '/settings',
  },
  // Notifications
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  // Plans
  plans: {
    list: '/plans',
    current: '/plans/current',
    usage: '/plans/usage',
    upgrade: '/plans/upgrade',
    downgrade: '/plans/downgrade',
    billing: '/plans/billing',
  },
};



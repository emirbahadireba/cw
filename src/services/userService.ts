import { api, endpoints } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export const userService = {
  async list(filters?: { search?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<{ users: User[]; total: number; page: number; limit: number }>(
      `${endpoints.users.list}${query ? `?${query}` : ''}`
    );
  },

  async get(id: string) {
    return api.get<{ user: User }>(endpoints.users.get(id));
  },

  async create(data: {
    email: string;
    name: string;
    role?: 'admin' | 'manager' | 'user';
    password: string;
  }) {
    return api.post<{ user: User }>(endpoints.users.create, data);
  },

  async update(id: string, data: {
    name?: string;
    role?: 'admin' | 'manager' | 'user';
    is_active?: boolean;
  }) {
    return api.put<{ user: User }>(endpoints.users.update(id), data);
  },

  async delete(id: string) {
    return api.delete<{ success: boolean }>(endpoints.users.delete(id));
  },
};



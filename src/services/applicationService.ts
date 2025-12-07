import { api, endpoints } from './api';

export interface Application {
  id: string;
  name: string;
  type: 'weather' | 'news' | 'clock' | 'calendar' | 'social' | 'analytics' | 'custom';
  description?: string;
  status: 'active' | 'inactive';
  config: Record<string, any>;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export const applicationService = {
  async list(filters?: { type?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return api.get<{ applications: Application[] }>(
      `${endpoints.applications.list}${query ? `?${query}` : ''}`
    );
  },

  async get(id: string) {
    return api.get<{ application: Application }>(endpoints.applications.get(id));
  },

  async create(data: {
    name: string;
    type: string;
    description?: string;
    config?: Record<string, any>;
    status?: 'active' | 'inactive';
  }) {
    return api.post<{ application: Application }>(endpoints.applications.create, data);
  },

  async update(id: string, data: {
    name?: string;
    description?: string;
    config?: Record<string, any>;
    status?: 'active' | 'inactive';
  }) {
    return api.put<{ application: Application }>(endpoints.applications.update(id), data);
  },

  async delete(id: string) {
    return api.delete<{ success: boolean }>(endpoints.applications.delete(id));
  },
};



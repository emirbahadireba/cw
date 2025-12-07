import { api, endpoints } from './api';

export interface Display {
  id: string;
  name: string;
  location: string;
  platform?: 'web' | 'android' | 'raspberry' | 'windows';
  status: 'online' | 'offline' | 'error';
  resolution?: string;
  orientation?: 'landscape' | 'portrait';
  ip_address?: string;
  model?: string;
  temperature?: number;
  last_seen_at?: string;
  current_playlist_id?: string;
  pair_code?: string;
  pair_code_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const displayService = {
  async list(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<{ displays: Display[]; total: number; page: number; limit: number }>(
      `${endpoints.displays.list}${query ? `?${query}` : ''}`
    );
  },

  async get(id: string) {
    return api.get<{ display: Display }>(endpoints.displays.get(id));
  },

  async create(data: { name: string; location?: string; platform?: string; pair_code?: string }) {
    return api.post<{ display: Display }>(endpoints.displays.create, data);
  },

  async update(id: string, data: { name?: string; location?: string; current_playlist_id?: string | null }) {
    return api.put<{ display: Display }>(endpoints.displays.update(id), data);
  },

  async delete(id: string) {
    return api.delete<{ success: boolean }>(endpoints.displays.delete(id));
  },

  async pair(id: string, pairCode: string) {
    return api.post<{ display: Display; accessToken: string }>(endpoints.displays.pair(id), { pair_code: pairCode });
  },

  async getStatus(id: string) {
    return api.get<{ status: { status: string; last_seen_at: string; temperature?: number } }>(endpoints.displays.status(id));
  },

  async heartbeat(id: string, data: { temperature?: number; resolution?: string }) {
    return api.post<{ success: boolean }>(endpoints.displays.heartbeat(id), data);
  },

  async restart(id: string) {
    return api.post<{ success: boolean; message: string }>(endpoints.displays.restart(id));
  },
};



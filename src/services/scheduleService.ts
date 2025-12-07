import { api, endpoints } from './api';

export interface Schedule {
  id: string;
  name: string;
  playlist_id: string;
  display_id?: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  start_date?: string;
  end_date?: string;
  status: 'active' | 'upcoming' | 'expired';
  created_at: string;
  updated_at: string;
}

export const scheduleService = {
  async list(filters?: { display_id?: string; status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.display_id) params.append('display_id', filters.display_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<{ schedules: Schedule[]; total: number; page: number; limit: number }>(
      `${endpoints.schedules.list}${query ? `?${query}` : ''}`
    );
  },

  async get(id: string) {
    return api.get<{ schedule: Schedule }>(endpoints.schedules.get(id));
  },

  async create(data: {
    name: string;
    playlist_id: string;
    display_id?: string;
    start_time: string;
    end_time: string;
    days_of_week: number[];
    start_date?: string;
    end_date?: string;
  }) {
    return api.post<{ schedule: Schedule }>(endpoints.schedules.create, data);
  },

  async update(id: string, data: {
    name?: string;
    playlist_id?: string;
    start_time?: string;
    end_time?: string;
    days_of_week?: number[];
    start_date?: string;
    end_date?: string;
  }) {
    return api.put<{ schedule: Schedule }>(endpoints.schedules.update(id), data);
  },

  async delete(id: string) {
    return api.delete<{ success: boolean }>(endpoints.schedules.delete(id));
  },
};



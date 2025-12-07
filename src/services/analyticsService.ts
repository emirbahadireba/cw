import { api, endpoints } from './api';

export const analyticsService = {
  async getDashboard(period: 'today' | 'week' | 'month' | 'year' = 'week') {
    return api.get(endpoints.analytics.dashboard + `?period=${period}`);
  },

  async getDisplays(displayId?: string, period: 'week' | 'month' | 'year' = 'week') {
    const params = new URLSearchParams();
    if (displayId) params.append('display_id', displayId);
    params.append('period', period);
    return api.get(`${endpoints.analytics.displays}?${params.toString()}`);
  },

  async getTopContent(period: 'week' | 'month' | 'year' = 'week') {
    return api.get(`${endpoints.analytics.content}?period=${period}`);
  },

  async logEvent(data: {
    display_id?: string;
    playlist_id?: string;
    media_file_id?: string;
    event_type: string;
    event_data?: Record<string, any>;
  }) {
    return api.post(endpoints.analytics.events, data);
  },
};



import { api, endpoints } from './api';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  is_read: boolean;
  related_resource_type?: string;
  related_resource_id?: string;
  created_at: string;
}

export const notificationService = {
  async list(filters?: { is_read?: boolean; type?: string }) {
    const params = new URLSearchParams();
    if (filters?.is_read !== undefined) params.append('is_read', filters.is_read.toString());
    if (filters?.type) params.append('type', filters.type);
    
    const query = params.toString();
    return api.get<{ notifications: Notification[] }>(
      `${endpoints.notifications.list}${query ? `?${query}` : ''}`
    );
  },

  async markRead(id: string) {
    return api.put<{ success: boolean }>(endpoints.notifications.markRead(id));
  },

  async markAllRead() {
    return api.put<{ success: boolean }>(endpoints.notifications.markAllRead);
  },
};



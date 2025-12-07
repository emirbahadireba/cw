import { api, endpoints } from './api';

export interface PlaylistItem {
  id: string;
  media_file_id: string;
  order_index: number;
  duration: number;
  transition_type: string;
  transition_duration: number;
  media_name?: string;
  media_type?: string;
  media_url?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  duration: number;
  is_active: boolean;
  thumbnail_url?: string;
  tags: string[];
  items?: PlaylistItem[];
  created_at: string;
  updated_at: string;
}

export const playlistService = {
  async list(filters?: { search?: string; is_active?: boolean; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<{ playlists: Playlist[]; total: number; page: number; limit: number }>(
      `${endpoints.playlists.list}${query ? `?${query}` : ''}`
    );
  },

  async get(id: string) {
    return api.get<{ playlist: Playlist; items: PlaylistItem[] }>(endpoints.playlists.get(id));
  },

  async create(data: {
    name: string;
    description?: string;
    items?: Array<{
      media_file_id: string;
      order_index: number;
      duration: number;
      transition_type?: string;
      transition_duration?: number;
    }>;
    tags?: string[];
  }) {
    return api.post<{ playlist: Playlist }>(endpoints.playlists.create, data);
  },

  async update(id: string, data: {
    name?: string;
    description?: string;
    items?: Array<{
      media_file_id: string;
      order_index: number;
      duration: number;
      transition_type?: string;
      transition_duration?: number;
    }>;
    tags?: string[];
  }) {
    return api.put<{ playlist: Playlist }>(endpoints.playlists.update(id), data);
  },

  async delete(id: string) {
    return api.delete<{ success: boolean }>(endpoints.playlists.delete(id));
  },

  async duplicate(id: string) {
    return api.post<{ playlist: Playlist }>(endpoints.playlists.duplicate(id));
  },

  async reorderItems(id: string, itemIds: string[]) {
    return api.put<{ success: boolean }>(endpoints.playlists.reorderItems(id), { itemIds });
  },
};



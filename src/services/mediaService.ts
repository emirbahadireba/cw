import { api, endpoints } from './api';

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  width?: number;
  height?: number;
  uploaded_at: string;
  tags: string[];
}

export interface MediaStats {
  total: number;
  images: number;
  videos: number;
  totalSize: number;
}

export const mediaService = {
  async list(filters?: { type?: string; search?: string; tags?: string[]; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<{ media: MediaFile[]; total: number; page: number; limit: number }>(
      `${endpoints.media.list}${query ? `?${query}` : ''}`
    );
  },

  async get(id: string) {
    return api.get<{ media: MediaFile }>(endpoints.media.get(id));
  },

  async upload(file: File) {
    return api.uploadFile(endpoints.media.upload, file);
  },

  async update(id: string, data: { name?: string; tags?: string[] }) {
    return api.put<{ media: MediaFile }>(endpoints.media.update(id), data);
  },

  async delete(id: string) {
    return api.delete<{ success: boolean }>(endpoints.media.delete(id));
  },

  async getStats() {
    return api.get<MediaStats>(endpoints.media.stats);
  },
};



import { api, endpoints } from './api';

export interface LayoutElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'clock' | 'weather' | 'news';
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  properties: Record<string, any>;
}

export interface Layout {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  category?: string;
  is_template: boolean;
  thumbnail_url?: string;
  elements?: LayoutElement[];
  created_at: string;
  updated_at: string;
}

export const layoutService = {
  async list(filters?: { category?: string; search?: string; is_template?: boolean; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_template !== undefined) params.append('is_template', filters.is_template.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<{ layouts: Layout[]; total: number; page: number; limit: number }>(
      `${endpoints.layouts.list}${query ? `?${query}` : ''}`
    );
  },

  async get(id: string) {
    return api.get<{ layout: Layout; elements: LayoutElement[] }>(endpoints.layouts.get(id));
  },

  async create(data: {
    name: string;
    width: number;
    height: number;
    background?: string;
    category?: string;
    is_template?: boolean;
    elements?: Array<{
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      z_index?: number;
      properties?: Record<string, any>;
    }>;
  }) {
    return api.post<{ layout: Layout & { elements: LayoutElement[] } }>(endpoints.layouts.create, data);
  },

  async update(id: string, data: {
    name?: string;
    background?: string;
    elements?: Array<{
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      z_index?: number;
      properties?: Record<string, any>;
    }>;
  }) {
    return api.put<{ layout: Layout & { elements: LayoutElement[] } }>(endpoints.layouts.update(id), data);
  },

  async delete(id: string) {
    return api.delete<{ success: boolean }>(endpoints.layouts.delete(id));
  },

  async duplicate(id: string) {
    return api.post<{ layout: Layout }>(endpoints.layouts.duplicate(id));
  },
};



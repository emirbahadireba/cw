import { api, endpoints } from './api';

export const settingsService = {
  async get(category?: string) {
    const query = category ? `?category=${category}` : '';
    return api.get<{ settings: Record<string, any> }>(endpoints.settings.get + query);
  },

  async update(category: string, key: string, value: any) {
    return api.put(endpoints.settings.update, { category, key, value });
  },
};



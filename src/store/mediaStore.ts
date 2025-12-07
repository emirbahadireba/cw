import { create } from 'zustand';

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  tags: string[];
}

interface MediaState {
  media: MediaFile[];
  uploadMedia: (file: MediaFile) => void;
  deleteMedia: (id: string) => void;
  updateMedia: (id: string, updates: Partial<MediaFile>) => void;
}

// Örnek medya dosyaları
const sampleMedia: MediaFile[] = [
  {
    id: '1',
    name: 'company-logo.png',
    type: 'image/png',
    size: 2048000,
    url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    uploadedAt: new Date('2024-01-10').toISOString(),
    tags: ['logo', 'branding']
  },
  {
    id: '2',
    name: 'promo-video.mp4',
    type: 'video/mp4',
    size: 15360000,
    url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    uploadedAt: new Date('2024-01-15').toISOString(),
    tags: ['promotion', 'video']
  },
  {
    id: '3',
    name: 'background-music.mp3',
    type: 'audio/mp3',
    size: 5120000,
    url: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    uploadedAt: new Date('2024-01-20').toISOString(),
    tags: ['background', 'music']
  },
  {
    id: '4',
    name: 'product-catalog.pdf',
    type: 'application/pdf',
    size: 8192000,
    url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=800',
    uploadedAt: new Date('2024-01-25').toISOString(),
    tags: ['catalog', 'product']
  },
  {
    id: '5',
    name: 'hero-banner.jpg',
    type: 'image/jpeg',
    size: 3072000,
    url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    uploadedAt: new Date('2024-02-01').toISOString(),
    tags: ['banner', 'hero', 'marketing']
  }
];

export const useMediaStore = create<MediaState>((set, get) => ({
  media: sampleMedia,
  uploadMedia: (file) => {
    set((state) => ({
      media: [...state.media, file]
    }));
  },
  deleteMedia: (id) => {
    set((state) => ({
      media: state.media.filter((item) => item.id !== id)
    }));
  },
  updateMedia: (id, updates) => {
    set((state) => ({
      media: state.media.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  }
}));

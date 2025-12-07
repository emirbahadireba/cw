import { create } from 'zustand';

export interface PlaylistItem {
  id: string;
  mediaId: string;
  type: 'image' | 'video';
  name: string;
  duration: number; // in seconds
  url: string;
  transition?: {
    type: 'fade' | 'slide' | 'zoom' | 'flip';
    duration: number;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  items: PlaylistItem[];
  duration: number; // total duration in seconds
  createdAt: string;
  updatedAt: string;
  tags: string[];
  thumbnail?: string;
  isActive?: boolean;
}

interface PlaylistState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  createPlaylist: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlaylist: (playlist: Playlist) => void;
  deletePlaylist: (id: string) => void;
  duplicatePlaylist: (id: string) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  addItemToPlaylist: (playlistId: string, item: PlaylistItem) => void;
  removeItemFromPlaylist: (playlistId: string, itemId: string) => void;
  updatePlaylistItem: (playlistId: string, itemId: string, updates: Partial<PlaylistItem>) => void;
  reorderPlaylistItems: (playlistId: string, items: PlaylistItem[]) => void;
}

// Sample data
const samplePlaylists: Playlist[] = [
  {
    id: '1',
    name: 'Ana Reklam Kampanyası',
    description: 'Şirket ana reklam materyallerini içeren playlist',
    items: [
      {
        id: 'item-1',
        mediaId: '1',
        type: 'image',
        name: 'company-logo.png',
        duration: 10,
        url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
        transition: {
          type: 'fade',
          duration: 1000
        }
      },
      {
        id: 'item-2',
        mediaId: '2',
        type: 'video',
        name: 'promo-video.mp4',
        duration: 30,
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        transition: {
          type: 'slide',
          duration: 800
        }
      }
    ],
    duration: 40,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    tags: ['reklam', 'ana-kampanya', 'logo'],
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
    isActive: true
  },
  {
    id: '2',
    name: 'Ürün Tanıtımları',
    description: 'Yeni ürün lansmanları için hazırlanan içerikler',
    items: [
      {
        id: 'item-3',
        mediaId: '3',
        type: 'image',
        name: 'product-showcase.jpg',
        duration: 15,
        url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
        transition: {
          type: 'zoom',
          duration: 1200
        }
      }
    ],
    duration: 15,
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    tags: ['ürün', 'tanıtım', 'showcase'],
    thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=200',
    isActive: false
  },
  {
    id: '3',
    name: 'Haftalık Özel Teklifler',
    description: 'Haftalık değişen özel teklif ve kampanyalar',
    items: [],
    duration: 0,
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
    tags: ['teklif', 'kampanya', 'haftalık'],
    isActive: false
  }
];

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: samplePlaylists,
  currentPlaylist: null,
  isLoading: false,

  createPlaylist: (playlistData) => {
    const newPlaylist: Playlist = {
      ...playlistData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      playlists: [...state.playlists, newPlaylist]
    }));
  },

  updatePlaylist: (updatedPlaylist) => {
    set((state) => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === updatedPlaylist.id
          ? { ...updatedPlaylist, updatedAt: new Date().toISOString() }
          : playlist
      ),
      currentPlaylist: state.currentPlaylist?.id === updatedPlaylist.id
        ? { ...updatedPlaylist, updatedAt: new Date().toISOString() }
        : state.currentPlaylist
    }));
  },

  deletePlaylist: (id) => {
    set((state) => ({
      playlists: state.playlists.filter(playlist => playlist.id !== id),
      currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist
    }));
  },

  duplicatePlaylist: (id) => {
    const original = get().playlists.find(p => p.id === id);
    if (original) {
      const duplicated: Playlist = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (Kopya)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        items: original.items.map(item => ({
          ...item,
          id: crypto.randomUUID()
        }))
      };

      set((state) => ({
        playlists: [...state.playlists, duplicated]
      }));
    }
  },

  setCurrentPlaylist: (playlist) => {
    set({ currentPlaylist: playlist });
  },

  addItemToPlaylist: (playlistId, item) => {
    set((state) => ({
      playlists: state.playlists.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedItems = [...playlist.items, item];
          const totalDuration = updatedItems.reduce((sum, item) => sum + item.duration, 0);
          return {
            ...playlist,
            items: updatedItems,
            duration: totalDuration,
            updatedAt: new Date().toISOString()
          };
        }
        return playlist;
      })
    }));
  },

  removeItemFromPlaylist: (playlistId, itemId) => {
    set((state) => ({
      playlists: state.playlists.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedItems = playlist.items.filter(item => item.id !== itemId);
          const totalDuration = updatedItems.reduce((sum, item) => sum + item.duration, 0);
          return {
            ...playlist,
            items: updatedItems,
            duration: totalDuration,
            updatedAt: new Date().toISOString()
          };
        }
        return playlist;
      })
    }));
  },

  updatePlaylistItem: (playlistId, itemId, updates) => {
    set((state) => ({
      playlists: state.playlists.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedItems = playlist.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          );
          const totalDuration = updatedItems.reduce((sum, item) => sum + item.duration, 0);
          return {
            ...playlist,
            items: updatedItems,
            duration: totalDuration,
            updatedAt: new Date().toISOString()
          };
        }
        return playlist;
      })
    }));
  },

  reorderPlaylistItems: (playlistId, items) => {
    set((state) => ({
      playlists: state.playlists.map(playlist => {
        if (playlist.id === playlistId) {
          const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);
          return {
            ...playlist,
            items,
            duration: totalDuration,
            updatedAt: new Date().toISOString()
          };
        }
        return playlist;
      })
    }));
  }
}));

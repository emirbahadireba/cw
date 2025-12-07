import { create } from 'zustand';

export interface LayoutElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'weather' | 'news' | 'clock' | 'qr' | 'social' | 'app';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  properties: Record<string, any>;
}

export interface Layout {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  elements: LayoutElement[];
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  category: string;
}

interface LayoutState {
  layouts: Layout[];
  currentLayout: Layout | null;
  selectedElement: string | null;
  isEditing: boolean;
  addLayout: (layout: Omit<Layout, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLayout: (id: string, updates: Partial<Layout>) => void;
  deleteLayout: (id: string) => void;
  setCurrentLayout: (layout: Layout | null) => void;
  addElement: (element: Omit<LayoutElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<LayoutElement>) => void;
  deleteElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  setIsEditing: (editing: boolean) => void;
}

const sampleLayouts: Layout[] = [
  {
    id: '1',
    name: 'Karşılama Ekranı',
    width: 1920,
    height: 1080,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    elements: [
      {
        id: 'welcome-text',
        type: 'text',
        x: 100,
        y: 200,
        width: 1720,
        height: 200,
        zIndex: 1,
        properties: {
          text: 'Hoş Geldiniz',
          fontSize: 72,
          fontWeight: 'bold',
          color: '#FFFFFF',
          textAlign: 'center'
        }
      },
      {
        id: 'clock-widget',
        type: 'clock',
        x: 1620,
        y: 50,
        width: 250,
        height: 100,
        zIndex: 2,
        properties: {
          format: '24h',
          showSeconds: true,
          color: '#FFFFFF'
        }
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    isTemplate: false,
    category: 'Genel'
  },
  {
    id: '2',
    name: 'Haber ve Duyuru',
    width: 1920,
    height: 1080,
    background: '#1a1a2e',
    elements: [
      {
        id: 'news-feed',
        type: 'news',
        x: 50,
        y: 100,
        width: 1200,
        height: 800,
        zIndex: 1,
        properties: {
          source: 'rss',
          url: 'https://example.com/rss',
          maxItems: 5
        }
      },
      {
        id: 'weather-widget',
        type: 'weather',
        x: 1300,
        y: 100,
        width: 570,
        height: 400,
        zIndex: 1,
        properties: {
          location: 'Istanbul',
          showForecast: true,
          unit: 'celsius'
        }
      }
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22'),
    isTemplate: false,
    category: 'Haber'
  }
];

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layouts: sampleLayouts,
  currentLayout: null,
  selectedElement: null,
  isEditing: false,
  addLayout: (layout) => {
    const newLayout: Layout = {
      ...layout,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    set((state) => ({ layouts: [...state.layouts, newLayout] }));
  },
  updateLayout: (id, updates) => {
    set((state) => ({
      layouts: state.layouts.map((layout) =>
        layout.id === id ? { ...layout, ...updates, updatedAt: new Date() } : layout),
      currentLayout: state.currentLayout?.id === id 
        ? { ...state.currentLayout, ...updates, updatedAt: new Date() }
        : state.currentLayout
    }));
  },
  deleteLayout: (id) => {
    set((state) => ({
      layouts: state.layouts.filter((layout) => layout.id !== id),
      currentLayout: state.currentLayout?.id === id ? null : state.currentLayout
    }));
  },
  setCurrentLayout: (layout) => {
    set({ currentLayout: layout });
  },
  addElement: (element) => {
    const newElement: LayoutElement = {
      ...element,
      id: Date.now().toString()
    };
    set((state) => ({
      currentLayout: state.currentLayout ? {
        ...state.currentLayout,
        elements: [...state.currentLayout.elements, newElement],
        updatedAt: new Date()
      } : null
    }));
  },
  updateElement: (id, updates) => {
    set((state) => ({
      currentLayout: state.currentLayout ? {
        ...state.currentLayout,
        elements: state.currentLayout.elements.map((element) =>
          element.id === id ? { ...element, ...updates } : element
        ),
        updatedAt: new Date()
      } : null
    }));
  },
  deleteElement: (id) => {
    set((state) => ({
      currentLayout: state.currentLayout ? {
        ...state.currentLayout,
        elements: state.currentLayout.elements.filter((element) => element.id !== id),
        updatedAt: new Date()
      } : null,
      selectedElement: state.selectedElement === id ? null : state.selectedElement
    }));
  },
  setSelectedElement: (id) => {
    set({ selectedElement: id });
  },
  setIsEditing: (editing) => {
    set({ isEditing: editing });
  }
}));

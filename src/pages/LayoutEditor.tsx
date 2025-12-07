import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  Undo, 
  Redo, 
  Copy, 
  Trash2, 
  Plus, 
  Grid, 
  Image, 
  Type, 
  Clock, 
  Video,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Settings,
  Move,
  Square,
  MousePointer
} from 'lucide-react';
import { useLayoutStore } from '../store/layoutStore';
import { useMediaStore } from '../store/mediaStore';
import toast from 'react-hot-toast';

interface LayoutElement {
  id: string;
  type: 'image' | 'video' | 'text' | 'clock' | 'weather';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  mediaId?: string;
  style?: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    opacity?: number;
  };
  animation?: {
    type: 'none' | 'fade' | 'slide' | 'zoom';
    duration: number;
  };
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  dragStart: { x: number; y: number };
  elementStart: { x: number; y: number; width: number; height: number };
  resizeHandle: string | null;
}

export default function LayoutEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { layouts, createLayout, updateLayout } = useLayoutStore();
  const { media } = useMediaStore();
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [tool, setTool] = useState<'select' | 'region'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    dragStart: { x: 0, y: 0 },
    elementStart: { x: 0, y: 0, width: 0, height: 0 },
    resizeHandle: null
  });
  
  // Get current layout or create new
  const currentLayout = id ? layouts.find(l => l.id === id) : null;
  const [elements, setElements] = useState<LayoutElement[]>(
    currentLayout?.elements || []
  );
  
  const [layoutName, setLayoutName] = useState(
    currentLayout?.name || `Yeni Layout ${layouts.length + 1}`
  );

  // History for undo/redo
  const [history, setHistory] = useState<LayoutElement[][]>([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Add to history when elements change
  const addToHistory = useCallback((newElements: LayoutElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const handleAddElement = (type: LayoutElement['type']) => {
    const newElement: LayoutElement = {
      id: crypto.randomUUID(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 100,
      content: type === 'text' ? 'Metin içeriği' : undefined,
      style: {
        fontSize: type === 'text' ? 16 : undefined,
        color: type === 'text' ? '#FFFFFF' : undefined,
        backgroundColor: type === 'text' ? 'transparent' : '#9E7FFF',
        borderRadius: 8,
        opacity: 1
      },
      animation: {
        type: 'fade',
        duration: 1000
      }
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement.id);
    toast.success('Yeni eleman eklendi!');
  };

  const handleElementUpdate = (elementId: string, updates: Partial<LayoutElement>) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    setElements(newElements);
  };

  const commitElementUpdate = (elementId: string, updates: Partial<LayoutElement>) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const handleDeleteElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Eleman silindi!');
  };

  const handleDuplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const newElement = {
        ...element,
        id: crypto.randomUUID(),
        x: element.x + 20,
        y: element.y + 20
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElement(newElement.id);
      toast.success('Eleman kopyalandı!');
    }
  };

  // Canvas mouse events
  const getMousePosition = (e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (zoom / 100),
      y: (e.clientY - rect.top) / (zoom / 100)
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (tool === 'region') {
      const pos = getMousePosition(e);
      setIsDrawing(true);
      setDrawStart(pos);
      setSelectedElement(null);
    } else {
      // Clear selection if clicking on empty canvas
      setSelectedElement(null);
    }
  };

  // Element mouse events
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    if (tool !== 'select') return;

    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);
    const pos = getMousePosition(e);
    
    setDragState({
      isDragging: true,
      isResizing: false,
      dragStart: pos,
      elementStart: { x: element.x, y: element.y, width: element.width, height: element.height },
      resizeHandle: null
    });
  };

  // Resize handles
  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const pos = getMousePosition(e);
    
    setDragState({
      isDragging: false,
      isResizing: true,
      dragStart: pos,
      elementStart: { x: element.x, y: element.y, width: element.width, height: element.height },
      resizeHandle: handle
    });
  };

  // Global mouse event handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging && selectedElement) {
        const pos = getMousePosition(e);
        const deltaX = pos.x - dragState.dragStart.x;
        const deltaY = pos.y - dragState.dragStart.y;
        
        const newX = Math.max(0, Math.min(1920 - dragState.elementStart.width, dragState.elementStart.x + deltaX));
        const newY = Math.max(0, Math.min(1080 - dragState.elementStart.height, dragState.elementStart.y + deltaY));
        
        handleElementUpdate(selectedElement, { x: newX, y: newY });
      } else if (dragState.isResizing && selectedElement && dragState.resizeHandle) {
        const pos = getMousePosition(e);
        const deltaX = pos.x - dragState.dragStart.x;
        const deltaY = pos.y - dragState.dragStart.y;
        
        let newX = dragState.elementStart.x;
        let newY = dragState.elementStart.y;
        let newWidth = dragState.elementStart.width;
        let newHeight = dragState.elementStart.height;
        
        switch (dragState.resizeHandle) {
          case 'nw':
            newX = dragState.elementStart.x + deltaX;
            newY = dragState.elementStart.y + deltaY;
            newWidth = dragState.elementStart.width - deltaX;
            newHeight = dragState.elementStart.height - deltaY;
            break;
          case 'ne':
            newY = dragState.elementStart.y + deltaY;
            newWidth = dragState.elementStart.width + deltaX;
            newHeight = dragState.elementStart.height - deltaY;
            break;
          case 'sw':
            newX = dragState.elementStart.x + deltaX;
            newWidth = dragState.elementStart.width - deltaX;
            newHeight = dragState.elementStart.height + deltaY;
            break;
          case 'se':
            newWidth = dragState.elementStart.width + deltaX;
            newHeight = dragState.elementStart.height + deltaY;
            break;
          case 'n':
            newY = dragState.elementStart.y + deltaY;
            newHeight = dragState.elementStart.height - deltaY;
            break;
          case 's':
            newHeight = dragState.elementStart.height + deltaY;
            break;
          case 'w':
            newX = dragState.elementStart.x + deltaX;
            newWidth = dragState.elementStart.width - deltaX;
            break;
          case 'e':
            newWidth = dragState.elementStart.width + deltaX;
            break;
        }
        
        // Minimum size constraints
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);
        
        // Boundary constraints
        newX = Math.max(0, Math.min(1920 - newWidth, newX));
        newY = Math.max(0, Math.min(1080 - newHeight, newY));
        
        handleElementUpdate(selectedElement, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        });
      } else if (tool === 'region' && isDrawing && drawStart) {
        // Handle region drawing visual feedback
        const pos = getMousePosition(e);
        // Could add visual feedback here
      }
    };

    const handleGlobalMouseUp = () => {
      if ((dragState.isDragging || dragState.isResizing) && selectedElement) {
        // Commit the final position to history
        addToHistory(elements);
        toast.success('Eleman güncellendi!');
      }
      
      if (tool === 'region' && isDrawing && drawStart) {
        const lastMouseEvent = document.elementFromPoint(0, 0); // This is a workaround
        // We'll handle region completion in canvas mouse up instead
      }
      
      setDragState({
        isDragging: false,
        isResizing: false,
        dragStart: { x: 0, y: 0 },
        elementStart: { x: 0, y: 0, width: 0, height: 0 },
        resizeHandle: null
      });
    };

    if (dragState.isDragging || dragState.isResizing || isDrawing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [dragState, selectedElement, elements, isDrawing, drawStart, tool, zoom]);

  const handleSave = () => {
    const layoutData = {
      id: id || crypto.randomUUID(),
      name: layoutName,
      elements,
      createdAt: currentLayout?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnail: '',
      tags: currentLayout?.tags || []
    };

    if (id) {
      updateLayout(layoutData);
      toast.success('Layout güncellendi!');
    } else {
      createLayout(layoutData);
      toast.success('Layout oluşturuldu!');
      navigate('/layouts');
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      default: return <Grid className="w-4 h-4" />;
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'd':
            e.preventDefault();
            if (selectedElement) {
              handleDuplicateElement(selectedElement);
            }
            break;
        }
      }
      
      if (e.key === 'Delete' && selectedElement) {
        handleDeleteElement(selectedElement);
      }
      
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, historyIndex]);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Tool Panel */}
      <div className="w-64 bg-surface border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate('/layouts')}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-textSecondary" />
            </button>
            <h2 className="text-lg font-semibold text-text">Layout Editor</h2>
          </div>
          
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Layout adı"
          />
        </div>

        {/* Tools */}
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-text mb-3">Araçlar</h3>
          
          {/* Tool Selection */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setTool('select')}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                tool === 'select' ? 'bg-primary text-white' : 'bg-background hover:bg-border text-textSecondary'
              }`}
            >
              <MousePointer className="w-5 h-5" />
              <span className="text-xs">Seç</span>
            </button>
            <button
              onClick={() => setTool('region')}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                tool === 'region' ? 'bg-primary text-white' : 'bg-background hover:bg-border text-textSecondary'
              }`}
            >
              <Square className="w-5 h-5" />
              <span className="text-xs">Bölge</span>
            </button>
          </div>

          {/* Element Types */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'image' as const, label: 'Resim', icon: Image },
              { type: 'video' as const, label: 'Video', icon: Video },
              { type: 'text' as const, label: 'Metin', icon: Type },
              { type: 'clock' as const, label: 'Saat', icon: Clock }
            ].map((toolItem) => (
              <button
                key={toolItem.type}
                onClick={() => handleAddElement(toolItem.type)}
                className="flex flex-col items-center gap-1 p-3 bg-background hover:bg-border rounded-lg transition-colors"
              >
                <toolItem.icon className="w-5 h-5 text-primary" />
                <span className="text-xs text-textSecondary">{toolItem.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layers */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Katmanlar ({elements.length})
          </h3>
          <div className="space-y-1">
            {elements.map((element, index) => (
              <div
                key={element.id}
                onClick={() => setSelectedElement(element.id)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedElement === element.id
                    ? 'bg-primary/20 border border-primary/30'
                    : 'hover:bg-background'
                }`}
              >
                {getElementIcon(element.type)}
                <span className="flex-1 text-sm text-text truncate">
                  {element.type === 'text' ? element.content?.slice(0, 15) + '...' : `${element.type} ${index + 1}`}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateElement(element.id);
                    }}
                    className="p-1 hover:bg-secondary/20 hover:text-secondary rounded transition-colors"
                    title="Kopyala (Ctrl+D)"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteElement(element.id);
                    }}
                    className="p-1 hover:bg-error/20 hover:text-error rounded transition-colors"
                    title="Sil (Delete)"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-colors ${
                  showGrid ? 'bg-primary text-white' : 'hover:bg-background text-textSecondary'
                }`}
                title="Grid'i Aç/Kapat"
              >
                <Grid className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-border"></div>
              <button 
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="p-2 hover:bg-background rounded-lg transition-colors text-textSecondary disabled:opacity-50"
                title="Geri Al (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button 
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                className="p-2 hover:bg-background rounded-lg transition-colors text-textSecondary disabled:opacity-50"
                title="İleri Al (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-2 hover:bg-background rounded-lg transition-colors text-textSecondary"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-text w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-2 hover:bg-background rounded-lg transition-colors text-textSecondary"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-2 hover:bg-background rounded-lg transition-colors text-textSecondary"
                title="100%'e Sıfırla"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-border"></div>

            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                previewMode ? 'bg-secondary text-white' : 'bg-background text-text hover:bg-border'
              }`}
            >
              <Eye className="w-4 h-4" />
              Önizleme
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
              title="Kaydet (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              className={`relative bg-black border-2 border-border rounded-xl overflow-hidden ${
                tool === 'region' ? 'cursor-crosshair' : 'cursor-default'
              }`}
              style={{
                width: `${1920 * (zoom / 100)}px`,
                height: `${1080 * (zoom / 100)}px`,
                backgroundImage: showGrid ? 
                  `radial-gradient(circle, #333 1px, transparent 1px)` : 'none',
                backgroundSize: showGrid ? `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px` : 'auto'
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseUp={(e) => {
                if (tool === 'region' && isDrawing && drawStart) {
                  const pos = getMousePosition(e);
                  const width = Math.abs(pos.x - drawStart.x);
                  const height = Math.abs(pos.y - drawStart.y);
                  
                  if (width > 20 && height > 20) {
                    const newElement: LayoutElement = {
                      id: crypto.randomUUID(),
                      type: 'image',
                      x: Math.min(drawStart.x, pos.x),
                      y: Math.min(drawStart.y, pos.y),
                      width,
                      height,
                      style: {
                        backgroundColor: '#9E7FFF',
                        borderRadius: 8,
                        opacity: 0.8
                      },
                      animation: {
                        type: 'fade',
                        duration: 1000
                      }
                    };
                    
                    const newElements = [...elements, newElement];
                    setElements(newElements);
                    addToHistory(newElements);
                    setSelectedElement(newElement.id);
                    toast.success('Yeni bölge eklendi!');
                  }
                  
                  setIsDrawing(false);
                  setDrawStart(null);
                  setTool('select');
                }
              }}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                  className={`absolute transition-all select-none ${
                    selectedElement === element.id
                      ? 'ring-2 ring-primary'
                      : 'hover:ring-1 hover:ring-primary/50'
                  } ${tool === 'select' ? 'cursor-move' : 'cursor-default'}`}
                  style={{
                    left: `${element.x * (zoom / 100)}px`,
                    top: `${element.y * (zoom / 100)}px`,
                    width: `${element.width * (zoom / 100)}px`,
                    height: `${element.height * (zoom / 100)}px`,
                    backgroundColor: element.style?.backgroundColor,
                    borderRadius: `${(element.style?.borderRadius || 0) * (zoom / 100)}px`,
                    opacity: element.style?.opacity || 1,
                    zIndex: selectedElement === element.id ? 10 : 1
                  }}
                >
                  {element.type === 'text' && (
                    <div
                      className="w-full h-full flex items-center justify-center text-center p-2 overflow-hidden"
                      style={{
                        fontSize: `${(element.style?.fontSize || 16) * (zoom / 100)}px`,
                        color: element.style?.color || '#FFFFFF'
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  
                  {element.type === 'image' && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded">
                      <Image className={`${zoom < 50 ? 'w-4 h-4' : 'w-8 h-8'} text-primary/60`} />
                    </div>
                  )}
                  
                  {element.type === 'video' && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-accent/20 rounded">
                      <Video className={`${zoom < 50 ? 'w-4 h-4' : 'w-8 h-8'} text-secondary/60`} />
                    </div>
                  )}
                  
                  {element.type === 'clock' && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20 rounded">
                      <Clock className={`${zoom < 50 ? 'w-4 h-4' : 'w-8 h-8'} text-accent/60`} />
                    </div>
                  )}

                  {/* Resize Handles */}
                  {selectedElement === element.id && tool === 'select' && !previewMode&& (
                    <>
                      {/* Corner handles */}
                      {['nw', 'ne', 'sw', 'se'].map((handle) => (
                        <div
                          key={handle}
                          onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                          className={`absolute w-3 h-3 bg-primary border-2 border-white rounded-full cursor-${handle}-resize ${
                            handle === 'nw' ? '-top-1.5 -left-1.5' :
                            handle === 'ne' ? '-top-1.5 -right-1.5' :
                            handle === 'sw' ? '-bottom-1.5 -left-1.5' :
                            '-bottom-1.5 -right-1.5'
                          }`}
                        />
                      ))}
                      
                      {/* Edge handles */}
                      {['n', 's', 'w', 'e'].map((handle) => (
                        <div
                          key={handle}
                          onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                          className={`absolute bg-primary border-2 border-white rounded cursor-${handle}-resize ${
                            handle === 'n' ? 'w-3 h-2 -top-1 left-1/2 transform -translate-x-1/2' :
                            handle === 's' ? 'w-3 h-2 -bottom-1 left-1/2 transform -translate-x-1/2' :
                            handle === 'w' ? 'w-2 h-3 -left-1 top-1/2 transform -translate-y-1/2' :
                            'w-2 h-3 -right-1 top-1/2 transform -translate-y-1/2'
                          }`}
                        />
                      ))}
                    </>
                  )}
                </div>
              ))}
              
              {/* Canvas Instructions */}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Canvas Boş</h3>
                    <p className="text-sm">
                      {tool === 'region' 
                        ? 'Yeni bölge çizmek için sürükleyin'
                        : 'Sol panelden eleman ekleyin veya bölge aracını kullanın'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      {selectedElementData && !previewMode && (
        <div className="w-80 bg-surface border-l border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Özellikler
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {selectedElementData.type}
              </span>
            </h3>
          </div>

          <div className="p-4 space-y-6">
            {/* Position & Size */}
            <div>
              <h4 className="text-sm font-medium text-text mb-3">Konum ve Boyut</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-textSecondary mb-1">X Konumu</label>
                  <input
                    type="number"
                    value={Math.round(selectedElementData.x)}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Y Konumu</label>
                  <input
                    type="number"
                    value={Math.round(selectedElementData.y)}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Genişlik</label>
                  <input
                    type="number"
                    min="20"
                    value={Math.round(selectedElementData.width)}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, { width: Math.max(20, parseInt(e.target.value) || 20) })}
                    className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Yükseklik</label>
                  <input
                    type="number"
                    min="20"
                    value={Math.round(selectedElementData.height)}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, { height: Math.max(20, parseInt(e.target.value) || 20) })}
                    className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            {selectedElementData.type === 'text' && (
              <div>
                <h4 className="text-sm font-medium text-text mb-3">İçerik</h4>
                <textarea
                  value={selectedElementData.content || ''}
                  onChange={(e) => commitElementUpdate(selectedElementData.id, { content: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  rows={3}
                  placeholder="Metin içeriği"
                />
              </div>
            )}

            {/* Style */}
            <div>
              <h4 className="text-sm font-medium text-text mb-3">Görünüm</h4>
              <div className="space-y-3">
                {selectedElementData.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs text-textSecondary mb-1">Yazı Boyutu</label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={selectedElementData.style?.fontSize || 16}
                        onChange={(e) => commitElementUpdate(selectedElementData.id, {
                          style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) }
                        })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-textSecondary">
                        <span>8px</span>
                        <span>{selectedElementData.style?.fontSize || 16}px</span>
                        <span>72px</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-textSecondary mb-1">Metin Rengi</label>
                      <input
                        type="color"
                        value={selectedElementData.style?.color || '#FFFFFF'}
                        onChange={(e) => commitElementUpdate(selectedElementData.id, {
                          style: { ...selectedElementData.style, color: e.target.value }
                        })}
                        className="w-full h-8 bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Arka Plan Rengi</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedElementData.style?.backgroundColor || '#9E7FFF'}
                      onChange={(e) => commitElementUpdate(selectedElementData.id, {
                        style: { ...selectedElementData.style, backgroundColor: e.target.value }
                      })}
                      className="flex-1 h-8 bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => commitElementUpdate(selectedElementData.id, {
                        style: { ...selectedElementData.style, backgroundColor: 'transparent' }
                      })}
                      className="px-3 py-1 text-xs bg-background border border-border rounded hover:border-primary transition-colors"
                    >
                      Şeffaf
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Köşe Yuvarlaklığı</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedElementData.style?.borderRadius || 8}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, {
                      style: { ...selectedElementData.style, borderRadius: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>0px</span>
                    <span>{selectedElementData.style?.borderRadius || 8}px</span>
                    <span>50px</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Şeffaflık</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElementData.style?.opacity || 1}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, {
                      style: { ...selectedElementData.style, opacity: parseFloat(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>0%</span>
                    <span>{Math.round((selectedElementData.style?.opacity || 1) * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Animation */}
            <div>
              <h4 className="text-sm font-medium text-text mb-3">Animasyon</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Animasyon Türü</label>
                  <select
                    value={selectedElementData.animation?.type || 'fade'}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, {
                      animation: { ...selectedElementData.animation, type: e.target.value as any }
                    })}
                    className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="none">Animasyon Yok</option>
                    <option value="fade">Solma Efekti</option>
                    <option value="slide">Kayma Efekti</option>
                    <option value="zoom">Büyüme Efekti</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Animasyon Süresi</label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={selectedElementData.animation?.duration || 1000}
                    onChange={(e) => commitElementUpdate(selectedElementData.id, {
                      animation: { ...selectedElementData.animation, duration: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>0.1s</span>
                    <span>{((selectedElementData.animation?.duration || 1000) / 1000).toFixed(1)}s</span>
                    <span>5s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-text mb-3">Hızlı İşlemler</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDuplicateElement(selectedElementData.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-background border border-border rounded hover:border-secondary transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Kopyala
                </button>
                <button
                  onClick={() => handleDeleteElement(selectedElementData.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-background border border-border rounded hover:border-error transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Help */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 left-6 bg-surface border border-border rounded-lg p-3 shadow-lg text-xs text-textSecondary z-50"
          >
            <div className="space-y-1">
              <div><kbd className="px-1 bg-background rounded">Del</kbd> Sil</div>
              <div><kbd className="px-1 bg-background rounded">Ctrl+D</kbd> Kopyala</div>
              <div><kbd className="px-1 bg-background rounded">Ctrl+Z</kbd> Geri Al</div>
              <div><kbd className="px-1 bg-background rounded">Esc</kbd> Seçimi Kaldır</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

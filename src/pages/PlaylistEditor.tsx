import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Clock,
  Image,
  Video,
  GripVertical,
  Eye,
  Edit2,
  Copy,
  Settings,
  Shuffle,
  Repeat,
  Music,
  FileText,
  Zap,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Pause,
  SkipForward,
  SkipBack,
  Volume2
} from 'lucide-react';
import { usePlaylistStore } from '../store/playlistStore';
import { useMediaStore } from '../store/mediaStore';
import toast from 'react-hot-toast';

interface PlaylistItem {
  id: string;
  mediaId: string;
  type: 'image' | 'video';
  name: string;
  duration: number; // in seconds
  url: string;
  transition?: {
    type: 'fade' | 'slide' | 'zoom' | 'flip' | 'dissolve' | 'wipe';
    duration: number;
  };
}

export default function PlaylistEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, createPlaylist, updatePlaylist } = usePlaylistStore();
  const { media } = useMediaStore();
  
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(100);
  const [isDragOverTimeline, setIsDragOverTimeline] = useState(false);
  
  // Get current playlist or create new
  const currentPlaylist = id ? playlists.find(p => p.id === id) : null;
  const [items, setItems] = useState<PlaylistItem[]>(
    currentPlaylist?.items || []
  );
  
  const [playlistName, setPlaylistName] = useState(
    currentPlaylist?.name || `Yeni Playlist ${playlists.length + 1}`
  );
  
  const [playlistDescription, setPlaylistDescription] = useState(
    currentPlaylist?.description || ''
  );

  const [playlistSettings, setPlaylistSettings] = useState({
    loop: true,
    shuffle: false,
    defaultDuration: 10, // seconds for images
    transitionType: 'fade' as const,
    transitionDuration: 1000 // ms
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  const getTotalDuration = () => {
    return items.reduce((total, item) => total + item.duration, 0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddMediaFromLibrary = (mediaItem: any) => {
    const newItem: PlaylistItem = {
      id: crypto.randomUUID(),
      mediaId: mediaItem.id,
      type: mediaItem.type.startsWith('image/') ? 'image' : 'video',
      name: mediaItem.name,
      duration: mediaItem.type.startsWith('image/') ? playlistSettings.defaultDuration : 30,
      url: mediaItem.url,
      transition: {
        type: playlistSettings.transitionType,
        duration: playlistSettings.transitionDuration
      }
    };
    
    setItems([...items, newItem]);
    toast.success(`${mediaItem.name} timeline'a eklendi!`);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<PlaylistItem>) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    if (selectedItem === itemId) {
      setSelectedItem(null);
    }
    toast.success('Öğe timeline\'dan kaldırıldı!');
  };

  const handleDuplicateItem = (itemId: string) => {
    const originalItem = items.find(item => item.id === itemId);
    if (originalItem) {
      const duplicatedItem = {
        ...originalItem,
        id: crypto.randomUUID(),
        name: `${originalItem.name} (Kopya)`
      };
      const originalIndex = items.findIndex(item => item.id === itemId);
      const newItems = [...items];
      newItems.splice(originalIndex + 1, 0, duplicatedItem);
      setItems(newItems);
      toast.success('Öğe kopyalandı!');
    }
  };

  const handleSave = () => {
    const playlistData = {
      id: id || crypto.randomUUID(),
      name: playlistName,
      description: playlistDescription,
      items,
      duration: getTotalDuration(),
      createdAt: currentPlaylist?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: currentPlaylist?.tags || []
    };

    if (id) {
      updatePlaylist(playlistData);
      toast.success('Playlist güncellendi!');
    } else {
      createPlaylist(playlistData);
      toast.success('Playlist oluşturuldu!');
    }

    navigate('/playlists');
  };

  const getItemIcon = (type: string) => {
    return type === 'image' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />;
  };

  const getTransitionIcon = (type: string) => {
    switch (type) {
      case 'fade': return <Zap className="w-3 h-3" />;
      case 'slide': return <SkipForward className="w-3 h-3" />;
      case 'zoom': return <ZoomIn className="w-3 h-3" />;
      case 'flip': return <RotateCw className="w-3 h-3" />;
      case 'dissolve': return <Zap className="w-3 h-3" />;
      case 'wipe': return <SkipBack className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const transitionOptions = [
    { value: 'fade', label: 'Solma', color: 'text-blue-400' },
    { value: 'slide', label: 'Kayma', color: 'text-green-400' },
    { value: 'zoom', label: 'Büyüme', color: 'text-purple-400' },
    { value: 'flip', label: 'Çevirme', color: 'text-orange-400' },
    { value: 'dissolve', label: 'Eritme', color: 'text-pink-400' },
    { value: 'wipe', label: 'Silme', color: 'text-cyan-400' }
  ];

  const selectedItemData = items.find(item => item.id === selectedItem);

  // Calculate timeline widths based on duration
  const calculateItemWidth = (duration: number) => {
    const totalDuration = getTotalDuration();
    if (totalDuration === 0) return 200;
    const baseWidth = Math.max(80, (duration / totalDuration) * 800 * (timelineZoom / 100));
    return Math.min(baseWidth, 400);
  };

  // Drag and Drop handlers for media library
  const handleDragStart = (e: React.DragEvent, mediaItem: any) => {
    e.dataTransfer.setData('mediaItem', JSON.stringify(mediaItem));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOverTimeline(true);
  };

  const handleTimelineDragLeave = (e: React.DragEvent) => {
    setIsDragOverTimeline(false);
  };

  const handleTimelineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTimeline(false);
    
    try {
      const mediaData = e.dataTransfer.getData('mediaItem');
      if (mediaData) {
        const mediaItem = JSON.parse(mediaData);
        handleAddMediaFromLibrary(mediaItem);
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  // Auto-play simulation
  useEffect(() => {
    if (isPlaying && items.length > 0) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const totalDuration = getTotalDuration();
          const next = prev + 1;
          return next >= totalDuration ? 0 : next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, items]);

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content - Timeline */}
      <div className="flex-1 flex flex-col">
        {/* Timeline Header */}
        <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/playlists')}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-textSecondary" />
            </button>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-text text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 min-w-[200px]"
                placeholder="Playlist adı"
              />
              
              <div className="w-px h-6 bg-border"></div>
              
              <div className="flex items-center gap-2 text-sm text-textSecondary">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(getTotalDuration())}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-textSecondary">
                <span>{items.length} öğe</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-lg transition-colors ${
                  isPlaying ? 'bg-primary text-white' : 'hover:bg-surface text-textSecondary'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-surface text-textSecondary transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-surface text-textSecondary transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-border"></div>

            {/* Timeline Zoom */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimelineZoom(Math.max(50, timelineZoom - 25))}
                className="p-2 hover:bg-background rounded-lg transition-colors text-textSecondary"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-text w-12 text-center">{timelineZoom}%</span>
              <button
                onClick={() => setTimelineZoom(Math.min(200, timelineZoom + 25))}
                className="p-2 hover:bg-background rounded-lg transition-colors text-textSecondary"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-border"></div>

            {/* Playlist Settings */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaylistSettings({ ...playlistSettings, shuffle: !playlistSettings.shuffle })}
                className={`p-2 rounded-lg transition-colors ${
                  playlistSettings.shuffle ? 'bg-primary text-white' : 'hover:bg-background text-textSecondary'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPlaylistSettings({ ...playlistSettings, loop: !playlistSettings.loop })}
                className={`p-2 rounded-lg transition-colors ${
                  playlistSettings.loop ? 'bg-primary text-white' : 'hover:bg-background text-textSecondary'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-border"></div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline Track */}
          <div 
            ref={timelineRef}
            className={`flex-1 p-6 overflow-auto transition-all ${
              isDragOverTimeline ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
            }`}
            onDragOver={handleTimelineDragOver}
            onDragLeave={handleTimelineDragLeave}
            onDrop={handleTimelineDrop}
          >
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-4">
                  <Play className="w-12 h-12 text-textSecondary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Timeline Boş</h3>
                <p className="text-textSecondary mb-4">
                  Aşağıdaki medya kütüphanesinden dosyaları buraya sürükleyin
                </p>
                <div className="text-sm text-textSecondary bg-surface rounded-lg p-4 border border-dashed border-border">
                  💡 <strong>İpucu:</strong> Medya dosyalarını timeline'a sürükleyip bırakın
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timeline Ruler */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-full bg-surface rounded-lg overflow-hidden border border-border">
                    <div className="flex items-center h-8 px-4 bg-background border-b border-border">
                      <span className="text-xs font-medium text-textSecondary">ZAMAN ÇİZGİSİ</span>
                    </div>
                    <div className="relative h-2 bg-background">
                      <div 
                        className="absolute top-0 left-0 h-full bg-primary rounded-r transition-all"
                        style={{ 
                          width: getTotalDuration() ? `${(currentTime / getTotalDuration()) * 100}%` : '0%' 
                        }}
                      />
                      <div 
                        className="absolute top-0 w-0.5 h-6 bg-primary -translate-y-2 transition-all"
                        style={{ 
                          left: getTotalDuration() ? `${(currentTime / getTotalDuration()) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline Items */}
                <Reorder.Group axis="x" values={items} onReorder={setItems} className="flex gap-3 pb-4 overflow-x-auto">
                  {items.map((item, index) => (
                    <Reorder.Item key={item.id} value={item}>
                      <motion.div
                        layout
                        className={`group relative flex-shrink-0 bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all ${
                          selectedItem === item.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        }`}
                        style={{ width: `${calculateItemWidth(item.duration)}px` }}
                        onClick={() => setSelectedItem(item.id)}
                      >
                        {/* Item Header */}
                        <div className="flex items-center gap-2 p-3 bg-background border-b border-border">
                          <div className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-textSecondary" />
                          </div>
                          <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-primary font-bold text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-text truncate">{item.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-textSecondary">
                              {getItemIcon(item.type)}
                              <span>{formatDuration(item.duration)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Preview */}
                        <div className="aspect-video relative overflow-hidden bg-background">
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-accent/20">
                              <Video className="w-8 h-8 text-secondary" />
                            </div>
                          )}
                          
                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewItem(item.id);
                                }}
                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                              >
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateItem(item.id);
                                }}
                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                              >
                                <Copy className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Transition Indicator */}
                        {index < items.length - 1 && (
                          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                            <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-lg">
                              <div className={`${transitionOptions.find(t => t.value === item.transition?.type)?.color || 'text-textSecondary'}`}>
                                {getTransitionIcon(item.transition?.type || 'fade')}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}
          </div>

          {/* Media Library Section */}
          <div className="h-80 bg-surface border-t border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Medya Kütüphanesi
                </h3>
                <span className="text-sm text-textSecondary">{media.length} dosya</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {media.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-3">
                      <Image className="w-8 h-8 text-textSecondary" />
                    </div>
                    <h4 className="text-lg font-semibold text-text mb-2">Medya kütüphanesi boş</h4>
                    <p className="text-textSecondary text-sm">Önce medya dosyalarınızı yükleyin</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {media.map((mediaItem) => (
                      <motion.div
                        key={mediaItem.id}
                        whileHover={{ scale: 1.05 }}
                        className="group bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 cursor-grab transition-all"
                        draggable
                        onDragStart={(e) => handleDragStart(e, mediaItem)}
                        onClick={() => handleAddMediaFromLibrary(mediaItem)}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          {mediaItem.type.startsWith('image/') ? (
                            <img 
                              src={mediaItem.url} 
                              alt={mediaItem.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-secondary/20 to-accent/20">
                              {mediaItem.type.startsWith('video/') ? '🎥' : 
                               mediaItem.type.startsWith('audio/') ? '🎵' : '📄'}
                            </div>
                          )}
                          
                          {/* Quick Add Overlay */}
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/80 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <h4 className="text-xs font-medium text-text truncate mb-1">{mediaItem.name}</h4>
                          <div className="flex items-center justify-between text-xs text-textSecondary">
                            <span>{mediaItem.type.startsWith('image/') ? 'Resim' : mediaItem.type.startsWith('video/') ? 'Video' : 'Diğer'}</span>
                            <span>{(mediaItem.size / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Item Properties */}
      {selectedItemData && (
        <div className="w-80 bg-surface border-l border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Öğe Ayarları
            </h3>
          </div>

          <div className="p-4 space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="text-sm font-medium text-text mb-3">Temel Bilgiler</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Ad</label>
                  <input
                    type="text"
                    value={selectedItemData.name}
                    onChange={(e) => handleUpdateItem(selectedItemData.id, { name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Süre (saniye)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={selectedItemData.duration}
                      onChange={(e) => handleUpdateItem(selectedItemData.id, { duration: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleUpdateItem(selectedItemData.id, { duration: Math.min(300, selectedItemData.duration + 1) })}
                        className="px-2 py-1 bg-background border border-border rounded text-xs hover:border-primary transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleUpdateItem(selectedItemData.id, { duration: Math.max(1, selectedItemData.duration - 1) })}
                        className="px-2 py-1 bg-background border border-border rounded text-xs hover:border-primary transition-colors"
                      >
                        -
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[5, 10, 15, 30].map(duration => (
                      <button
                        key={duration}
                        onClick={() => handleUpdateItem(selectedItemData.id, { duration })}
                        className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded hover:border-primary transition-colors"
                      >
                        {duration}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Transition Settings */}
            <div>
              <h4 className="text-sm font-medium text-text mb-3">Geçiş Efektleri</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-textSecondary mb-2">Geçiş Tipi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {transitionOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateItem(selectedItemData.id, {
                          transition: { ...selectedItemData.transition, type: option.value as any }})}
                        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-all ${
                          (selectedItemData.transition?.type || 'fade') === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:border-primary/50 text-textSecondary'
                        }`}
                      >
                        <div className={option.color}>
                          {getTransitionIcon(option.value)}
                        </div>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Geçiş Süresi</label>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="100"
                    value={selectedItemData.transition?.duration || 1000}
                    onChange={(e) => handleUpdateItem(selectedItemData.id, {
                      transition: { ...selectedItemData.transition, duration: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-textSecondary mt-1">
                    <span>0.2s</span>
                    <span className="font-medium text-text">
                      {((selectedItemData.transition?.duration || 1000) / 1000).toFixed(1)}s
                    </span>
                    <span>3.0s</span>
                  </div>
                  
                  <div className="flex gap-1 mt-2">
                    {[500, 1000, 1500, 2000].map(duration => (
                      <button
                        key={duration}
                        onClick={() => handleUpdateItem(selectedItemData.id, {
                          transition: { ...selectedItemData.transition, duration }
                        })}
                        className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded hover:border-primary transition-colors"
                      >
                        {duration/1000}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h4 className="text-sm font-medium text-text mb-3">Önizleme</h4>
              <div className="aspect-video bg-background border border-border rounded-lg overflow-hidden">
                {selectedItemData.type === 'image' ? (
                  <img 
                    src={selectedItemData.url} 
                    alt={selectedItemData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-accent/20">
                    <Video className="w-12 h-12 text-secondary" />
                  </div>
                )}
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs text-textSecondary">
                  <span>Geçiş: {transitionOptions.find(t => t.value === selectedItemData.transition?.type)?.label}</span>
                  <span>Süre: {formatDuration(selectedItemData.duration)}</span>
                </div>
                
                <div className="w-full bg-background rounded-full h-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-1000"
                    style={{ 
                      width: isPlaying ? '100%' : '0%',
                      transitionDuration: isPlaying ? `${selectedItemData.duration}s` : '0s'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleDuplicateItem(selectedItemData.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-background hover:bg-border border border-border rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Kopyala
              </button>
              <button
                onClick={() => handleDeleteItem(selectedItemData.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-error/10 text-error hover:bg-error hover:text-white border border-error/20 hover:border-error rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Timeline'dan Kaldır
              </button>
            </div>

            {/* Global Settings */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-text mb-3">Global Ayarlar</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Varsayılan resim süresi</label>
                  <select
                    value={playlistSettings.defaultDuration}
                    onChange={(e) => setPlaylistSettings({
                      ...playlistSettings,
                      defaultDuration: parseInt(e.target.value)
                    })}
                    className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value={5}>5 saniye</option>
                    <option value={10}>10 saniye</option>
                    <option value={15}>15 saniye</option>
                    <option value={30}>30 saniye</option>
                    <option value={60}>1 dakika</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-textSecondary mb-1">Varsayılan geçiş efekti</label>
                  <select
                    value={playlistSettings.transitionType}
                    onChange={(e) => setPlaylistSettings({
                      ...playlistSettings,
                      transitionType: e.target.value as any
                    })}
                    className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    {transitionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone Indicator */}
      {isDragOverTimeline && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-primary text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <span className="text-lg font-semibold">Timeline'a eklemek için bırakın</span>
          </div>
        </div>
      )}
    </div>
  );
}

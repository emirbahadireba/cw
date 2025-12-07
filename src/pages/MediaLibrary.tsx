import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, Filter, Grid, List, Play, Edit2, Trash2, Download, Eye, Calendar } from 'lucide-react';
import PageLayout from '../components/Layout/PageLayout';
import { useMediaStore } from '../store/mediaStore';

export default function MediaLibrary() {
  const { media = [], uploadMedia, deleteMedia } = useMediaStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video' | 'pdf'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Güvenli filtreleme - media undefined olsa bile çalışır
  const filteredMedia = (media || []).filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.type?.startsWith(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadMedia({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: e.target?.result as string,
          uploadedAt: new Date().toISOString(),
          tags: []
        });
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    event.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.startsWith('video/')) return '🎥';
    if (type?.includes('pdf')) return '📄';
    if (type?.startsWith('audio/')) return '🎵';
    return '📁';
  };

  return (
    <PageLayout title="Medya Kütüphanesi">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Action Bar - Kompakt */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary w-4 h-4" />
              <input
                type="text"
                placeholder="Medya dosyalarında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-textSecondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-surface border border-border rounded-lg text-text focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="image">Resimler</option>
                <option value="video">Videolar</option>
                <option value="audio">Ses</option>
                <option value="pdf">PDF</option>
              </select>
              
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface text-textSecondary hover:text-text'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface text-textSecondary hover:text-text'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <label className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg cursor-pointer transition-colors text-sm">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Yükle</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Stats - Kompakt */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Toplam', value: media.length, color: 'text-primary' },
              { label: 'Resimler', value: media.filter(m => m.type?.startsWith('image')).length, color: 'text-secondary' },
              { label: 'Videolar', value: media.filter(m => m.type?.startsWith('video')).length, color: 'text-accent' },
              { label: 'Boyut', value: formatFileSize(media.reduce((acc, m) => acc + (m.size || 0), 0)), color: 'text-success' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-border rounded-lg p-3"
              >
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-textSecondary text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Media Grid/List - Kompakt */}
          {filteredMedia.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-3">
                <Upload className="w-8 h-8 text-textSecondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                {media.length === 0 ? 'Henüz medya dosyası yok' : 'Arama sonucu bulunamadı'}
              </h3>
              <p className="text-textSecondary text-sm mb-4">
                {media.length === 0 
                  ? 'İlk medya dosyalarınızı yüklemek için "Yükle" butonunu kullanın.'
                  : 'Farklı arama terimleri veya filtreler deneyin.'
                }
              </p>
              {media.length === 0 && (
                <label className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg cursor-pointer transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  Dosya Yükle
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
                : "space-y-2"
              }
            >
              {filteredMedia.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={viewMode === 'grid' 
                    ? "group bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                    : "flex items-center gap-3 bg-surface border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
                  }
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="aspect-square relative overflow-hidden bg-background">
                        {item.type?.startsWith('image/') ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {getFileIcon(item.type)}
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1">
                            <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                              <Eye className="w-3 h-3 text-white" />
                            </button>
                            <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                              <Download className="w-3 h-3 text-white" />
                            </button>
                            <button 
                              onClick={() => deleteMedia(item.id)}
                              className="p-1.5 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <h3 className="text-xs font-medium text-text truncate mb-1">{item.name}</h3>
                        <p className="text-xs text-textSecondary">{formatFileSize(item.size)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-background flex-shrink-0">
                        {item.type?.startsWith('image/') ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {getFileIcon(item.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-text truncate mb-1">{item.name}</h3>
                        <p className="text-xs text-textSecondary">{formatFileSize(item.size)}</p>
                        <p className="text-xs text-textSecondary">
                          {new Date(item.uploadedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-textSecondary hover:text-text hover:bg-background rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-textSecondary hover:text-text hover:bg-background rounded transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteMedia(item.id)}
                          className="p-1.5 text-textSecondary hover:text-error hover:bg-error/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}

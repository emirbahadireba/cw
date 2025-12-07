import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Play, Edit2, Trash2, Clock, Image, Video, Copy, Calendar, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/Layout/PageLayout';
import { usePlaylistStore } from '../store/playlistStore';
import toast from 'react-hot-toast';

export default function Playlists() {
  const navigate = useNavigate();
  const { playlists, createPlaylist, deletePlaylist, duplicatePlaylist } = usePlaylistStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreatePlaylist = () => {
    const newPlaylist = {
      id: crypto.randomUUID(),
      name: `Yeni Playlist ${playlists.length + 1}`,
      description: 'Yeni playlist açıklaması',
      items: [],
      duration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };
    
    createPlaylist(newPlaylist);
    toast.success('Yeni playlist oluşturuldu!');
    
    // Navigate to editor with new playlist ID
    navigate(`/playlists/editor/${newPlaylist.id}`);
  };

  const handleDuplicatePlaylist = (playlistId: string) => {
    duplicatePlaylist(playlistId);
    toast.success('Playlist kopyalandı!');
  };

  const handleDeletePlaylist = (playlistId: string) => {
    deletePlaylist(playlistId);
    toast.success('Playlist silindi!');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlaylistStats = (playlist: any) => {
    const images = playlist.items.filter((item: any) => item.type === 'image').length;
    const videos = playlist.items.filter((item: any) => item.type === 'video').length;
    return { images, videos, total: playlist.items.length };
  };

  return (
    <PageLayout title="Playlist Yönetimi">
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
              placeholder="Playlistlerde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-textSecondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
          
          <button
            onClick={handleCreatePlaylist}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Yeni Playlist
          </button>
        </div>

        {/* Stats - Kompakt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Toplam Playlist', value: playlists.length, color: 'text-primary' },
            { label: 'Aktif Oynatma', value: playlists.filter(p => p.isActive).length, color: 'text-success' },
            { label: 'Toplam İçerik', value: playlists.reduce((acc, p) => acc + p.items.length, 0), color: 'text-secondary' }
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

        {/* Playlists Grid - Kompakt */}
        {filteredPlaylists.length === 0 && playlists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-textSecondary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Henüz playlist yok</h3>
            <p className="text-textSecondary text-sm mb-4">İlk playlistinizi oluşturmak için başlayın.</p>
            <button
              onClick={handleCreatePlaylist}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              İlk Playlistinizi Oluşturun
            </button>
          </motion.div>
        ) : filteredPlaylists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-textSecondary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Arama sonucu bulunamadı</h3>
            <p className="text-textSecondary text-sm mb-4">Farklı arama terimleri deneyin.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4gap-4"
          >
            {filteredPlaylists.map((playlist, index) => {
              const stats = getPlaylistStats(playlist);
              
              return (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Playlist Thumbnail - Kompakt */}
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary/60" />
                    </div>
                    
                    {/* Preview Items - Küçük */}
                    {playlist.items.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className={`absolute w-6 h-6 bg-primary/80 rounded ${
                          i === 0 ? 'top-2 left-2' :
                          i === 1 ? 'top-2 right-2' :
                          i === 2 ? 'bottom-2 left-2' : 'bottom-2 right-2'
                        } flex items-center justify-center`}
                      >
                        {item.type === 'image' ? 
                          <Image className="w-3 h-3 text-white" /> : 
                          <Video className="w-3 h-3 text-white" />
                        }
                      </div>
                    ))}
                    
                    {/* Status Indicator */}
                    {playlist.isActive && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2">
                        <div className="bg-success text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Aktif
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay Actions - Kompakt */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <Link
                          to={`/playlists/editor/${playlist.id}`}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4 text-white" />
                        </Link>
                        <button
                          onClick={() => handleDuplicatePlaylist(playlist.id)}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                          title="Kopyala"
                        >
                          <Copy className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-500 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Playlist Info - Kompakt */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-text truncate">{playlist.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-textSecondary bg-background px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {formatDuration(playlist.duration)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-textSecondary mb-2 line-clamp-2">{playlist.description}</p>
                    
                    {/* Stats - Kompakt */}
                    <div className="flex items-center gap-3 text-xs text-textSecondary mb-2">
                      <div className="flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        {stats.images}
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {stats.videos}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(playlist.updatedAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    
                    {/* Tags - Kompakt */}
                    {playlist.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {playlist.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                            {tag}
                          </span>
                        ))}
                        {playlist.tags.length > 2 && (
                          <span className="text-xs px-2 py-0.5 bg-background text-textSecondary rounded-full">
                            +{playlist.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </PageLayout>
  );
}

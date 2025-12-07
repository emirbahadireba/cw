import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Plus, Search, Wifi, WifiOff, Settings, Eye, Edit2, Trash2, Power, RotateCcw, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddDisplayModal from '../components/Modals/AddDisplayModal';

interface Display {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  resolution: string;
  orientation: 'landscape' | 'portrait';
  lastSeen: string;
  currentPlaylist?: string;
  ipAddress: string;
  model: string;
  temperature: number;
  platform?: 'web' | 'android' | 'raspberry' | 'windows';
  pairCode?: string;
}

export default function Displays() {
  const [displays, setDisplays] = useState<Display[]>([
    {
      id: '1',
      name: 'Ana Lobby Ekranı',
      location: 'Giriş Lobby',
      status: 'online',
      resolution: '1920x1080',
      orientation: 'landscape',
      lastSeen: '2024-01-20T10:30:00Z',
      currentPlaylist: 'Sabah Programı',
      ipAddress: '192.168.1.100',
      model: 'Samsung QM55R',
      temperature: 45,
      platform: 'web'
    },
    {
      id: '2',
      name: 'Kafeterya Ekranı',
      location: 'Kafeterya',
      status: 'online',
      resolution: '3840x2160',
      orientation: 'landscape',
      lastSeen: '2024-01-20T10:25:00Z',
      currentPlaylist: 'Yemek Menüsü',
      ipAddress: '192.168.1.101',
      model: 'LG 65UR9000PSA',
      temperature: 42,
      platform: 'android'
    },
    {
      id: '3',
      name: 'Toplantı Odası A',
      location: 'A Blok 2. Kat',
      status: 'offline',
      resolution: '1920x1080',
      orientation: 'landscape',
      lastSeen: '2024-01-19T15:45:00Z',
      ipAddress: '192.168.1.102',
      model: 'Philips BDL4330QL',
      temperature: 38,
      platform: 'raspberry'
    },
    {
      id: '4',
      name: 'Asansör Ekranı',
      location: 'Asansör İçi',
      status: 'error',
      resolution: '1080x1920',
      orientation: 'portrait',
      lastSeen: '2024-01-20T09:15:00Z',
      ipAddress: '192.168.1.103',
      model: 'Custom Portrait Display',
      temperature: 55,
      platform: 'windows'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'offline' | 'error'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDisplays = displays.filter(display => {
    const matchesSearch = display.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         display.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || display.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'offline': return 'text-textSecondary';
      case 'error': return 'text-error';
      default: return 'text-textSecondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Çevrimiçi';
      case 'offline': return 'Çevrimdışı';
      case 'error': return 'Hatalı';
      default: return 'Bilinmiyor';
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  const handleAddDisplay = (displayData: any) => {
    setDisplays([...displays, displayData]);
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'web': return '🌐';
      case 'android': return '📺';
      case 'raspberry': return '🥧';
      case 'windows': return '💻';
      default: return '📺';
    }
  };

  const getPlatformName = (platform?: string) => {
    switch (platform) {
      case 'web': return 'Web Player';
      case 'android': return 'Android TV';
      case 'raspberry': return 'Raspberry Pi';
      case 'windows': return 'Windows Player';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Ekran Yönetimi" />
        
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ekranlarda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="px-4 py-3 bg-surface border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Tüm Ekranlar</option>
                  <option value="online">Çevrimiçi</option>
                  <option value="offline">Çevrimdışı</option>
                  <option value="error">Hatalı</option>
                </select>
                
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Yeni Ekran</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Toplam Ekran', value: displays.length, color: 'text-primary' },
                { label: 'Çevrimiçi', value: displays.filter(d => d.status === 'online').length, color: 'text-success' },
                { label: 'Çevrimdışı', value: displays.filter(d => d.status === 'offline').length, color: 'text-textSecondary' },
                { label: 'Hatalı', value: displays.filter(d => d.status === 'error').length, color: 'text-error' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface border border-border rounded-xl p-4"
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-textSecondary text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Displays Grid */}
            {filteredDisplays.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-4">
                  <Monitor className="w-12 h-12 text-textSecondary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Henüz ekran yok</h3>
                <p className="text-textSecondary mb-4">İlk dijital ekranınızı sisteme ekleyin.</p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  İlk Ekranınızı Ekleyin
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredDisplays.map((display, index) => (
                  <motion.div
                    key={display.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-glow"
                  >
                    {/* Display Preview */}
                    <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Monitor className={`w-16 h-16 ${getStatusColor(display.status)}`} />
                      </div>
                      
                      {/* Platform Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs">
                        <span className="text-sm">{getPlatformIcon(display.platform)}</span>
                        <span className="text-textSecondary">{getPlatformName(display.platform)}</span>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className={`absolute top-3 right-3 flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                        display.status === 'online' ? 'bg-success/20 text-success' :
                        display.status === 'offline' ? 'bg-textSecondary/20 text-textSecondary' :
                        'bg-error/20 text-error'
                      }`}>
                        {getStatusIcon(display.status)}
                        {getStatusText(display.status)}
                      </div>
                      
                      {/* Temperature Warning */}
                      {display.temperature > 50 && (
                        <div className="absolute bottom-3 right-3 p-1 bg-error/20 rounded-full">
                          <AlertTriangle className="w-4 h-4 text-error" />
                        </div>
                      )}
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                            <Settings className="w-4 h-4 text-white" />
                          </button>
                          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                            <RotateCcw className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Display Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-text">{display.name}</h3>
                        <div className="text-xs text-textSecondary">
                          {display.temperature}°C
                        </div>
                      </div>
                      
                      <p className="text-sm text-textSecondary mb-3">{display.location}</p>
                      
                      {/* Technical Details */}
                      <div className="space-y-2 text-xs text-textSecondary mb-4">
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span className="text-text">{display.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Çözünürlük:</span>
                          <span className="text-text">{display.resolution}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IP Adresi:</span>
                          <span className="text-text font-mono">{display.ipAddress}</span>
                        </div>
                        {display.currentPlaylist && (
                          <div className="flex justify-between">
                            <span>Aktif Playlist:</span>
                            <span className="text-primary">{display.currentPlaylist}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Son Görülme:</span>
                          <span className="text-text">{formatLastSeen(display.lastSeen)}</span>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <button 
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            display.status === 'online' 
                              ? 'bg-error/10 text-error hover:bg-error hover:text-white' 
                              : 'bg-success/10 text-success hover:bg-success hover:text-white'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                          {display.status === 'online' ? 'Kapat' : 'Aç'}
                        </button>
                        <button className="p-2 text-textSecondary hover:text-text hover:bg-background rounded-lg transition-colors">
                          <Edit2 className="w-4 h4" />
                        </button>
                        <button className="p-2 text-textSecondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Add Display Modal */}
      <AddDisplayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddDisplay}
      />
    </div>
  );
}

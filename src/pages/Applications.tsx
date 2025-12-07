import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Grid, List, Clock, Calendar, Globe, Zap, Settings, Eye, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface Application {
  id: string;
  name: string;
  type: 'weather' | 'news' | 'social' | 'analytics' | 'clock' | 'calendar' | 'custom';
  description: string;
  status: 'active' | 'inactive';
  lastUsed: string;
  icon: React.ReactNode;
  color: string;
}

export default function Applications() {
  const [applications] = useState<Application[]>([
    {
      id: '1',
      name: 'Hava Durumu Widget',
      type: 'weather',
      description: 'Anlık hava durumu ve 5 günlük tahmin',
      status: 'active',
      lastUsed: '2024-01-20',
      icon: <Globe className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Haber Akışı',
      type: 'news',
      description: 'Güncel haberler ve duyurular',
      status: 'active',
      lastUsed: '2024-01-19',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '3',
      name: 'Dijital Saat',
      type: 'clock',
      description: 'Özelleştirilebilir dijital saat gösterimi',
      status: 'active',
      lastUsed: '2024-01-18',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '4',
      name: 'Takvim Widget',
      type: 'calendar',
      description: 'Etkinlikler ve önemli tarihler',
      status: 'inactive',
      lastUsed: '2024-01-15',
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || app.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <Globe className="w-4 h-4" />;
      case 'news': return <Zap className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      case 'calendar': return <Calendar className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'weather': return 'Hava Durumu';
      case 'news': return 'Haber';
      case 'clock': return 'Saat';
      case 'calendar': return 'Takvim';
      case 'social': return 'Sosyal Medya';
      case 'analytics': return 'Analitik';
      case 'custom': return 'Özel';
      default: return 'Diğer';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Uygulamalar & Widget'lar" />
        
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
                  placeholder="Uygulamalarda ara..."
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
                  <option value="all">Tüm Uygulamalar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
                
                <div className="flex border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface text-textSecondary hover:text-text'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface text-textSecondary hover:text-text'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Yeni Widget</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Toplam Uygulama', value: applications.length, color: 'text-primary' },
                { label: 'Aktif Uygulamalar', value: applications.filter(a => a.status === 'active').length, color: 'text-success' },
                { label: 'Pasif Uygulamalar', value: applications.filter(a => a.status === 'inactive').length, color: 'text-warning' },
                { label: 'Kategori Sayısı', value: new Set(applications.map(a => a.type)).size, color: 'text-secondary' }
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

            {/* Applications Grid/List */}
            {filteredApplications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-12 h-12 text-textSecondary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Henüz uygulama yok</h3>
                <p className="text-textSecondary mb-4">İlk widget uygulamanızı ekleyin.</p>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors">
                  <Plus className="w-5 h-5" />
                  İlk Uygulamanızı Ekleyin
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }
              >
                {filteredApplications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={viewMode === 'grid' 
                      ? "group bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-glow"
                      : "flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                    }
                  >
                    {viewMode === 'grid' ? (
                      <>
                        {/* App Icon/Header */}
                        <div className={`relative p-8 bg-gradient-to-br ${app.color} text-white`}>
                          <div className="flex items-center justify-center mb-4">
                            {app.icon}
                          </div>
                          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                            app.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        
                        {/* App Info */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-text">{app.name}</h3>
                          </div>
                          
                          <p className="text-sm text-textSecondary mb-3 line-clamp-2">{app.description}</p>
                          
                          <div className="flex items-center justify-between text-xs text-textSecondary mb-3">
                            <div className="flex items-center gap-1">
                              {getTypeIcon(app.type)}
                              {getTypeName(app.type)}
                            </div>
                            <span className={app.status === 'active' ? 'text-success' : 'text-warning'}>
                              {app.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                          
                          <div className="text-xs text-textSecondary mb-4">
                            Son kullanım: {new Date(app.lastUsed).toLocaleDateString('tr-TR')}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                              Önizle
                            </button>
                            <button className="p-2 text-textSecondary hover:text-text hover:bg-background rounded-lg transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-textSecondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* App Icon */}
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white flex-shrink-0 relative`}>
                          {app.icon}
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${
                            app.status === 'active' ? 'bg-success' : 'bg-warning'
                          }`}></div>
                        </div>
                        
                        {/* App Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-text truncate">{app.name}</h3>
                            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full flex items-center gap-1">
                              {getTypeIcon(app.type)}
                              {getTypeName(app.type)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-textSecondary mb-2 line-clamp-1">{app.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-textSecondary">
                            <span className={app.status === 'active' ? 'text-success' : 'text-warning'}>
                              {app.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                            <span>Son kullanım: {new Date(app.lastUsed).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-textSecondary hover:text-text hover:bg-background rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-textSecondary hover:text-text hover:bg-background rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-textSecondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
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
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Monitor, Play, Calendar, Download, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');

  // Sample data
  const viewsData = [
    { name: 'Pzt', views: 1200, interactions: 45 },
    { name: 'Sal', views: 1900, interactions: 67 },
    { name: 'Çar', views: 1500, interactions: 52 },
    { name: 'Per', views: 2200, interactions: 78 },
    { name: 'Cum', views: 1800, interactions: 63 },
    { name: 'Cmt', views: 2100, interactions: 71 },
    { name: 'Paz', views: 1600, interactions: 58 }
  ];

  const contentPerformance = [
    { name: 'Videolar', value: 45, color: '#9E7FFF' },
    { name: 'Resimler', value: 35, color: '#38bdf8' },
    { name: 'Widget\'lar', value: 20, color: '#f472b6' }
  ];

  const displayStats = [
    { name: 'Lobby Ekranı', uptime: 98.5, views: 15420, avgTime: '2:34' },
    { name: 'Kafeterya', uptime: 96.2, views: 12840, avgTime: '1:58' },
    { name: 'Toplantı Odası A', uptime: 94.8, views: 8760, avgTime: '3:12' },
    { name: 'Asansör', uptime: 87.3, views: 5230, avgTime: '0:45' }
  ];

  const topContent = [
    { name: 'Şirket Tanıtım Videosu', views: 5420, duration: '2:15', type: 'video' },
    { name: 'Haftalık Menü', views: 4830, duration: '0:30', type: 'image' },
    { name: 'Hava Durumu Widget', views: 4200, duration: '∞', type: 'widget' },
    { name: 'Duyurular Slideshow', views: 3950, duration: '1:45', type: 'image' },
    { name: 'Sosyal Medya Akışı', views: 3620, duration: '∞', type: 'widget' }
  ];

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'today': return 'Bugün';
      case 'week': return 'Bu Hafta';
      case 'month': return 'Bu Ay';
      case 'year': return 'Bu Yıl';
      default: return 'Bu Hafta';
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'widget': return '⚡';
      default: return '📄';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analitik & Raporlar" />
        
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex gap-2">
                {[
                  { key: 'today', label: 'Bugün' },
                  { key: 'week', label: 'Bu Hafta' },
                  { key: 'month', label: 'Bu Ay' },
                  { key: 'year', label: 'Bu Yıl' }
                ].map(period => (
                  <button
                    key={period.key}
                    onClick={() => setSelectedPeriod(period.key as any)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedPeriod === period.key 
                        ? 'bg-primary text-white' 
                        : 'bg-surface text-textSecondary hover:text-text hover:bg-background'}`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 ml-auto">
                <button className="flex items-center gap-2 px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-background transition-colors">
                  <Filter className="w-4 h-4" />
                  Filtreler
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Rapor İndir
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Toplam Görüntüleme', value: '127.5K', change: '+12.3%', icon: Eye, color: 'text-primary' },
                { label: 'Aktif Ekranlar', value: '12', change: '+2', icon: Monitor, color: 'text-success' },
                { label: 'Oynatılan İçerik', value: '248', change: '+18', icon: Play, color: 'text-secondary' },
                { label: 'Ortalama Süre', value: '2:15', change: '+8%', icon: Calendar, color: 'text-accent' }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`w-8 h-8 ${metric.color}`} />
                    <span className="text-success text-sm font-medium">{metric.change}</span>
                  </div>
                  <div className={`text-3xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                  <div className="text-textSecondary text-sm">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Views Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface border border-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text">Görüntüleme Analizi</h3>
                  <span className="text-sm text-textSecondary">{getPeriodText(selectedPeriod)}</span>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
                    <XAxis dataKey="name" stroke="#A3A3A3" />
                    <YAxis stroke="#A3A3A3" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#262626', 
                        border: '1px solid #2F2F2F',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }} 
                    />
                    <Bar dataKey="views" fill="#9E7FFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Content Performance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-surface border border-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text">İçerik Performansı</h3>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#262626', 
                        border: '1px solid #2F2F2F',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="flex justify-center gap-4 mt-4">
                  {contentPerformance.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-textSecondary">{item.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Display Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-text">Ekran Performansı</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {displayStats.map((display, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-text font-medium">{display.name}</span>
                            <span className="text-sm text-textSecondary">{display.uptime}% uptime</span>
                          </div>
                          
                          <div className="w-full bg-background rounded-full h-2 mb-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${display.uptime}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-sm text-textSecondary">
                            <span>{display.views.toLocaleString()} görüntüleme</span>
                            <span>Ort. {display.avgTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Top Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-text">En Popüler İçerikler</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {topContent.map((content, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
                          #{index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{getContentIcon(content.type)}</span>
                            <span className="text-text font-medium">{content.name}</span>
                          </div>
                          <div className="flex justify-between text-sm text-textSecondary">
                            <span>{content.views.toLocaleString()} görüntüleme</span>
                            <span>{content.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

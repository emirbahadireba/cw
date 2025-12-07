import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Play, Plus, Edit2, Trash2, Monitor, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface ScheduleItem {
  id: string;
  name: string;
  playlistId: string;
  playlistName: string;
  displayId: string;
  displayName: string;
  startTime: string;
  endTime: string;
  days: string[];
  status: 'active' | 'upcoming' | 'expired';
  createdAt: string;
}

export default function Scheduling() {
  const [schedules] = useState<ScheduleItem[]>([
    {
      id: '1',
      name: 'Sabah Programı',
      playlistId: '1',
      playlistName: 'Sabah İçerikleri',
      displayId: '1',
      displayName: 'Ana Lobby Ekranı',
      startTime: '08:00',
      endTime: '12:00',
      days: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Öğle Arası',
      playlistId: '2',
      playlistName: 'Öğle Programı',
      displayId: '2',
      displayName: 'Kafeterya Ekranı',
      startTime: '12:00',
      endTime: '14:00',
      days: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
      status: 'upcoming',
      createdAt: '2024-01-16'
    }
  ]);

  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'upcoming': return 'text-warning';
      case 'expired': return 'text-error';
      default: return 'text-textSecondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'upcoming': return 'Bekliyor';
      case 'expired': return 'Süresi Doldu';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Program Zamanlama" />
        
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="flex border border-border rounded-xl overflow-hidden w-fit">
                  <button
                    onClick={() => setSelectedView('list')}
                    className={`px-4 py-2 text-sm ${selectedView === 'list' ? 'bg-primary text-white' : 'bg-surface text-texthover:bg-background'} transition-colors`}
                  >
                    Liste Görünümü
                  </button>
                  <button
                    onClick={() => setSelectedView('calendar')}
                    className={`px-4 py-2 text-sm ${selectedView === 'calendar' ? 'bg-primary text-white' : 'bg-surface text-text hover:bg-background'} transition-colors`}
                  >
                    Takvim Görünümü
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Yeni Zamanlama
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Aktif Programlar', value: schedules.filter(s => s.status === 'active').length, color: 'text-success' },
                { label: 'Bekleyen', value: schedules.filter(s => s.status === 'upcoming').length, color: 'text-warning' },
                { label: 'Toplam Program', value: schedules.length, color: 'text-primary' },
                { label: 'Bağlı Ekranlar', value: 3, color: 'text-secondary' }
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

            {/* Schedule List */}
            {selectedView === 'list' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {schedules.map((schedule, index) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Schedule Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-text">{schedule.name}</h3>
                          <div className={`flex items-center gap-1 text-sm ${getStatusColor(schedule.status)}`}>
                            {getStatusIcon(schedule.status)}
                            {getStatusText(schedule.status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-textSecondary">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            <span>Playlist: {schedule.playlistName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            <span>Ekran: {schedule.displayName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{schedule.days.length} gün</span>
                          </div>
                        </div>
                        
                        {/* Days */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {schedule.days.map((day) => (
                            <span key={day} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                              {day.substring(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-textSecondary hover:text-text hover:bg-background rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-textSecondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Calendar View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-surface border border-border rounded-xl p-6"
              >
                <div className="text-center text-textSecondary py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Takvim Görünümü</h3>
                  <p>Takvim görünümü yakında eklenecek...</p>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {schedules.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-12 h-12 text-textSecondary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Henüz program zamanlaması yok</h3>
                <p className="text-textSecondary mb-4">İlk program zamanlamanızı oluşturun.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  İlk Zamanlamayı Oluştur
                </button>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

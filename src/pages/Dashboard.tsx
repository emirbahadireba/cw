import React from 'react';
import PageLayout from '../components/Layout/PageLayout';
import { Monitor, Users, PlayCircle, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const stats = [
  {
    title: 'Aktif Ekranlar',
    value: '247',
    change: '+12%',
    changeType: 'increase',
    icon: Monitor,
    color: 'text-success'
  },
  {
    title: 'Toplam Kullanıcı',
    value: '1,429',
    change: '+8%',
    changeType: 'increase',
    icon: Users,
    color: 'text-secondary'
  },
  {
    title: 'Aktif Playlistler',
    value: '89',
    change: '+23%',
    changeType: 'increase',
    icon: PlayCircle,
    color: 'text-primary'
  },
  {
    title: 'Zamanlanmış İçerik',
    value: '156',
    change: '+5%',
    changeType: 'increase',
    icon: Calendar,
    color: 'text-accent'
  }
];

const weeklyData = [
  { day: 'Pzt', views: 4200, engagement: 68 },
  { day: 'Sal', views: 3800, engagement: 72 },
  { day: 'Çar', views: 5100, engagement: 81 },
  { day: 'Per', views: 4600, engagement: 75 },
  { day: 'Cum', views: 6200, engagement: 89 },
  { day: 'Cmt', views: 3900, engagement: 65 },
  { day: 'Paz', views: 2800, engagement: 58 }
];

const deviceData = [
  { name: 'Android TV', value: 45, color: '#10b981' },
  { name: 'Smart Display', value: 30, color: '#3b82f6' },
  { name: 'iPad', value: 15, color: '#8b5cf6' },
  { name: 'Web Player', value: 10, color: '#f59e0b' }
];

const recentAlerts = [
  { id: 1, type: 'error', message: 'Mağaza-15 ekranı çevrimdışı', time: '5 dk önce', severity: 'high' },
  { id: 2, type: 'warning', message: 'Depo alanı %85 dolu', time: '1 saat önce', severity: 'medium' },
  { id: 3, type: 'info', message: 'Yeni layout "Yaz Kampanyası" oluşturuldu', time: '2 saat önce', severity: 'low' },
  { id: 4, type: 'success', message: 'Tüm ekranlar senkronize edildi', time: '3 saat önce', severity: 'low' }
];

export default function Dashboard() {
  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid - Kompakt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-surface border border-border rounded-xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${
                    stat.color === 'text-success' ? 'from-success/20 to-success/10' :
                    stat.color === 'text-secondary' ? 'from-secondary/20 to-secondary/10' :
                    stat.color === 'text-primary' ? 'from-primary/20 to-primary/10' :
                    'from-accent/20 to-accent/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'increase' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text mb-1">{stat.value}</p>
                  <p className="text-textSecondary text-sm">{stat.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section - Kompakt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Analytics */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text">Haftalık Performans</h3>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-success text-sm font-medium">+15.3%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)'
                  }}
                />
                <Bar dataKey="views" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9E7FFF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9E7FFF" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Device Distribution */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <h3 className="text-lg font-bold text-text mb-4">Cihaz Dağılımı</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {deviceData.map((device, index) => (
                <div key={device.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: device.color }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm text-text font-medium">{device.name}</p>
                    <p className="text-xs text-textSecondary">{device.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Alerts - Kompakt */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-surface border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text">Son Uyarılar</h3>
              <button className="text-primary text-sm hover:text-primary/80 transition-colors">
                Tümünü Gör
              </button>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 bg-background/50 ${
                    alert.type === 'error' ? 'border-l-error bg-error/5' :
                    alert.type === 'warning' ? 'border-l-warning bg-warning/5' :
                    alert.type === 'info' ? 'border-l-secondary bg-secondary/5' :
                    'border-l-success bg-success/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className={`w-4 h-4 mt-0.5 ${
                        alert.type === 'error' ? 'text-error' :
                        alert.type === 'warning' ? 'text-warning' :
                        alert.type === 'info' ? 'text-secondary' :
                        'text-success'
                      }`} />
                      <div className="flex-1">
                        <p className="text-text text-sm font-medium">{alert.message}</p>
                        <p className="text-textSecondary text-xs mt-1">{alert.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'high' ? 'bg-error/20 text-error' :
                      alert.severity === 'medium' ? 'bg-warning/20 text-warning' :
                      'bg-success/20 text-success'
                    }`}>
                      {alert.severity === 'high' ? 'Yüksek' : 
                       alert.severity === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions - Kompakt */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <h3 className="text-lg font-bold text-text mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              >
                Yeni Layout Oluştur
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-3 bg-background border border-border text-text rounded-lg text-sm font-medium hover:border-primary transition-all"
              >
                Medya Yükle
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-3 bg-background border border-border text-text rounded-lg text-sm font-medium hover:border-primary transition-all"
              >
                Playlist Düzenle
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-3 bg-background border border-border text-text rounded-lg text-sm font-medium hover:border-primary transition-all"
              >
                Ekran Durumu
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* System Status - Kompakt */}
        <motion.divinitial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-surface border border-border rounded-xl p-5"
        >
          <h3 className="text-lg font-bold text-text mb-4">Sistem Durumu</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-success rounded-full"></div>
              </div>
              <p className="text-text font-medium text-sm">API Durumu</p>
              <p className="text-success text-xs">Çevrimiçi</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-success rounded-full"></div>
              </div>
              <p className="text-text font-medium text-sm">Veritabanı</p>
              <p className="text-success text-xs">Sağlıklı</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-warning rounded-full"></div>
              </div>
              <p className="text-text font-medium text-sm">CDN</p>
              <p className="text-warning text-xs">Kısmi Sorun</p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

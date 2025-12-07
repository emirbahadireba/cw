import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layout, 
  Image, 
  List, 
  Calendar, 
  Smartphone, 
  Monitor, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Layoutlar', href: '/layouts', icon: Layout },
  { name: 'Medya Kütüphanesi', href: '/media', icon: Image },
  { name: 'Playlistler', href: '/playlists', icon: List },
  { name: 'Zamanlama', href: '/scheduling', icon: Calendar },
  { name: 'Uygulamalar', href: '/applications', icon: Smartphone },
  { name: 'Ekranlar', href: '/displays', icon: Monitor },
  { name: 'Analitik', href: '/analytics', icon: BarChart3 },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-surface border-r border-border flex flex-col h-screen relative"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SignageCloud</h1>
                <p className="text-xs text-textSecondary">{user?.tenantName}</p>
              </div>
            </motion.div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-background hover:bg-border transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-textSecondary hover:text-white hover:bg-background'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'}
            alt={user?.name}
            className="w-10 h-10 rounded-full"
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-textSecondary truncate">{user?.email}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

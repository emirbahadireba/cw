import React from 'react';
import { Bell, Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="Ara..."
            className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-80"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 bg-background rounded-lg border border-border hover:border-primary transition-colors group"
          title={isDark ? 'Light Mode\'a geç' : 'Dark Mode\'a geç'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-warning group-hover:rotate-12 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-primary group-hover:-rotate-12 transition-transform" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-background rounded-lg border border-border hover:border-primary transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full flex items-center justify-center text-xs text-white">
            3
          </span>
        </motion.button>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-textSecondary">{user?.role}</p>
          </div>
          
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background transition-colors">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl py-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50"
            >
              <a href="#" className="flex items-center px-4 py-2 text-sm hover:bg-background transition-colors">
                <User className="w-4 h-4 mr-3" />
                Profil
              </a>
              <hr className="border-border my-1" />
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-background transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Çıkış Yap
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

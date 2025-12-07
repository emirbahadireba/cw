import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Layouts from './pages/Layouts';
import MediaLibrary from './pages/MediaLibrary';
import Playlists from './pages/Playlists';
import Scheduling from './pages/Scheduling';
import Applications from './pages/Applications';
import Displays from './pages/Displays';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LayoutEditor from './pages/LayoutEditor';
import PlaylistEditor from './pages/PlaylistEditor';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { isDark } = useThemeStore();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Apply theme class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-text">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/layouts" element={<Layouts />} />
            <Route path="/layouts/editor/:id?" element={<LayoutEditor />} />
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/editor/:id?" element={<PlaylistEditor />} />
            <Route path="/scheduling" element={<Scheduling />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/displays" element={<Displays />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: isDark ? '#262626' : '#F8FAFC',
              color: isDark ? '#FFFFFF' : '#1F2937',
              border: isDark ? '1px solid #2F2F2F' : '1px solid #E5E7EB',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;

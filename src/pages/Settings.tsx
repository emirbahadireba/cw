import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Bell, Palette, Monitor, Globe, Database, Key, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Dijital Tabela Sistemi',
      timezone: 'Europe/Istanbul',
      language: 'tr',
      dateFormat: 'DD/MM/YYYY'
    },
    display: {
      defaultTransition: 'fade',
      transitionDuration: 1000,
      screenTimeout: 30,
      autoRestart: true
    },
    notifications: {
      emailAlerts: true,
      systemAlerts: true,
      maintenanceAlerts: true,
      offlineAlerts: true
    },
    security: {
      sessionTimeout: 30,
      twoFactorAuth: false,
      apiAccess: true,
      auditLog: true
    }
  });

  const tabs = [
    { id: 'general', label: 'Genel', icon: SettingsIcon },
    { id: 'display', label: 'Ekran', icon: Monitor },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'users', label: 'Kullanıcılar', icon: User },
    { id: 'api', label: 'API', icon: Key }
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Here you would typically save to backend
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Sistem Ayarları" />
        
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Settings Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-surface border-b-2 border-primary text-primary'
                      : 'text-textSecondary hover:text-text hover:bg-surface/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="bg-surface border border-border rounded-xl">
              {/* General Settings */}
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-text mb-6">Genel Ayarlar</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Şirket Adı</label>
                      <input
                        type="text"
                        value={settings.general.companyName}
                        onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Saat Dilimi</label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="Europe/Istanbul">Istanbul (GMT+3)</option>
                          <option value="UTC">UTC (GMT+0)</option>
                          <option value="America/New_York">New York (GMT-5)</option>
                          <option value="Europe/London">London (GMT+0)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Dil</label>
                        <select
                          value={settings.general.language}
                          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="tr">Türkçe</option>
                          <option value="en">English</option>
                          <option value="de">Deutsch</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Display Settings */}
              {activeTab === 'display' && (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-text mb-6">Ekran Ayarları</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Varsayılan Geçiş Efekti</label>
                        <select
                          value={settings.display.defaultTransition}
                          onChange={(e) => handleSettingChange('display', 'defaultTransition', e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="fade">Solma</option>
                          <option value="slide">Kayma</option>
                          <option value="zoom">Yakınlaştırma</option>
                          <option value="flip">Çevirme</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Geçiş Süresi (ms)</label>
                        <input
                          type="number"
                          min="100"
                          max="5000"
                          step="100"
                          value={settings.display.transitionDuration}
                          onChange={(e) => handleSettingChange('display', 'transitionDuration', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Ekran Zaman Aşımı (dakika)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.display.screenTimeout}
                        onChange={(e) => handleSettingChange('display', 'screenTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="autoRestart"
                        checked={settings.display.autoRestart}
                        onChange={(e) => handleSettingChange('display', 'autoRestart', e.target.checked)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                      />
                      <label htmlFor="autoRestart" className="text-text">Otomatik yeniden başlatma</label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-text mb-6">Bildirim Ayarları</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailAlerts', label: 'E-posta Bildirimleri', description: 'Önemli sistem olayları için e-posta bildirimleri al' },
                      { key: 'systemAlerts', label: 'Sistem Uyarıları', description: 'Sistem hatları ve performans sorunları için uyarılar' },
                      { key: 'maintenanceAlerts', label: 'Bakım Bildirimleri', description: 'Zamanlanmış bakım ve güncellemeler hakkında bilgi' },
                      { key: 'offlineAlerts', label: 'Çevrimdışı Uyarıları', description: 'Ekranlar çevrimdışı olduğunda anında bildirim' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-start gap-3 p-4 bg-background rounded-xl">
                        <input
                          type="checkbox"
                          id={setting.key}
                          checked={settings.notifications[setting.key as keyof typeof settings.notifications]}
                          onChange={(e) => handleSettingChange('notifications', setting.key, e.target.checked)}
                          className="w-5 h-5 mt-1 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <div>
                          <label htmlFor={setting.key} className="text-text font-medium block">{setting.label}</label>
                          <p className="text-textSecondary text-sm mt-1">{setting.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-text mb-6">Güvenlik Ayarları</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Oturum Zaman Aşımı (dakika)</label>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'twoFactorAuth', label: 'İki Faktörlü Kimlik Doğrulama', description: 'Hesap güvenliği için ek doğrulama katmanı' },
                        { key: 'apiAccess', label: 'API Erişimi', description: 'Harici uygulamaların API üzerinden erişimine izin ver' },
                        { key: 'auditLog', label: 'Denetim Günlüğü', description: 'Tüm sistem aktivitelerini kaydet ve izle' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-start gap-3 p-4 bg-background rounded-xl">
                          <input
                            type="checkbox"
                            id={setting.key}
                            checked={settings.security[setting.key as keyof typeof settings.security]}
                            onChange={(e) => handleSettingChange('security', setting.key, e.target.checked)}
                            className="w-5 h-5 mt-1 rounded border-border text-primary focus:ring-primary/20"
                          />
                          <div>
                            <label htmlFor={setting.key} className="text-text font-medium block">{setting.label}</label>
                            <p className="text-textSecondary text-sm mt-1">{setting.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-text mb-6">Kullanıcı Yönetimi</h2>
                  
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-textSecondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text mb-2">Kullanıcı Yönetimi</h3>
                    <p className="text-textSecondary">Kullanıcı yönetimi özelliği yakında eklenecek...</p>
                  </div>
                </motion.div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-text mb-6">API Ayarları</h2>
                  
                  <div className="text-center py-12">
                    <Key className="w-16 h-16 text-textSecondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text mb-2">API Yönetimi</h3>
                    <p className="text-textSecondary">API anahtarları ve webhook ayarları yakında eklenecek...</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors"
              >
                <Save className="w-5 h-5" />
                Ayarları Kaydet
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

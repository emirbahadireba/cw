import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Monitor, 
  Smartphone, 
  Tv, 
  Cpu, 
  Windows, 
  Chrome,
  ArrowRight,
  ArrowLeft,
  Copy,
  CheckCircle,
  Wifi,
  Download,
  Settings,
  QrCode,
  Shield,
  Globe,
  HardDrive
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AddDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (displayData: any) => void;
}

type PlatformType = 'web' | 'android' | 'raspberry' | 'windows';

interface Platform {
  id: PlatformType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirements: string[];
  features: string[];
}

export default function AddDisplayModal({ isOpen, onClose, onSuccess }: AddDisplayModalProps) {
  const [step, setStep] = useState<'platform' | 'pairing'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [pairCode, setPairCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayLocation, setDisplayLocation] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const platforms: Platform[] = [
    {
      id: 'web',
      name: 'Web Player',
      description: 'Herhangi bir web tarayıcısında çalışır',
      icon: <Globe className="w-8 h-8" />,
      color: 'text-blue-500',
      requirements: [
        'Modern web tarayıcısı (Chrome, Firefox, Safari)',
        'Stabil internet bağlantısı',
        'Tam ekran desteği'
      ],
      features: [
        'Kolay kurulum',
        'Otomatik güncellemeler',
        'Çoklu platform desteği',
        'Uzaktan yönetim'
      ]
    },
    {
      id: 'android',
      name: 'Android TV',
      description: 'Android TV cihazları için optimize edilmiş',
      icon: <Tv className="w-8 h-8" />,
      color: 'text-green-500',
      requirements: [
        'Android TV 7.0 veya üstü',
        'Minimum 2GB RAM',
        '4K çözünürlük desteği',
        'Wi-Fi veya Ethernet bağlantısı'
      ],
      features: [
        '4K/HDR içerik desteği',
        'Donanım hızlandırması',
        'Düşük güç tüketimi',
        'Android TV remote desteği'
      ]
    },
    {
      id: 'raspberry',
      name: 'Raspberry Pi',
      description: 'Raspberry Pi cihazları için özelleştirilmiş',
      icon: <Cpu className="w-8 h-8" />,
      color: 'text-pink-500',
      requirements: [
        'Raspberry Pi 4 (4GB+ RAM önerilir)',
        'MicroSD kart (32GB+)',
        'HDMI çıkışı',
        'Güvenilir güç kaynağı'
      ],
      features: [
        'Düşük maliyet',
        'Yüksek güvenilirlik',
        'GPIO kontrol desteği',
        'Linux tabanlı sistem'
      ]
    },
    {
      id: 'windows',
      name: 'Windows Player',
      description: 'Windows bilgisayarlar için masaüstü uygulaması',
      icon: <Windows className="w-8 h-8" />,
      color: 'text-blue-600',
      requirements: [
        'Windows 10/11 (64-bit)',
        'Minimum 4GB RAM',
        'DirectX 11 desteği',
        '.NET Framework 4.8+'
      ],
      features: [
        'Yüksek performans',
        'Çoklu monitör desteği',
        'Gelişmiş grafik işleme',
        'Sistem entegrasyonu'
      ]
    }
  ];

  const generatePairCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  const handlePlatformSelect = (platformId: PlatformType) => {
    setSelectedPlatform(platformId);
  };

  const handleContinue = () => {
    if (!selectedPlatform) return;
    setStep('pairing');
    setPairCode(generatePairCode());
    
    // Set default display name based on platform
    const platformName = platforms.find(p => p.id === selectedPlatform)?.name || '';
    setDisplayName(`${platformName} Ekranı`);
  };

  const handleBack = () => {
    setStep('platform');
    setSelectedPlatform(null);
    setPairCode('');
    setDisplayName('');
    setDisplayLocation('');
  };

  const handleConnect = async () => {
    if (!displayName.trim() || !displayLocation.trim()) {
      toast.error('Lütfen tüm alanları doldurun!');
      return;
    }

    setIsConnecting(true);

    // Simulate connection process
    setTimeout(() => {
      const newDisplay = {
        id: crypto.randomUUID(),
        name: displayName,
        location: displayLocation,
        platform: selectedPlatform,
        status: 'online',
        resolution: selectedPlatform === 'raspberry' ? '1920x1080' : '3840x2160',
        orientation: 'landscape',
        lastSeen: new Date().toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        model: selectedPlatformData?.name || 'Unknown',
        temperature: Math.floor(Math.random() * 20) + 35,
        pairCode: pairCode
      };

      setIsConnecting(false);
      onSuccess(newDisplay);
      toast.success(`${displayName} başarıyla eklendi!`);
      handleModalClose();
    }, 3000);
  };

  const handleModalClose = () => {
    setStep('platform');
    setSelectedPlatform(null);
    setPairCode('');
    setDisplayName('');
    setDisplayLocation('');
    setIsConnecting(false);
    onClose();
  };

  const copyPairCode = () => {
    navigator.clipboard.writeText(pairCode);
    toast.success('Pair kodu kopyalandı!');
  };

  const getSetupInstructions = (platform: PlatformType) => {
    switch (platform) {
      case 'web':
        return {
          title: 'Web Player Kurulumu',
          steps: [
            'Ekran cihazında web tarayıcısını açın',
            'Şu adrese gidin: player.dijitalsignage.com',
            'Aşağıdaki pair kodunu girin',
            'Tam ekran moduna geçin (F11)'
          ],
          additionalInfo: '💡 İpucu: Tarayıcı yer imlerine ekleyerek otomatik başlatma ayarlayabilirsiniz.'
        };
      
      case 'android':
        return {
          title: 'Android TV Kurulumu',
          steps: [
            'Google Play Store\'dan "Digital Signage Player" uygulamasını indirin',
            'Uygulamayı açın ve "Pair Device" seçeneğini seçin',
            'Aşağıdaki pair kodunu girin',
            'Otomatik başlatma iznini verin'
          ],
          additionalInfo: '⚙️ Uygulama otomatik olarak güncellenir ve sistem başlangıcında çalışır.'
        };
      
      case 'raspberry':
        return {
          title: 'Raspberry Pi Kurulumu',
          steps: [
            'Raspberry Pi\'ye özel image dosyasını indirin',
            'SD karta yazdırın ve Raspberry Pi\'ye takın',
            'İlk açılışta Wi-Fi ayarlarını yapın',
            'Ekranda görünen pair kodunu aşağıya girin'
          ],
          additionalInfo: '🔧 Image dosyası tüm gerekli yazılımları içerir ve otomatik yapılandırma yapar.'
        };
      
      case 'windows':
        return {
          title: 'Windows Player Kurulumu',
          steps: [
            'Windows Player\'ı resmi siteden indirin',
            'Yönetici olarak çalıştırın ve yükleyin',
            'Uygulamayı açın ve "Add Display" butonuna tıklayın',
            'Aşağıdaki pair kodunu girin'
          ],
          additionalInfo: '🛡️ Windows Defender\'dan güvenlik izni isteyebilir. "Allow" seçeneğini seçin.'
        };
      
      default:
        return { title: '', steps: [], additionalInfo: '' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Yeni Ekran Ekle</h2>
                  <p className="text-sm text-textSecondary">
                    {step === 'platform' ? 'Platform seçimi yapın' : 'Ekranı sisteme bağlayın'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-textSecondary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {step === 'platform' ? (
                /* Platform Selection Step */
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text mb-2">Platform Seçimi</h3>
                    <p className="text-textSecondary">Ekranınızın çalışacağı platformu seçin</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {platforms.map((platform) => (
                      <motion.button
                        key={platform.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePlatformSelect(platform.id)}
                        className={`p-6 bg-background border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                          selectedPlatform === platform.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`${platform.color} bg-current/10 p-3 rounded-xl`}>
                            {platform.icon}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-text mb-1">{platform.name}</h4>
                            <p className="text-sm text-textSecondary mb-4">{platform.description}</p>
                            
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-xs font-medium text-text mb-2">Gereksinimler:</h5>
                                <ul className="space-y-1">
                                  {platform.requirements.map((req, i) => (
                                    <li key={i} className="text-xs text-textSecondary flex items-center gap-2">
                                      <div className="w-1 h-1 bg-textSecondary rounded-full"></div>
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="text-xs font-medium text-text mb-2">Özellikler:</h5>
                                <ul className="space-y-1">
                                  {platform.features.map((feature, i) => (
                                    <li key={i} className="text-xs text-textSecondary flex items-center gap-2">
                                      <CheckCircle className="w-3 h-3 text-success" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {selectedPlatform === platform.id && (
                          <div className="mt-4 flex items-center justify-center">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={handleContinue}
                      disabled={!selectedPlatform}
                      className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colorsdisabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Devam Et
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Pairing Step */
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={handleBack}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-textSecondary" />
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold text-text">{selectedPlatformData?.name} Kurulumu</h3>
                      <p className="text-textSecondary">Ekranı sisteme bağlamak için aşağıdaki adımları izleyin</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Setup Instructions */}
                    <div className="space-y-6">
                      <div className="bg-background rounded-xl p-6 border border-border">
                        <h4 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-primary" />
                          {getSetupInstructions(selectedPlatform!).title}
                        </h4>
                        
                        <div className="space-y-4">
                          {getSetupInstructions(selectedPlatform!).steps.map((step, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-text pt-1">{step}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <p className="text-sm text-text">{getSetupInstructions(selectedPlatform!).additionalInfo}</p>
                        </div>
                      </div>

                      {/* Platform Specific Downloads/Links */}
                      <div className="bg-background rounded-xl p-6 border border-border">
                        <h4 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                          <Download className="w-5 h-5 text-secondary" />
                          İndirme Linkleri
                        </h4>
                        
                        {selectedPlatform === 'web' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                              <div>
                                <p className="text-text font-medium">Web Player URL</p>
                                <p className="text-sm text-textSecondary">player.dijitalsignage.com</p>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText('https://player.dijitalsignage.com');
                                  toast.success('URL kopyalandı!');
                                }}
                                className="p-2 hover:bg-background rounded-lg transition-colors"
                              >
                                <Copy className="w-4 h-4 text-textSecondary" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {selectedPlatform === 'android' && (
                          <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-surface hover:bg-background rounded-lg transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                  <Download className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="text-left">
                                  <p className="text-text font-medium">Google Play Store</p>
                                  <p className="text-sm text-textSecondary">Digital Signage Player</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-textSecondary" />
                            </button>
                          </div>
                        )}
                        
                        {selectedPlatform === 'raspberry' && (
                          <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-surface hover:bg-background rounded-lg transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                  <HardDrive className="w-4 h-4 text-pink-500" />
                                </div>
                                <div className="text-left">
                                  <p className="text-text font-medium">Raspberry Pi Image</p>
                                  <p className="text-sm text-textSecondary">signage-pi-v2.4.img (2.1 GB)</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-textSecondary" />
                            </button>
                          </div>
                        )}
                        
                        {selectedPlatform === 'windows' && (
                          <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-surface hover:bg-background rounded-lg transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                  <Windows className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-left">
                                  <p className="text-text font-medium">Windows Player</p>
                                  <p className="text-sm text-textSecondary">signage-player-setup.exe (45 MB)</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-textSecondary" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pairing Form */}
                    <div className="space-y-6">
                      {/* Pair Code */}
                      <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                        <h4 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                          <QrCode className="w-5 h-5 text-primary" />
                          Pair Kodu
                        </h4>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 bg-background border border-border rounded-xl p-4">
                            <div className="text-center">
                              <div className="text-3xl font-mono font-bold text-primary mb-2 tracking-wider">
                                {pairCode}
                              </div>
                              <p className="text-xs text-textSecondary">Bu kodu ekran cihazına girin</p>
                            </div>
                          </div>
                          <button
                            onClick={copyPairCode}
                            className="p-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="text-center">
                          <button
                            onClick={() => setPairCode(generatePairCode())}
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            Yeni kod oluştur
                          </button>
                        </div>
                      </div>

                      {/* Display Configuration */}
                      <div className="bg-background rounded-xl p-6 border border-border">
                        <h4 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                          <Monitor className="w-5 h-5 text-secondary" />
                          Ekran Bilgileri
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">Ekran Adı</label>
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="Örn: Lobby Ana Ekranı"
                              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">Lokasyon</label>
                            <input
                              type="text"
                              value={displayLocation}
                              onChange={(e) => setDisplayLocation(e.target.value)}
                              placeholder="Örn: A Blok Giriş Holü"
                              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security Notice */}
                      <div className="bg-background rounded-xl p-6 border border-border">
                        <h4 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-success" />
                          Güvenlik
                        </h4>
                        
                        <div className="space-y-3 text-sm text-textSecondary">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            <span>Tüm bağlantılar SSL/TLS ile şifrelenir</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            <span>Pair kodları tek kullanımlık ve zaman sınırlıdır</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            <span>Ekran sadece yetkili içerikleri görüntüler</span>
                          </div>
                        </div>
                      </div>

                      {/* Connect Button */}
                      <button
                        onClick={handleConnect}
                        disabled={isConnecting || !displayName.trim() || !displayLocation.trim()}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary hover:bg-primary/80 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                      >
                        {isConnecting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Bağlanıyor...
                          </>
                        ) : (
                          <>
                            <Wifi className="w-5 h-5" />
                            Ekranı Bağla
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

# Deployment Guide - Cloudflare + Railway

## 🏗️ Deployment Yapısı

```
┌─────────────────┐
│  Cloudflare     │  Frontend (Static)
│  Pages          │  https://your-app.pages.dev
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│  Railway        │  Backend API
│  Backend        │  https://your-backend.railway.app
└────────┬────────┘
         │
         │ Database Connection
         │
┌────────▼────────┐
│  Railway        │  PostgreSQL Database
│  PostgreSQL     │  (Same Project)
└─────────────────┘
```

## ✅ Bu Yapı Neden Uygun?

1. **Cloudflare Pages**
   - ✅ Ücretsiz static hosting
   - ✅ Global CDN
   - ✅ Otomatik SSL
   - ✅ Hızlı deployment
   - ✅ Git entegrasyonu

2. **Railway Backend**
   - ✅ Kolay deployment
   - ✅ Otomatik scaling
   - ✅ Environment variables yönetimi
   - ✅ Log görüntüleme
   - ✅ PostgreSQL entegrasyonu

3. **Railway PostgreSQL**
   - ✅ Backend ile aynı projede
   - ✅ Otomatik backup
   - ✅ Kolay connection string
   - ✅ Ücretsiz tier mevcut

## 🚀 Deployment Adımları

### 1. Railway Setup (Backend + Database)

#### A. Railway'de Proje Oluştur

1. [Railway.app](https://railway.app) → New Project
2. "Deploy from GitHub repo" seç
3. Repository'yi bağla: **`emirbahadireba/cw`**

#### B. PostgreSQL Database Ekle

1. Railway projesinde → "+ New" → "Database" → "Add PostgreSQL"
2. Database otomatik oluşturulur
3. **DATABASE_URL** otomatik environment variable olarak eklenir

#### C. Backend Service Ekle

1. Railway projesinde → "+ New" → "GitHub Repo"
2. Repository seç: **`emirbahadireba/cw`**
3. Settings → Root Directory: **`backend`** olarak ayarla
4. Railway otomatik olarak:
   - Node.js projesini algılar
   - `npm install` çalıştırır
   - `npm start` ile başlatır

#### D. Environment Variables Ayarla

Railway Dashboard → Backend Service → Variables:

```bash
# Server
PORT=3000
NODE_ENV=production

# Database (Railway otomatik ekler, kontrol et)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (GÜÇLÜ DEĞERLER KULLAN!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Cloudflare Pages URL'i)
CORS_ORIGIN=https://your-app.pages.dev
# veya custom domain
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Storage (Cloudflare R2 önerilir)
STORAGE_TYPE=r2
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=digital-signage-media
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Frontend URL
FRONTEND_URL=https://your-app.pages.dev
```

#### E. Database Migration Çalıştır

Railway Dashboard → Backend Service → Deployments → "..." → "Run Command":

```bash
npm run migrate
```

#### F. Seed Data Yükle (Opsiyonel)

```bash
npm run seed
```

#### G. Backend URL'ini Not Et

Railway Dashboard → Backend Service → Settings → Domain
Örnek: `https://your-backend.railway.app`

---

### 2. Cloudflare Pages Setup (Frontend)

#### A. Cloudflare Pages'de Proje Oluştur

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. "Create a project" → "Connect to Git"
3. Repository seç: **`emirbahadireba/cw`**

#### B. Build Settings

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: / (root)
```

#### C. Environment Variables

Cloudflare Pages → Project → Settings → Environment Variables:

```bash
# Production
VITE_API_URL=https://your-backend.railway.app/api

# Preview (opsiyonel)
VITE_API_URL=https://your-backend.railway.app/api
```

#### D. Custom Domain (Opsiyonel)

1. Cloudflare Pages → Project → Custom domains
2. Domain ekle
3. DNS kayıtlarını Cloudflare'e yönlendir

---

## 🔧 Post-Deployment Checklist

### Backend (Railway)
- [ ] Database migration çalıştırıldı
- [ ] Seed data yüklendi (plan limits)
- [ ] Environment variables ayarlandı
- [ ] Health check çalışıyor: `https://your-backend.railway.app/health`
- [ ] CORS origin doğru ayarlandı
- [ ] JWT secret'ları güçlü değerlerle değiştirildi
- [ ] File storage (R2) yapılandırıldı

### Frontend (Cloudflare Pages)
- [ ] Build başarılı
- [ ] Environment variable (VITE_API_URL) ayarlandı
- [ ] Custom domain ayarlandı (opsiyonel)
- [ ] SSL aktif

### Test
- [ ] Frontend açılıyor
- [ ] Login çalışıyor
- [ ] API çağrıları başarılı
- [ ] CORS hatası yok

---

## 🔒 Güvenlik Kontrolleri

### Backend
- ✅ JWT secret'ları güçlü (min 32 karakter)
- ✅ CORS sadece frontend domain'ine izin veriyor
- ✅ Rate limiting aktif
- ✅ Helmet.js security headers aktif
- ✅ Environment variables Railway'de güvenli

### Frontend
- ✅ API URL environment variable'da
- ✅ Sensitive data localStorage'da (token'lar)
- ✅ HTTPS zorunlu (Cloudflare otomatik)

---

## 📊 Monitoring

### Railway
- **Logs**: Railway Dashboard → Backend Service → Logs
- **Metrics**: Railway Dashboard → Backend Service → Metrics
- **Database**: Railway Dashboard → PostgreSQL → Metrics

### Cloudflare
- **Analytics**: Cloudflare Dashboard → Pages → Analytics
- **Logs**: Cloudflare Dashboard → Pages → Logs

---

## 🚨 Sorun Giderme

### Backend Başlamıyor
1. Railway logs kontrol et
2. Environment variables kontrol et
3. Database connection kontrol et
4. Port 3000 kullanılabilir mi kontrol et

### Frontend API Çağrıları Başarısız
1. CORS hatası mı? → Backend CORS_ORIGIN kontrol et
2. 404 hatası? → VITE_API_URL doğru mu kontrol et
3. Network hatası? → Backend çalışıyor mu kontrol et

### Database Connection Error
1. DATABASE_URL doğru mu?
2. Railway PostgreSQL çalışıyor mu?
3. Migration çalıştırıldı mı?

---

## 💰 Maliyet Tahmini

### Cloudflare Pages
- ✅ Ücretsiz (sınırsız bandwidth, 500 build/ay)

### Railway
- **Backend**: $5/ay (Hobby plan) veya ücretsiz tier
- **PostgreSQL**: $5/ay (Hobby plan) veya ücretsiz tier
- **Toplam**: ~$10/ay veya ücretsiz tier

### Cloudflare R2 (File Storage)
- ✅ İlk 10GB ücretsiz
- Sonrası: $0.015/GB/ay

---

## 🎯 Sonuç

Bu yapı **tamamen uygun** ve production-ready!

✅ Kolay deployment
✅ Ölçeklenebilir
✅ Güvenli
✅ Maliyet etkin
✅ Global CDN (Cloudflare)
✅ Otomatik SSL
✅ Kolay yönetim

**Hazır! Deployment'a başlayabilirsiniz! 🚀**


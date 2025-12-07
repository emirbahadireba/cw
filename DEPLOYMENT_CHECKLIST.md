# Deployment Checklist

## ✅ Pre-Deployment

### Backend (Railway)
- [ ] Railway hesabı oluşturuldu
- [ ] GitHub repository Railway'e bağlandı
- [ ] PostgreSQL database eklendi
- [ ] Backend service eklendi
- [ ] Environment variables hazırlandı

### Frontend (Cloudflare)
- [ ] Cloudflare hesabı oluşturuldu
- [ ] GitHub repository Cloudflare'e bağlandı
- [ ] Build settings hazırlandı

---

## 🚀 Deployment Steps

### 1. Railway Backend

#### A. PostgreSQL Database
- [ ] Railway'de PostgreSQL servisi oluşturuldu
- [ ] DATABASE_URL otomatik oluşturuldu
- [ ] Database bağlantısı test edildi

#### B. Backend Service
- [ ] Backend service Railway'e eklendi
- [ ] Root directory: `backend` olarak ayarlandı
- [ ] Build command: `npm install` (otomatik)
- [ ] Start command: `npm start` (otomatik)

#### C. Environment Variables
- [ ] `PORT=3000`
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `JWT_SECRET` (güçlü değer, min 32 karakter)
- [ ] `JWT_REFRESH_SECRET` (güçlü değer, min 32 karakter)
- [ ] `JWT_EXPIRES_IN=15m`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`
- [ ] `CORS_ORIGIN` (Cloudflare Pages URL)
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `STORAGE_TYPE=r2` (veya s3)
- [ ] R2 credentials (eğer R2 kullanılıyorsa)
- [ ] `FRONTEND_URL` (Cloudflare Pages URL)

#### D. Database Migration
- [ ] Railway Dashboard → Backend → Deployments → Run Command
- [ ] Command: `npm run migrate`
- [ ] Migration başarılı

#### E. Seed Data
- [ ] Command: `npm run seed` (opsiyonel)
- [ ] Seed başarılı

#### F. Backend URL
- [ ] Backend URL not edildi: `https://xxx.railway.app`
- [ ] Health check çalışıyor: `/health`

---

### 2. Cloudflare Pages Frontend

#### A. Project Setup
- [ ] Cloudflare Pages'de proje oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Branch: `main` (veya `master`)

#### B. Build Settings
- [ ] Framework preset: `Vite`
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`
- [ ] Root directory: `/` (root)

#### C. Environment Variables
- [ ] `VITE_API_URL=https://xxx.railway.app/api` (Production)
- [ ] `VITE_API_URL=https://xxx.railway.app/api` (Preview, opsiyonel)

#### D. Custom Domain (Opsiyonel)
- [ ] Domain eklendi
- [ ] DNS kayıtları yapılandırıldı
- [ ] SSL aktif

#### E. First Deployment
- [ ] Build başarılı
- [ ] Frontend erişilebilir

---

## ✅ Post-Deployment Tests

### Backend Tests
- [ ] Health check: `GET /health` → 200 OK
- [ ] Database connected: Health check response'da `database: "connected"`
- [ ] CORS çalışıyor: Frontend'den API çağrısı başarılı
- [ ] Login endpoint: `POST /api/auth/login` → Token döner

### Frontend Tests
- [ ] Frontend açılıyor
- [ ] Login sayfası görünüyor
- [ ] Login işlemi çalışıyor
- [ ] Dashboard yükleniyor
- [ ] API çağrıları başarılı (Network tab'da kontrol et)
- [ ] CORS hatası yok

### Integration Tests
- [ ] Login → Token alınıyor
- [ ] Token localStorage'da saklanıyor
- [ ] Authenticated request'ler çalışıyor
- [ ] Logout çalışıyor
- [ ] Token refresh çalışıyor (eğer test edildiyse)

---

## 🔒 Security Checklist

### Backend
- [ ] JWT secret'ları güçlü (min 32 karakter, random)
- [ ] CORS sadece frontend domain'ine izin veriyor
- [ ] Rate limiting aktif
- [ ] Helmet.js security headers aktif
- [ ] Environment variables Railway'de güvenli (gizli)
- [ ] Database connection SSL ile (production'da)

### Frontend
- [ ] API URL environment variable'da (kodda hardcode yok)
- [ ] Token'lar localStorage'da (güvenli)
- [ ] HTTPS zorunlu (Cloudflare otomatik)
- [ ] Sensitive data console'da loglanmıyor

---

## 📊 Monitoring Setup

### Railway
- [ ] Logs görüntülenebiliyor
- [ ] Metrics görüntülenebiliyor
- [ ] Database metrics görüntülenebiliyor
- [ ] Alert'ler ayarlandı (opsiyonel)

### Cloudflare
- [ ] Analytics görüntülenebiliyor
- [ ] Build logs görüntülenebiliyor
- [ ] Custom domain analytics (eğer varsa)

---

## 🚨 Troubleshooting

### Backend Başlamıyor
- [ ] Railway logs kontrol edildi
- [ ] Environment variables kontrol edildi
- [ ] Database connection kontrol edildi
- [ ] Port conflict yok

### Frontend Build Başarısız
- [ ] Build logs kontrol edildi
- [ ] Environment variables kontrol edildi
- [ ] Dependencies yüklendi mi kontrol edildi

### API Çağrıları Başarısız
- [ ] CORS hatası var mı? → Backend CORS_ORIGIN kontrol et
- [ ] 404 hatası? → VITE_API_URL doğru mu?
- [ ] Network hatası? → Backend çalışıyor mu?
- [ ] 401 hatası? → Token doğru mu? Login tekrar yap

---

## ✅ Final Checklist

- [ ] Backend production'da çalışıyor
- [ ] Frontend production'da çalışıyor
- [ ] Database migration'ları çalıştırıldı
- [ ] Seed data yüklendi
- [ ] Environment variables ayarlandı
- [ ] CORS doğru yapılandırıldı
- [ ] Security kontrolleri yapıldı
- [ ] Test'ler başarılı
- [ ] Monitoring aktif
- [ ] Custom domain ayarlandı (eğer varsa)

**🎉 Deployment Tamamlandı!**


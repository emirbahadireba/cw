# 🚀 Deployment Rehberi - CW Repository

## 📦 Repository Bilgileri

**GitHub Repository:** https://github.com/emirbahadireba/cw

**Yapı:**
```
cw/
├── backend/          # Backend API (Railway'de deploy edilecek)
├── src/              # Frontend (Cloudflare Pages'de deploy edilecek)
├── package.json      # Frontend dependencies
└── vite.config.ts    # Vite configuration
```

---

## 🎯 Deployment Yapısı

```
┌─────────────────────────┐
│  Cloudflare Pages       │  Frontend
│  https://xxx.pages.dev  │  Repository: emirbahadireba/cw
└────────────┬────────────┘
             │
             │ API Calls
             │
┌────────────▼────────────┐
│  Railway Backend        │  Backend API
│  https://xxx.railway.app│  Root: backend/
└────────────┬────────────┘
             │
             │ Database
             │
┌────────────▼────────────┐
│  Railway PostgreSQL     │  Database
│  (Same Project)         │  Auto-configured
└─────────────────────────┘
```

---

## ⚡ Hızlı Başlangıç (16 Adım)

### 📦 RAILWAY SETUP

#### 1. Railway Hesabı
- [ ] https://railway.app → GitHub ile giriş
- [ ] Repository erişim izni ver

#### 2. PostgreSQL Database
- [ ] "+ New" → "Database" → "Add PostgreSQL"
- [ ] Database oluşturuldu ✅

#### 3. Backend Service
- [ ] "+ New" → "GitHub Repo"
- [ ] Repository seç: **`emirbahadireba/cw`**
- [ ] Settings → Root Directory: **`backend`**
- [ ] Save

#### 4. Environment Variables
Backend → Variables → Ekle:

```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<32-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://xxx.pages.dev
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://xxx.pages.dev
```

**JWT Secret oluştur:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. Migration
- [ ] Deployments → "..." → "Run Command"
- [ ] `npm run migrate`
- [ ] Başarılı ✅

#### 6. Seed (Opsiyonel)
- [ ] Deployments → "..." → "Run Command"
- [ ] `npm run seed`

#### 7. Backend URL
- [ ] Settings → Domain kopyala
- [ ] Not et: `https://xxx.railway.app`

#### 8. Health Check
- [ ] `https://xxx.railway.app/health`
- [ ] `{"status":"ok"}` ✅

---

### 🌐 CLOUDFLARE PAGES SETUP

#### 9. Cloudflare Hesabı
- [ ] https://dash.cloudflare.com → Giriş

#### 10. Proje Oluştur
- [ ] Workers & Pages → "Create application"
- [ ] "Pages" → "Connect to Git"
- [ ] Repository: **`emirbahadireba/cw`**
- [ ] "Begin setup"

#### 11. Build Settings
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: / (boş - root'ta)
```

#### 12. Environment Variable
```
VITE_API_URL=https://xxx.railway.app/api
```
(ADIM 7'deki backend URL)

#### 13. Deploy
- [ ] "Save and Deploy"
- [ ] Build tamamlanana kadar bekle (2-5 dk)

#### 14. Frontend URL
- [ ] "View site" → URL kopyala
- [ ] Not et: `https://xxx.pages.dev`

---

### 🔗 BAĞLANTI

#### 15. CORS Güncelle
- [ ] Railway → Backend → Variables
- [ ] `CORS_ORIGIN` → Frontend URL (ADIM 14)
- [ ] `https://xxx.pages.dev`

#### 16. Test
- [ ] Frontend: `https://xxx.pages.dev`
- [ ] Login sayfası görünüyor ✅
- [ ] Login: `admin@example.com` / `password` (seed varsa)
- [ ] Dashboard açılıyor ✅

---

## ✅ TAMAMLANDI!

**Repository:** `emirbahadireba/cw`  
**Backend:** `https://xxx.railway.app`  
**Frontend:** `https://xxx.pages.dev`  
**Database:** Railway PostgreSQL

---

## 📝 Önemli Notlar

### Repository Yapısı
- ✅ Backend: `backend/` klasöründe
- ✅ Frontend: Root'ta (`src/`, `package.json`)
- ✅ Railway: Root directory = `backend`
- ✅ Cloudflare: Root directory = `/` (root)

### Environment Variables

**Railway (Backend):**
- `DATABASE_URL` → Otomatik (PostgreSQL'den)
- `CORS_ORIGIN` → Cloudflare Pages URL
- `JWT_SECRET` → Güçlü random string

**Cloudflare (Frontend):**
- `VITE_API_URL` → Railway backend URL + `/api`

---

## 🆘 Sorun Giderme

### Backend başlamıyor?
1. Railway → Backend → Logs kontrol et
2. Environment variables eksik mi?
3. Root directory `backend` mi?

### Frontend build başarısız?
1. Cloudflare → Build logs kontrol et
2. `VITE_API_URL` doğru mu?
3. Root directory `/` (boş) mu?

### CORS hatası?
1. Backend `CORS_ORIGIN` = Frontend URL mi?
2. `https://` ile başlıyor mu?
3. Sonunda `/` yok mu?

---

## 🎉 Başarılar!

Detaylı rehber için: `STEP_BY_STEP_DEPLOYMENT.md`


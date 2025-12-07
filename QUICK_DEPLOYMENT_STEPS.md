# ⚡ Hızlı Deployment Adımları (Özet)

## 🎯 Toplam Süre: 30-45 dakika

---

## 📦 RAILWAY (Backend + Database)

### 1️⃣ Railway Hesabı
- [ ] https://railway.app → GitHub ile giriş
- [ ] Repository bağla: **`emirbahadireba/cw`**

### 2️⃣ PostgreSQL Database
- [ ] "+ New" → "Database" → "Add PostgreSQL"
- [ ] Database oluşturuldu ✅

### 3️⃣ Backend Service
- [ ] "+ New" → "GitHub Repo" → Repository: **`emirbahadireba/cw`**
- [ ] Settings → Root Directory: `backend`
- [ ] Save

### 4️⃣ Environment Variables
Backend service → Variables → Şunları ekle:

```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=<32-karakter-rastgele-string>
JWT_REFRESH_SECRET=<32-karakter-rastgele-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app.pages.dev
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://your-app.pages.dev
```

**JWT Secret oluştur:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5️⃣ Migration
- [ ] Deployments → "..." → "Run Command"
- [ ] Komut: `npm run migrate`
- [ ] Başarılı ✅

### 6️⃣ Seed (Opsiyonel)
- [ ] Deployments → "..." → "Run Command"
- [ ] Komut: `npm run seed`

### 7️⃣ Backend URL
- [ ] Settings → Domain kopyala
- [ ] Not et: `https://xxx.railway.app`

### 8️⃣ Health Check
- [ ] Tarayıcıda: `https://xxx.railway.app/health`
- [ ] `{"status":"ok"}` görünüyor ✅

---

## 🌐 CLOUDFLARE PAGES (Frontend)

### 9️⃣ Cloudflare Hesabı
- [ ] https://dash.cloudflare.com → Giriş yap

### 🔟 Proje Oluştur
- [ ] Workers & Pages → "Create application"
- [ ] "Pages" → "Connect to Git"
- [ ] Repository: **`emirbahadireba/cw`** → "Begin setup"

### 1️⃣1️⃣ Build Settings
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: / (boş)
```

### 1️⃣2️⃣ Environment Variable
```
VITE_API_URL=https://xxx.railway.app/api
```
(Backend URL'i ADIM 7'den)

### 1️⃣3️⃣ Deploy
- [ ] "Save and Deploy"
- [ ] Build tamamlanana kadar bekle (2-5 dk)

### 1️⃣4️⃣ Frontend URL
- [ ] "View site" → URL'i not et
- [ ] `https://xxx.pages.dev`

---

## 🔗 BAĞLANTI

### 1️⃣5️⃣ CORS Güncelle
- [ ] Railway → Backend → Variables
- [ ] `CORS_ORIGIN` → Frontend URL ile güncelle
- [ ] `https://xxx.pages.dev` (ADIM 14'ten)

### 1️⃣6️⃣ Test
- [ ] Frontend aç: `https://xxx.pages.dev`
- [ ] Login sayfası görünüyor ✅
- [ ] Login yap (seed data varsa: admin@example.com / password)
- [ ] Dashboard açılıyor ✅

---

## ✅ TAMAMLANDI!

**Backend:** `https://xxx.railway.app`  
**Frontend:** `https://xxx.pages.dev`  
**Database:** Railway PostgreSQL (otomatik)

---

## 🆘 Sorun mu var?

**Backend başlamıyor?**
→ Railway → Logs kontrol et

**Frontend build başarısız?**
→ Cloudflare → Build logs kontrol et

**CORS hatası?**
→ Backend CORS_ORIGIN doğru mu kontrol et

**Login çalışmıyor?**
→ Seed data yüklendi mi? Network tab kontrol et

---

**Detaylı rehber için:** `STEP_BY_STEP_DEPLOYMENT.md`


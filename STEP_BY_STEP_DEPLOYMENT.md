# 🚀 Adım Adım Deployment Rehberi

## 📋 Genel Bakış

Bu rehberde şunları yapacağız:
1. Railway'de PostgreSQL database oluşturma
2. Railway'de backend servisi oluşturma
3. Backend'i deploy etme
4. Cloudflare Pages'de frontend deploy etme

**Tahmini Süre:** 30-45 dakika

---

## 🔧 ÖN HAZIRLIK

### Gereksinimler
- ✅ GitHub hesabı ve repository: **https://github.com/emirbahadireba/cw**
- ✅ Railway hesabı (ücretsiz: https://railway.app)
- ✅ Cloudflare hesabı (ücretsiz: https://dash.cloudflare.com)

### Repository Durumu
- ✅ Repository: `emirbahadireba/cw`
- ✅ `backend` klasörü mevcut
- ✅ Frontend root'ta

---

## 📦 BÖLÜM 1: Railway Setup

### ADIM 1: Railway Hesabı Oluştur

1. https://railway.app adresine git
2. "Start a New Project" tıkla
3. GitHub ile giriş yap
4. Railway'e repository erişim izni ver

✅ **Kontrol:** Railway dashboard'u görüyorsun

---

### ADIM 2: PostgreSQL Database Oluştur

1. Railway dashboard'da **"+ New"** butonuna tıkla
2. **"Database"** seçeneğini seç
3. **"Add PostgreSQL"** tıkla
4. Database otomatik oluşturulur (1-2 dakika)

**Önemli:**
- Database adı otomatik oluşturulur
- `DATABASE_URL` otomatik environment variable olarak eklenir
- Bu URL'i not etme, Railway otomatik kullanır

✅ **Kontrol:** PostgreSQL servisi listede görünüyor

---

### ADIM 3: Backend Service Oluştur

1. Railway dashboard'da **"+ New"** butonuna tıkla
2. **"GitHub Repo"** seçeneğini seç
3. Repository'ni seç: **`emirbahadireba/cw`**
4. Railway otomatik olarak projeyi algılar

**Şimdi yapılandırma:**

5. Backend service'e tıkla
6. **"Settings"** sekmesine git
7. **"Root Directory"** bölümünü bul
8. **"Configure"** tıkla
9. Root directory olarak: **`backend`** yaz
10. **"Save"** tıkla

✅ **Kontrol:** Root directory `backend` olarak ayarlandı

---

### ADIM 4: Environment Variables Ayarla

1. Backend service'de **"Variables"** sekmesine git
2. **"+ New Variable"** butonuna tıkla
3. Aşağıdaki değişkenleri tek tek ekle:

#### Zorunlu Değişkenler:

```bash
# 1. Server
PORT=3000
NODE_ENV=production

# 2. Database (Railway otomatik ekler, kontrol et)
# DATABASE_URL zaten var mı kontrol et
# Yoksa: Railway → PostgreSQL → Variables → DATABASE_URL'yi kopyala

# 3. JWT Secrets (ÖNEMLİ: Güçlü değerler kullan!)
JWT_SECRET=buraya-32-karakterden-uzun-rastgele-bir-string-yaz
JWT_REFRESH_SECRET=buraya-da-32-karakterden-uzun-rastgele-bir-string-yaz

# JWT Secret oluşturmak için (terminal'de):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. JWT Timing
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 5. CORS (Frontend URL'i - şimdilik placeholder, sonra güncelleyeceğiz)
CORS_ORIGIN=https://your-app.pages.dev

# 6. Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 7. Frontend URL (şimdilik placeholder)
FRONTEND_URL=https://your-app.pages.dev
```

**JWT Secret Oluşturma:**
- Terminal'de: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Çıkan değeri kopyala ve `JWT_SECRET` olarak ekle
- Tekrar çalıştır ve `JWT_REFRESH_SECRET` olarak ekle

✅ **Kontrol:** Tüm environment variables eklendi

---

### ADIM 5: Database Connection Test

1. Backend service'de **"Deployments"** sekmesine git
2. En son deployment'a tıkla
3. **"..."** menüsüne tıkla
4. **"Run Command"** seç
5. Şu komutu yaz: `node -e "const pool = require('./src/config/database.js').default; pool.query('SELECT NOW()').then(r => {console.log('Connected:', r.rows[0]); process.exit(0);}).catch(e => {console.error(e); process.exit(1);})"`

**Veya daha basit:**
- Backend service'in **"Logs"** sekmesine git
- Deployment başladığında logları kontrol et
- "Database connected" mesajını görüyorsan ✅

✅ **Kontrol:** Database bağlantısı çalışıyor

---

### ADIM 6: Database Migration Çalıştır

1. Backend service'de **"Deployments"** sekmesine git
2. En son deployment'a tıkla
3. **"..."** menüsüne tıkla
4. **"Run Command"** seç
5. Komut: `npm run migrate`

**Beklenen Çıktı:**
```
Found 2 migration files
Running migration: 001_create_tables.sql
✓ Completed: 001_create_tables.sql
Running migration: 002_seed_plan_limits.sql
✓ Completed: 002_seed_plan_limits.sql
All migrations completed successfully!
```

✅ **Kontrol:** Migration başarılı

---

### ADIM 7: Seed Data Yükle (Opsiyonel)

1. Backend service'de **"Deployments"** sekmesine git
2. En son deployment'a tıkla
3. **"..."** menüsüne tıkla
4. **"Run Command"** seç
5. Komut: `npm run seed`

**Beklenen Çıktı:**
```
Seeding initial data...
Demo tenant created
Admin user created
Seed data loaded successfully!
```

✅ **Kontrol:** Seed data yüklendi

---

### ADIM 8: Backend URL'ini Al

1. Backend service'de **"Settings"** sekmesine git
2. **"Generate Domain"** butonuna tıkla (eğer yoksa otomatik oluşturulmuştur)
3. Domain'i kopyala: `https://xxx.railway.app`
4. **Bu URL'i not et!** Frontend'de kullanacağız

**Örnek:** `https://digital-signage-backend.railway.app`

✅ **Kontrol:** Backend URL'i not edildi

---

### ADIM 9: Backend Health Check

1. Tarayıcıda backend URL'ini aç: `https://xxx.railway.app/health`
2. Şu yanıtı görmelisin:

```json
{
  "status": "ok",
  "timestamp": "2024-01-20T...",
  "database": "connected"
}
```

✅ **Kontrol:** Health check başarılı

---

## 🌐 BÖLÜM 2: Cloudflare Pages Setup

### ADIM 10: Cloudflare Hesabı Oluştur

1. https://dash.cloudflare.com adresine git
2. "Sign Up" veya "Log In"
3. Hesap oluştur/giriş yap

✅ **Kontrol:** Cloudflare dashboard'u görüyorsun

---

### ADIM 11: Cloudflare Pages Projesi Oluştur

1. Cloudflare dashboard'da sol menüden **"Workers & Pages"** seç
2. **"Create application"** butonuna tıkla
3. **"Pages"** sekmesine git
4. **"Connect to Git"** butonuna tıkla
5. GitHub ile bağlan
6. Repository'ni seç: **`emirbahadireba/cw`**
7. **"Begin setup"** tıkla

✅ **Kontrol:** Repository bağlandı

---

### ADIM 12: Build Settings Yapılandır

**Build Settings ekranında:**

1. **Project name:** İstediğin bir isim (örn: `digital-signage`)
2. **Production branch:** `main` veya `master` (repo'na göre)
3. **Framework preset:** **"Vite"** seç
4. **Build command:** `npm run build` (otomatik doldurulur)
5. **Build output directory:** `dist` (otomatik doldurulur)
6. **Root directory:** `/` (root - boş bırak)

✅ **Kontrol:** Build settings doğru

---

### ADIM 13: Environment Variables Ekle

1. Build settings ekranında **"Environment variables"** bölümünü bul
2. **"Add variable"** butonuna tıkla
3. **Production** environment için:

```
Variable name: VITE_API_URL
Value: https://xxx.railway.app/api
```

**ÖNEMLİ:** `xxx.railway.app` yerine ADIM 8'de aldığın backend URL'ini yaz!

**Örnek:**
```
VITE_API_URL=https://digital-signage-backend.railway.app/api
```

4. **"Save"** tıkla

✅ **Kontrol:** Environment variable eklendi

---

### ADIM 14: İlk Deployment

1. **"Save and Deploy"** butonuna tıkla
2. Cloudflare build başlar (2-5 dakika)
3. **"View build logs"** ile ilerlemeyi takip et

**Beklenen:**
- ✅ Dependencies yükleniyor
- ✅ Build başarılı
- ✅ Deployment tamamlandı

✅ **Kontrol:** Build başarılı

---

### ADIM 15: Frontend URL'ini Al

1. Deployment tamamlandıktan sonra
2. **"View site"** butonuna tıkla
3. Veya **"Settings"** → **"Custom domains"** → Domain'i gör
4. Frontend URL'i not et: `https://xxx.pages.dev`

**Örnek:** `https://digital-signage.pages.dev`

✅ **Kontrol:** Frontend URL'i not edildi

---

## 🔗 BÖLÜM 3: Backend-Frontend Bağlantısı

### ADIM 16: Backend CORS Ayarlarını Güncelle

1. Railway'e geri dön
2. Backend service → **"Variables"** sekmesi
3. `CORS_ORIGIN` değişkenini bul
4. **"Edit"** tıkla
5. Değeri Cloudflare Pages URL'i ile değiştir:

```
CORS_ORIGIN=https://xxx.pages.dev
```

**ÖNEMLİ:** `https://` ile başlamalı, sonunda `/` olmamalı!

6. **"Save"** tıkla
7. Backend otomatik yeniden deploy olur

✅ **Kontrol:** CORS_ORIGIN güncellendi

---

### ADIM 17: Frontend Environment Variable Güncelle (Gerekirse)

1. Cloudflare Pages → Projen → **"Settings"**
2. **"Environment variables"** sekmesi
3. `VITE_API_URL` değişkenini kontrol et
4. Doğru backend URL'i olduğundan emin ol
5. Yanlışsa düzenle ve **"Save"** tıkla
6. Yeni deployment tetiklenir

✅ **Kontrol:** VITE_API_URL doğru

---

## ✅ BÖLÜM 4: Test ve Doğrulama

### ADIM 18: Backend Test

1. Tarayıcıda: `https://xxx.railway.app/health`
2. Yanıt:
```json
{
  "status": "ok",
  "database": "connected"
}
```

✅ **Kontrol:** Backend çalışıyor

---

### ADIM 19: Frontend Test

1. Tarayıcıda: `https://xxx.pages.dev`
2. Login sayfası görünüyor mu?
3. Sayfa yükleniyor mu?

✅ **Kontrol:** Frontend açılıyor

---

### ADIM 20: Login Test

**Eğer seed data yüklediysen:**

1. Frontend'de login sayfasına git
2. Email: `admin@example.com`
3. Password: `password`
4. **"Login"** tıkla

**Beklenen:**
- ✅ Login başarılı
- ✅ Dashboard'a yönlendiriliyor
- ✅ API çağrıları çalışıyor

**Eğer seed data yüklemediysen:**
- Önce bir kullanıcı oluşturman gerekecek (register endpoint'i kullanarak)

✅ **Kontrol:** Login çalışıyor

---

### ADIM 21: API Çağrıları Test

1. Browser Developer Tools aç (F12)
2. **"Network"** sekmesine git
3. Frontend'de bir işlem yap (örn: media listesi)
4. API çağrılarını kontrol et:
   - ✅ Status: 200 OK
   - ✅ CORS hatası yok
   - ✅ Response geliyor

✅ **Kontrol:** API çağrıları başarılı

---

## 🎉 TAMAMLANDI!

### Özet

✅ **Backend:** `https://xxx.railway.app`
✅ **Frontend:** `https://xxx.pages.dev`
✅ **Database:** Railway PostgreSQL (otomatik)
✅ **CORS:** Yapılandırıldı
✅ **Environment Variables:** Ayarlandı

---

## 🔧 Sorun Giderme

### Backend Başlamıyor
- Railway logs kontrol et
- Environment variables kontrol et
- Database connection kontrol et

### Frontend Build Başarısız
- Build logs kontrol et
- `VITE_API_URL` doğru mu?
- Dependencies yüklendi mi?

### CORS Hatası
- Backend `CORS_ORIGIN` doğru mu?
- Frontend URL'i tam olarak eşleşiyor mu?
- `https://` ile başlıyor mu?

### Login Çalışmıyor
- Seed data yüklendi mi?
- Backend health check çalışıyor mu?
- Network tab'da hata var mı?

---

## 📝 Sonraki Adımlar

1. **Custom Domain** ekle (Cloudflare Pages → Settings → Custom domains)
2. **File Storage** yapılandır (Cloudflare R2 veya AWS S3)
3. **Monitoring** ayarla
4. **Backup** stratejisi belirle

---

**🎊 Tebrikler! Sistemin production'da çalışıyor!**


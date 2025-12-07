# 🚀 Hemen Deploy Et - Adım Adım

## 📦 RAILWAY (Backend + Database) - 15 Dakika

### 1️⃣ Railway'e Git ve Giriş Yap
1. https://railway.app → "Start a New Project"
2. GitHub ile giriş yap
3. Railway'e repository erişim izni ver

### 2️⃣ PostgreSQL Database Ekle
1. Railway dashboard'da **"+ New"** butonuna tıkla
2. **"Database"** → **"Add PostgreSQL"**
3. 1-2 dakika bekle, database oluşturuluyor ✅

### 3️⃣ Backend Service Ekle
1. **"+ New"** → **"GitHub Repo"**
2. Repository seç: **`emirbahadireba/cw`**
3. Backend service oluşturuldu

### 4️⃣ Root Directory Ayarla (ÖNEMLİ!)
1. Backend service'e tıkla
2. **"Settings"** sekmesi
3. **"Root Directory"** bölümünü bul
4. **"Configure"** tıkla
5. **`backend`** yaz
6. **"Save"** tıkla

✅ **Kontrol:** Root directory `backend` olmalı

### 5️⃣ Environment Variables Ekle
Backend service → **"Variables"** sekmesi → **"+ New Variable"**

Şunları ekle (her biri için ayrı ayrı):

```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=<rastgele-32-karakter-string>
JWT_REFRESH_SECRET=<rastgele-32-karakter-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://xxx.pages.dev
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://xxx.pages.dev
```

**JWT Secret Oluştur:**
- Terminal'de: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Çıkan değeri kopyala → `JWT_SECRET` olarak ekle
- Tekrar çalıştır → `JWT_REFRESH_SECRET` olarak ekle

**NOT:** `CORS_ORIGIN` ve `FRONTEND_URL` için şimdilik placeholder kullan, Cloudflare'den URL aldıktan sonra güncelleyeceğiz.

### 6️⃣ DATABASE_URL Kontrol Et
1. PostgreSQL service'e tıkla
2. **"Variables"** sekmesi
3. `DATABASE_URL` var mı kontrol et
4. Varsa ✅, yoksa backend service'e ekle:
   - Backend → Variables → "+ New Variable"
   - Name: `DATABASE_URL`
   - Value: PostgreSQL service'in Variables'ından kopyala

### 7️⃣ Migration Çalıştır
1. Backend service → **"Deployments"** sekmesi
2. En son deployment'a tıkla
3. **"..."** menüsü → **"Run Command"**
4. Komut: `npm run migrate`
5. Başarılı mesajını bekle ✅

### 8️⃣ Seed Data (Opsiyonel)
1. Aynı şekilde **"Run Command"**
2. Komut: `npm run seed`
3. Başarılı ✅

### 9️⃣ Backend URL'ini Al
1. Backend service → **"Settings"**
2. **"Generate Domain"** tıkla (veya otomatik oluşturulmuştur)
3. Domain'i kopyala: `https://xxx.railway.app`
4. **NOT ET!** Frontend'de kullanacağız

**Örnek:** `https://digital-signage-production.up.railway.app`

---

## 🌐 CLOUDFLARE PAGES (Frontend) - 10 Dakika

### 🔟 Cloudflare'e Git
1. https://dash.cloudflare.com → Giriş yap
2. Sol menüden **"Workers & Pages"** seç

### 1️⃣1️⃣ Proje Oluştur
1. **"Create application"** butonuna tıkla
2. **"Pages"** sekmesine git
3. **"Connect to Git"** tıkla
4. GitHub ile bağlan (ilk seferde izin ver)
5. Repository seç: **`emirbahadireba/cw`**
6. **"Begin setup"** tıkla

### 1️⃣2️⃣ Build Settings
Aşağıdaki ayarları yap:

```
Project name: digital-signage (veya istediğin isim)
Production branch: main (veya master)
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: / (boş bırak - root)
```

### 1️⃣3️⃣ Environment Variable Ekle
1. **"Environment variables"** bölümünü bul
2. **"Add variable"** tıkla
3. **Production** environment için:

```
Variable name: VITE_API_URL
Value: https://xxx.railway.app/api
```

**ÖNEMLİ:** `xxx.railway.app` yerine ADIM 9'da aldığın backend URL'ini yaz!

**Örnek:**
```
VITE_API_URL=https://digital-signage-production.up.railway.app/api
```

4. **"Save"** tıkla

### 1️⃣4️⃣ Deploy Et
1. **"Save and Deploy"** butonuna tıkla
2. Build başlar (2-5 dakika)
3. **"View build logs"** ile ilerlemeyi takip et

**Beklenen:**
- ✅ Installing dependencies...
- ✅ Building...
- ✅ Build successful
- ✅ Deployment complete

### 1️⃣5️⃣ Frontend URL'ini Al
1. Deployment tamamlandıktan sonra
2. **"View site"** butonuna tıkla
3. Veya **"Settings"** → **"Custom domains"** → Domain'i gör
4. Frontend URL'i kopyala: `https://xxx.pages.dev`

**Örnek:** `https://digital-signage.pages.dev`

---

## 🔗 BAĞLANTI - 2 Dakika

### 1️⃣6️⃣ Backend CORS Güncelle
1. Railway'e geri dön
2. Backend service → **"Variables"**
3. `CORS_ORIGIN` değişkenini bul
4. **"Edit"** tıkla
5. Değeri Cloudflare Pages URL'i ile değiştir:

```
CORS_ORIGIN=https://xxx.pages.dev
```

**ÖNEMLİ:** 
- `https://` ile başlamalı
- Sonunda `/` olmamalı
- Tam URL olmalı

6. **"Save"** tıkla
7. Backend otomatik yeniden deploy olur (1-2 dakika)

### 1️⃣7️⃣ Frontend URL Güncelle (Backend'de)
1. Aynı şekilde `FRONTEND_URL` değişkenini güncelle
2. Cloudflare Pages URL'i ile değiştir
3. **"Save"** tıkla

---

## ✅ TEST ET - 2 Dakika

### 1️⃣8️⃣ Backend Test
1. Tarayıcıda: `https://xxx.railway.app/health`
2. Şu yanıtı görmelisin:

```json
{
  "status": "ok",
  "timestamp": "2024-01-20T...",
  "database": "connected"
}
```

✅ **Başarılı!**

### 1️⃣9️⃣ Frontend Test
1. Tarayıcıda: `https://xxx.pages.dev`
2. Login sayfası görünüyor mu? ✅
3. Sayfa yükleniyor mu? ✅

### 2️⃣0️⃣ Login Test
1. Frontend'de login sayfasına git
2. Eğer seed data yüklediysen:
   - Email: `admin@example.com`
   - Password: `password`
3. **"Login"** tıkla
4. Dashboard açılıyor mu? ✅

### 2️⃣1️⃣ API Test
1. Browser Developer Tools aç (F12)
2. **"Network"** sekmesi
3. Frontend'de bir işlem yap
4. API çağrılarını kontrol et:
   - ✅ Status: 200 OK
   - ✅ CORS hatası yok
   - ✅ Response geliyor

---

## 🎉 TAMAMLANDI!

**Backend:** `https://xxx.railway.app`  
**Frontend:** `https://xxx.pages.dev`  
**Database:** Railway PostgreSQL (otomatik)

---

## 🆘 Sorun mu var?

### Backend başlamıyor?
- Railway → Backend → Logs kontrol et
- Environment variables eksik mi?
- Root directory `backend` mi?

### Frontend build başarısız?
- Cloudflare → Build logs kontrol et
- `VITE_API_URL` doğru mu?
- Dependencies yüklendi mi?

### CORS hatası?
- Backend `CORS_ORIGIN` = Frontend URL mi?
- `https://` ile başlıyor mu?
- Sonunda `/` yok mu?

### Login çalışmıyor?
- Seed data yüklendi mi?
- Backend health check çalışıyor mu?
- Network tab'da hata var mı?

---

## 📝 Özet Checklist

**Railway:**
- [ ] PostgreSQL database eklendi
- [ ] Backend service eklendi
- [ ] Root directory: `backend` ayarlandı
- [ ] Environment variables eklendi
- [ ] Migration çalıştırıldı
- [ ] Seed data yüklendi (opsiyonel)
- [ ] Backend URL not edildi

**Cloudflare:**
- [ ] Proje oluşturuldu
- [ ] Repository bağlandı
- [ ] Build settings ayarlandı
- [ ] Environment variable eklendi
- [ ] Deploy edildi
- [ ] Frontend URL not edildi

**Bağlantı:**
- [ ] Backend CORS_ORIGIN güncellendi
- [ ] Backend FRONTEND_URL güncellendi

**Test:**
- [ ] Backend health check çalışıyor
- [ ] Frontend açılıyor
- [ ] Login çalışıyor
- [ ] API çağrıları başarılı

---

**🎊 Hazırsın! Sistemin production'da çalışıyor!**


# Hızlı Başlangıç Rehberi

## ⚠️ Sistem Durumu

**Kod:** ✅ Tamamlandı ve hazır
**Çalışır Durumda:** ⚠️ Kurulum gerekiyor

## 🚀 Çalıştırmak İçin Adımlar

### 1. Dependencies Yükle
```bash
cd backend
npm install
```

### 2. PostgreSQL Database Oluştur
PostgreSQL'in kurulu ve çalışıyor olması gerekiyor.

```sql
-- PostgreSQL'de database oluştur
CREATE DATABASE digital_signage;
```

Veya Railway'de PostgreSQL servisi oluşturup connection string'i al.

### 3. Environment Variables Ayarla
`.env.example` dosyasını `.env` olarak kopyala ve düzenle:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Veya manuel olarak .env dosyası oluştur
```

`.env` dosyasında şunları ayarla:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/digital_signage
# veya
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_signage
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
```

### 4. Database Migration'ları Çalıştır
```bash
npm run migrate
```

Bu komut:
- Tüm tabloları oluşturur
- Plan limits seed data'sını yükler

### 5. Seed Data Yükle (Opsiyonel)
```bash
npm run seed
```

Bu komut:
- Demo tenant oluşturur
- Admin kullanıcı oluşturur (admin@example.com / password)

### 6. Server'ı Başlat
```bash
npm run dev    # Development mode (auto-reload)
# veya
npm start      # Production mode
```

### 7. Test Et
Tarayıcıda veya Postman'de:
```
GET http://localhost:3000/health
```

Başarılı yanıt:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T...",
  "database": "connected"
}
```

## ✅ Başarılı Kurulum Kontrolü

1. ✅ Server başladı: `Server running on port 3000`
2. ✅ Database bağlandı: `Database connection test successful`
3. ✅ Health check çalışıyor: `GET /health` → `{"status":"ok"}`
4. ✅ Login çalışıyor: `POST /api/auth/login` → token döner

## 🔧 Sorun Giderme

### Database Connection Error
- PostgreSQL çalışıyor mu kontrol et
- `.env` dosyasındaki database bilgileri doğru mu?
- Database oluşturuldu mu?

### Port Already in Use
- Port 3000 kullanılıyorsa `.env`'de `PORT=3001` yap

### Module Not Found
- `npm install` çalıştırıldı mı?
- `node_modules` klasörü var mı?

### Migration Error
- Database connection çalışıyor mu?
- PostgreSQL'de `uuid-ossp` extension var mı? (migration otomatik ekler)

## 📝 Test Kullanıcı Bilgileri (seed sonrası)

```
Email: admin@example.com
Password: password
```

## 🎯 Sonraki Adımlar

1. Frontend'i backend'e bağla (API URL'ini ayarla)
2. Railway'e deploy et (database + backend)
3. Cloudflare'e frontend deploy et
4. Production environment variables ayarla


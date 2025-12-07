# Test Setup - Sistem Kontrolü

## Sistem Durumu Kontrolü

### ✅ Kod Hazırlığı
- [x] Tüm route'lar oluşturuldu
- [x] Middleware'ler hazır
- [x] Services hazır
- [x] Database schema hazır
- [x] Migration script'leri hazır
- [x] Seed script'leri hazır

### ⚠️ Çalıştırmak İçin Gerekenler

1. **Dependencies Yükleme**
   ```bash
   cd backend
   npm install
   ```
   Durum: ❌ Henüz yapılmadı

2. **Database Kurulumu**
   - PostgreSQL kurulu ve çalışıyor olmalı
   - Database oluşturulmalı
   Durum: ❌ Henüz yapılmadı

3. **Environment Variables**
   - `.env` dosyası oluşturulmalı
   - Database connection string ayarlanmalı
   - JWT secret'ları ayarlanmalı
   Durum: ❌ Henüz yapılmadı

4. **Database Migration**
   ```bash
   npm run migrate
   ```
   Durum: ❌ Henüz yapılmadı

5. **Seed Data**
   ```bash
   npm run seed
   ```
   Durum: ❌ Henüz yapılmadı

## Hızlı Test Komutları

### 1. Syntax Kontrolü
```bash
cd backend
node --check src/server.js
```

### 2. Import Kontrolü
```bash
node --check src/routes/*.js
```

### 3. Package.json Kontrolü
```bash
npm list --depth=0
```

## Minimum Çalıştırma Adımları

```bash
# 1. Dependencies
cd backend
npm install

# 2. .env oluştur (minimal)
echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/digital_signage > .env
echo JWT_SECRET=test-secret-key >> .env
echo JWT_REFRESH_SECRET=test-refresh-secret >> .env
echo PORT=3000 >> .env
echo NODE_ENV=development >> .env

# 3. PostgreSQL'de database oluştur
# psql -U postgres
# CREATE DATABASE digital_signage;

# 4. Migration
npm run migrate

# 5. Seed (opsiyonel)
npm run seed

# 6. Başlat
npm start
```

## Beklenen Çıktı (Başarılı)

```
Database connection test successful: 2024-01-20T...
Server running on port 3000
Environment: development
Health check: http://localhost:3000/health
```

## Test Endpoint'leri

Server başladıktan sonra:

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Login Test** (seed sonrası)
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'
   ```

## Özet

**Kod Durumu:** ✅ %100 Hazır
**Çalışır Durum:** ⚠️ Kurulum Gerekiyor

Sistem çalışır duruma getirmek için yukarıdaki adımları takip edin.


# 🔌 Tulumbak Port Yönetimi - Güncel Kılavuz

## 📋 Mevcut Port Dağılımı

| Servis | Port | Durum | Açıklama | Başlatma Komutu |
|--------|------|-------|----------|-----------------|
| **Store Frontend** | 3003 | ✅ | Müşteri e-ticaret arayüzü | `pnpm dev --port 3003` |
| **Admin Dashboard** | 3004 | ✅ | Yönetim paneli | `pnpm dev --port 3004` |
| **Backend API** | 3005 | ✅ | REST API sunucusu | `pnpm dev --port 3005` |
| **Alternatif API** | 3006 | ⚠️ | Geliştirme/test için | `pnpm dev --port 3006` |
| **PostgreSQL** | 5432 | ✅ | Ana veritabanı | Docker yönetimli |
| **Redis** | 6379 | ✅ | Cache ve oturum deposu | Docker yönetimli |

## 🧹 Port Temizleme İşlemleri

### Windows için Hızlı Temizleme
```cmd
@echo off
echo Tulumbak portları temizleniyor...

taskkill /F /IM node.exe 2>nul
echo Tüm Node.js süreçleri durduruldu.

echo Port temizleme tamamlandı!
```

### Port Durumu Kontrolü
```bash
# Tüm portları kontrol et
netstat -an | findstr ":300"

# Belirli bir portu kontrol et
netstat -an | findstr ":3005"
```

## 🚀 Docker ile Port Yönetimi

### Docker Servislerini Başlatma
```bash
# PostgreSQL ve Redis'i başlat
docker-compose up -d postgres redis

# Durum kontrolü
docker-compose ps
```

### Docker Portlarını Temizleme
```bash
# Tüm servisleri durdur
docker-compose down

# Volumes ile birlikte temizle
docker-compose down -v

# Zorla durdur ve temizle
docker-compose down --remove-orphans
```

## 📱 Geliştirme Ortamı URL'leri

- **Store**: http://localhost:3003
- **Admin Dashboard**: http://localhost:3004
- **Backend API**: http://localhost:3005/api
- **API Test**: http://localhost:3005/api/test

## 🔧 Geliştirme Başlatma Sırası

### 1. Portları Temizle
```bash
# Windows için
taskkill /F /IM node.exe

# Docker servisleri
docker-compose down
```

### 2. Docker Servislerini Başlat
```bash
docker-compose up -d postgres redis
docker-compose logs -f postgres &
docker-compose logs -f redis &
```

### 3. Backend API'yi Başlat
```bash
cd apps/api
pnpm dev --port 3005
```

### 4. Frontend Uygulamalarını Başlat
```bash
# Terminal 1 - Admin Dashboard
cd apps/admin-dashboard
pnpm dev --port 3004

# Terminal 2 - Store Frontend
cd apps/store
pnpm dev --port 3003
```

## 🚨 yaygın Sorunlar ve Çözümleri

### Sorun 1: "Port already in use" Hatası
**Çözüm:**
```bash
# Portu kullanan süreci bul
netstat -ano | findstr ":3005"

# Süreci durdur
taskkill /PID <PID> /F
```

### Sorun 2: Docker Container Port Çakışması
**Çözüm:**
```bash
# Çakışan servisleri durdur
docker stop $(docker ps -q)

# Yeniden başlat
docker-compose up -d
```

### Sorun 3: Frontend API'ye Bağlanamıyor
**Çözüm:**
```bash
# API erişilebilirliğini kontrol et
curl http://localhost:3005/api/test

# Frontend .env.local dosyasını kontrol et
NEXT_PUBLIC_API_URL=http://localhost:3005/api
```

## 📊 Docker Port Yönetimi

### Mevcut Docker Compose Konfigürasyonu
```yaml
services:
  postgres:
    ports:
      - "5432:5432"
  redis:
    ports:
      - "6379:6379"
  api:
    ports:
      - "3005:3005"
```

### Docker Port Durumu
```bash
# Çalışan containerları ve portlarını göster
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Container loglarını izle
docker-compose logs -f api
```

## ⚙️ Environment Konfigürasyonu

### Backend API (.env.local)
```env
NODE_ENV=development
PORT=3005
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tulumbak
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:3005/api
```

### Frontend (.env.local)
```env
# apps/admin-dashboard/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3005/api
PORT=3004

# apps/store/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3005/api
PORT=3003
```

## 🎯 En İyi Pratikler

### Geliştirme İş Akışı
1. **Başlamadan önce portları temizle**
2. **Tutarlı port dağılımı kullan**
3. **Servisleri başlatmadan önce port durumunu kontrol et**
4. **Veritabanı ve cache için Docker kullan**
5. **Temizleme script'i hazır bulundur**

### İçin Ek Öneriler
1. **README'de port dağılımını belgele**
2. **Takım için tutarlı ortam değişkenleri**
3. **Port değişikliklerini iletişim kur**
4. **Portlar için environment variable kullan**

## 🚀 Hızlı Başlangıç (Production Ready)

```bash
# 1. Portları temizle
taskkill /F /IM node.exe
docker-compose down

# 2. Docker servislerini başlat
docker-compose up -d postgres redis

# 3. API'yi başlat (yeni terminal)
cd apps/api && pnpm dev --port 3005

# 4. Admin panelini başlat (yeni terminal)
cd apps/admin-dashboard && pnpm dev --port 3004

# 5. Store'u başlat (yeni terminal)
cd apps/store && pnpm dev --port 3003

# 6. Tarayıcıda kontrol et
# Store: http://localhost:3003
# Admin: http://localhost:3004
# API: http://localhost:3005/api/test
```

## 📞 Acil Durum Prosedürleri

### Tüm Portlar Bloke Olduğunda
```bash
# Acil temizlik - tüm Node.js süreçlerini durdur
taskkill /F /IM node.exe

# Docker'ı yeniden başlat
docker-compose down
docker-compose up -d --force-recreate
```

### Servis Kurtarma
```bash
# Tam servis yeniden başlatma
docker-compose down
docker-compose up -d --force-recreate
```

---

*Güncellenme: 2025-10-21*
*Ortam: Geliştirme & Production*
*Sürüm: 2.0.0 - Docker Entegrasyonlu*

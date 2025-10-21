# Tulumbak Next.js E-ticaret Projesi

🚀 Modern e-ticaret platformu - Docker ile containerize edilmiş geliştirme ve production ortamı

## Proje Yapısı

```
tulumbak/
├── apps/
│   ├── admin-dashboard/     # Yönetici paneli (Port: 3001)
│   ├── api/                # API servisleri (Port: 3000)
│   └── store/              # Mağaza frontend'i (Port: 3002)
├── packages/
│   ├── ui/                 # Ortak UI kütüphanesi
│   ├── config/             # Ortak konfigürasyonlar
│   └── shared/             # Tipler ve util'ler
├── docker/
│   ├── nginx/              # Nginx konfigürasyonları
│   ├── postgres/           # PostgreSQL başlangıç script'leri
│   ├── prometheus/         # Monitoring konfigürasyonu
│   ├── loki/               # Log aggregation
│   └── grafana/            # Dashboard'lar
├── docs/                   # Proje dokümantasyonu
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
├── docker-compose.dev.yml  # Development containers
├── docker-compose.prod.yml # Production containers
└── Makefile               # Kolay komutlar
```

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Docker Desktop
- pnpm (v9+)
- Make (opsiyonel, komutlar için)

### Development Ortamı

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/ismailbayraktardev-bot/tulumbak-nextjs.git
cd tulumbak-nextjs
```

2. **Dependencies'leri yükleyin:**
```bash
make install
# veya
pnpm install
```

3. **Development ortamını başlatın:**
```bash
make dev
# veya
docker-compose -f docker-compose.dev.yml up --build
```

4. **Uygulamalara erişin:**
- 🏪 Mağaza: http://localhost
- 🛠️  API: http://localhost/api
- 👨‍💼 Admin: http://localhost/admin
- 📊 MinIO: http://localhost:9001 (minioadmin/minioadmin123)
- 🗄️  Database: localhost:5432 (tulumbak_user/tulumbak_password)

### Production Ortamı

```bash
# Environment variables'ı yapılandırın
cp .env.example .env.production

# Production'ı başlatın
make prod
# veya
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🛠️ Yararlı Komutlar

### Development
```bash
make dev          # Development ortamını başlat
make dev-down     # Development ortamını durdur
make dev-logs     # Development loglarını göster
make dev-restart  # Development ortamını yeniden başlat
```

### Production
```bash
make prod         # Production ortamını başlat
make prod-down    # Production ortamını durdur
make prod-logs    # Production loglarını göster
make prod-restart # Production ortamını yeniden başlat
```

### Database
```bash
make db-migrate   # Database migration'ları çalıştır
make db-seed      # Örnek veri ekle
make db-reset     # Database'i sıfırla
make db-backup    # Database yedekle
```

### Monitoring
```bash
make health       # Tüm servislerin durumunu kontrol et
make logs         # Tüm logları göster
make logs-api     # API loglarını göster
```

### Bakım
```bash
make clean        # Docker kaynaklarını temizle
make test         # Testleri çalıştır
make lint         # Linting çalıştır
make format       # Kod formatla
```

## 🏗️ Özellikler

- 🐳 **Docker Containerization**: Tüm servisler izole container'larda
- 🔄 **Hot Reload**: Development'ta kod değişiklikleri anında yansır
- 📊 **Monitoring**: Prometheus + Grafana + Loki
- 🗄️  **Database**: PostgreSQL + Redis
- 📁 **File Storage**: MinIO (S3 compatible)
- 🔒 **Security**: HTTPS, rate limiting, security headers
- 📝 **Structured Logging**: JSON format logs
- 🔧 **Easy Management**: Makefile ile basit komutlar

## 🌐 Uygulama Portları

| Servis | Port | URL |
|--------|------|-----|
| Mağaza (Store) | 3002 | http://localhost |
| API | 3000 | http://localhost/api |
| Admin Dashboard | 3001 | http://localhost/admin |
| Nginx Proxy | 80, 443 | http://localhost |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| MinIO | 9000, 9001 | http://localhost:9000 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 9091 | http://localhost:9091 |

## 📚 Dokümantasyon

Detaylı dokümantasyon için `docs/` klasörüne bakın:
- `docs/core/` - API spesifikasyonları ve PRD'ler
- `docs/mvp/` - MVP gereksinimleri
- `docs/support/` - Destek dokümanları

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Infrastructure**: Docker, Docker Compose, Nginx
- **Monitoring**: Prometheus, Grafana, Loki
- **Storage**: MinIO (S3 compatible)
- **Package Manager**: pnpm workspaces

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel lisans altındadır.

---

**🎉 Docker ile geliştirme sürecinizi keyifli hale getirin!**

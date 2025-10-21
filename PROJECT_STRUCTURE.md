# Tulumbak Proje Yapısı

## 📁 Mevcut Durum Analizi

### 🔍 **Tespit Edilen Sorun**
Proje yapısı karışmış durumda:

```
tulumbak/                    # Ana proje (Boş apps/)
├── apps/                    # ❌ Boş
│   ├── api/                 # ❌ Sadece Dockerfile
│   ├── admin-dashboard/     # ❌ Boş
│   └── store/               # ❌ Boş
├── tulumbak-nextjs/         # ✅ Çalışan proje (YANLIŞ YER)
│   ├── apps/                # ✅ İçinde çalışan uygulamalar
│   │   ├── api/            # ✅ Next.js API (çalışıyor)
│   │   ├── admin-dashboard/ # ✅ Next.js Admin
│   │   └── store/           # ✅ Next.js Storefront
│   └── ...
└── ...                       # Diğer dosyalar
```

## 🎯 **Doğru Proje Yapısı

### **Seçenek 1: Root Dizinde (Önerilen)**
```
tulumbak/                    # ✅ Ana proje root
├── apps/                    # ✅ Next.js uygulamaları
│   ├── api/                 # ✅ Backend API
│   │   ├── src/
│   │   │   └── app/api/
│   │   ├── package.json
│   │   └── next.config.ts
│   ├── admin-dashboard/     # ✅ Admin panel
│   └── store/               # ✅ Storefront
├── packages/                # ✅ Paylaşılan kodlar
│   ├── ui/                  # ✅ Component kütüphanesi
│   ├── config/              # ✅ Konfigürasyonlar
│   └── shared/              # ✅ Paylaşılan tipler
├── docker/                  # ✅ Docker konfigürasyonları
├── docs/                    # ✅ Dokümantasyon
├── .env.local               # ✅ Environment variables
├── pnpm-workspace.yaml      # ✅ Monorepo yönetimi
└── package.json             # ✅ Root dependencies
```

### **Seçenek 2: tulumbak-nextjs/ İçinde**
```
tulumbak/                    # Ana proje (sadece yapılandırma)
└── tulumbak-nextjs/         # ✅ Asıl proje
    ├── apps/                # ✅ Next.js uygulamaları
    ├── packages/            # ✅ Paylaşılan kodlar
    └── ...                   # Diğer dosyalar
```

## 📊 **Durum Değerlendirmesi**

### **✅ Çalışan Durum (tulumbak-nextjs/)**
- **API Server:** ✅ `localhost:3000` çalışıyor
- **Database:** ✅ PostgreSQL + Redis aktif
- **Sample Data:** ✅ Türkçe kategoriler yüklü
- **Endpoints:** ✅ `/api/test`, `/api/categories` çalışıyor

### **❌ Problem:**
- Yapı yanlış dizinde
- Ana proje dosyaları boş
- Karışıklık riski

## 🛠️ **Düzeltme Önerisi**

### **Tavsiye: Seçenek 1 - Root Dizinde Düzeltme**
1. Çalışan dosyaları `tulumbak-nextjs/` → `tulumbak/` taşı
2. `tulumbak-nextjs/` temizle
3. Path'leri düzelt
4. Test et

### **Alternatif: Seçenek 2 - Mevcut Yapıyı Koru**
1. `tulumbak/` → `tulumbak-old/` yedekle
2. `tulumbak-nextjs/` → `tulumbak/` taşı
3. Dokümantasyon güncelle

## 🔧 **Teknik Detaylar**

### **Mevcut Çalışan API:**
- **Path:** `tulumbak-nextjs/apps/api/src/app/api/`
- **Server:** `localhost:3000`
- **Database:** `tulumbak_dev` (PostgreSQL)
- **Environment:** `tulumbak-nextjs/apps/api/.env.local`

### **Taşınması Gerekenler:**
1. `tulumbak-nextjs/apps/api/` → `tulumbak/apps/api/`
2. `tulumbak-nextjs/apps/admin-dashboard/` → `tulumbak/apps/admin-dashboard/`
3. `tulumbak-nextjs/apps/store/` → `tulumbak/apps/store/`
4. `tulumbak-nextjs/packages/` → `tulumbak/packages/`
5. Docker konfigürasyonları
6. README ve dokümantasyon

## 📝 **Sonraki Adımlar**

1. **Kullanıcı Seçimi:** Hangi yapıyı istediğini belirle
2. **Düzeltme:** Seçeneğe göre taşıma işlemleri
3. **Test:** Her şeyin çalıştığını kontrol et
4. **Dokümantasyon:** Yapıyı güncelle

---

**Not:** Hiçbir dosya silinmeden önce mutlaka yedek alın! 🛡️
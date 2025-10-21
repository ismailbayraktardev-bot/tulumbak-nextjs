# Frontend API URL Güncelleme Taski

## Açıklama
Backend API serverı port 3005'e taşındı. Frontend uygulamalarının API URL'lerini güncellemesi gerekiyor.

## Yapılması Gerekenler

### 1. Store App API URL Güncellemesi
- **Dosya:** `apps/store/src/lib/api.ts`
- **Değişiklik:** `NEXT_PUBLIC_API_URL` değerini `http://localhost:3005/api` olarak güncelle
- **Mevcut:** `http://localhost:3001/api`

### 2. Admin Dashboard API URL Güncellemesi
- **Dosya:** `apps/admin-dashboard/src/lib/api.ts` (dosya varsa)
- **Değişiklik:** API base URL'ini `http://localhost:3005/api` olarak güncelle

### 3. Environment Dosyaları Kontrolü
- `apps/store/.env.local`
- `apps/admin-dashboard/.env.local`
- Dosyalarda API_URL tanımlamaları varsa güncelle

## Test
Değişikliklerden sonra:
1. Store app'te authentication test et
2. Admin dashboard test et
3. Product/category listeleme test et

## Not
Backend API artık **http://localhost:3005** üzerinde çalışıyor.
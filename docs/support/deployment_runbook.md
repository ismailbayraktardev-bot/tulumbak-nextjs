# Deployment Runbook — Tulumbak (Dev → Staging → Prod)

> Amaç: **storefront** (Next.js), **admin-dashboard** (Next.js) ve (varsa) **api** servisinin Vercel + PostgreSQL (Supabase veya eşdeğer) üzerinde güvenli, tekrarlanabilir yayınlanması. Bu belge, ortam değişkenleri, build komutları, DNS, migrasyon, rollout/rollback, sağlık kontrolleri ve olay yönetimini kapsar.

İlgili belgeler: `frontend-architecture.md`, `api-specifications.md`, `database-schema.md`, `admin-components.md`, `integration-notifications.md`, `paytr-integration.md`, `qa-test-plan.md`.

---

## 1) Ortamlar & Domain
- **Ortamlar**: `dev`, `staging` (UAT), `prod`
- **Domain önerisi**:
  - **Prod**: `tulumbak.com` (storefront), `admin.tulumbak.com` (admin), `api.tulumbak.com` (api)
  - **Staging**: `staging.tulumbak.com`, `admin.staging.tulumbak.com`, `api.staging.tulumbak.com`
- **Bölge/Zaman**: Europe/Istanbul (uygulama TR, DB UTC)

---

## 2) Monorepo Proje Ayarları (Vercel)
Vercel’da **3 Proje** önerilir (ayrı buildler ve env’ler):
1) `apps/store` → Framework: Next.js  
2) `apps/admin-dashboard` → Framework: Next.js  
3) `apps/api` (varsa — Next.js Route Handlers/standalone Node)  

**Build komutları** (hepsi için):
- Install: `pnpm i --frozen-lockfile`
- Build: `pnpm -w build` **veya** proje özelinde `pnpm -C apps/<app> build`
- Output: Next.js varsayılan (Vercel algılar)

**Monorepo ayarı**: Vercel “Root Directory” = ilgili app klasörü (`apps/store`, `apps/admin-dashboard`).

---

## 3) Ortam Değişkenleri (Secrets)
Aşağıdaki anahtarlar **ortam bazında** (dev/staging/prod) ayrı ayrı tanımlanır. `NEXT_PUBLIC_*` değişkenleri istemciye sızar, diğerleri **yalnız sunucu** içindir.

### 3.1 Ortak
```
# API URL’leri (store ve admin tarafından okunur)
NEXT_PUBLIC_API_URL=https://api.staging.tulumbak.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXX

# Realtime (opsiyonel)
NEXT_PUBLIC_WS_URL=wss://api.staging.tulumbak.com/realtime
```

### 3.2 Storefront (Next.js)
```
NEXT_PUBLIC_BRAND_NAME=Tulumbak
NEXT_PUBLIC_PAYTR_IFRAME_HOST=https://iframe.paytr.com
BRAND_LOGO_URL=https://cdn.tulumbak.com/logo.png
```

### 3.3 Admin Dashboard (Next.js)
```
NEXT_PUBLIC_API_URL=https://api.staging.tulumbak.com
```

### 3.4 API (Backend)
```
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgres://…
# (Ops.) POSTGIS aktifse uygun extension’lar migration’da yüklenir

# Auth (Supabase kullanılıyorsa)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=public_anon_key
SUPABASE_SERVICE_ROLE=service_role_key   # **Storefront/Admin ile paylaşmayın**
SESSION_SECRET=change_me

# Payments — PayTR
PAYTR_MERCHANT_ID=***
PAYTR_MERCHANT_KEY=***
PAYTR_MERCHANT_SALT=***
PAYTR_SANDBOX=true
PAYMENT_RETURN_URL=https://staging.tulumbak.com/odeme/sonuc

# Notifications — Resend
RESEND_API_KEY=***
EMAIL_FROM="Tulumbak <no-reply@tulumbak.com>"
EMAIL_REPLY_TO=destek@tulumbak.com

# WhatsApp CTA (storefront tarafından GET /settings ile okunur)
WHATSAPP_DEFAULT_PHONE=+90xxxxxxxxxx
WHATSAPP_DEFAULT_MESSAGE=Merhaba%20siparisim%20hakkinda%20bilgi%20almak%20istiyorum

# Webhook Güvenliği
WEBHOOK_SECRET_PAYTR=***
RATE_LIMIT_WINDOW=600000  # 10dk
RATE_LIMIT_MAX=1000
```

> Not: **Service Role** anahtarları **yalnız API** tarafında saklanır; FE’ye asla eklenmez. Vercel’de prod/staging env’leri ayrı.

---

## 4) Veritabanı & Migrasyonlar
- Araç: `supabase migration` veya `drizzle-kit` (hangisi seçildiyse).  
- Schema referansı: `database-schema.md`.

**İlk kurulum:**
```bash
# Yerel geliştirme için
pnpm db:migrate         # script: drizzle/supabase CLI
pnpm db:seed            # örnek kategoriler/ürünler/slotlar
```

**Staging/Prod yayınında:**
1. Bakım penceresi (gerekirse) bildir.  
2. **Migrations** → staging’e uygula → smoke test.  
3. Prod’a **`up`** migrasyon; gerekiyorsa **`down`** script hazır.  
4. Uzantılar: `pg_trgm` (+ ops. `postgis`) yüklendiğinden emin ol.

**Rollforward/rollback stratejisi:**
- Sütun ekle → doldur → uygulama switch → eski sütun sil (ayrı release).  
- Hatalı release → Vercel **Revert to Previous** + DB **down** migrasyon.

---

## 5) DNS & SSL
- Vercel’de **Add Domain**: `tulumbak.com` + `admin.tulumbak.com` + `api.tulumbak.com`.  
- DNS kayıtları: `A/AAAA` (Vercel managed) veya `CNAME`.  
- SSL: Vercel otomatik sertifika (Let’s Encrypt).  
- **Staging subdomain** kayıtlarını da ekle.

---

## 6) Build & Deploy Akışı
1. PR aç → Vercel **Preview** URL (store/admin/api için ayrı).  
2. CI adımları: `lint` → `typecheck` → `test` → `build`.  
3. **Staging’e merge** → otomatik deploy.  
4. **Smoke Test** (bkz. §9).  
5. **Prod’a Promote** (protected branch → `main`/`prod` merge) → otomatik deploy.  
6. **Post‑deploy** doğrulamalar ve izleme (bkz. §10–§11).

---

## 7) Zamanlanmış İşler (Vercel Cron)
- `notification-message` işleyici: her 1 dk → **queued** e-postaları gönder.  
  - Route: `GET/POST /api/_jobs/notifications/dispatch`
- (ops.) Abandoned cart / cleanup: günlük.  
- Cron ayarlarını **staging** ve **prod** için ayrı planla.

---

## 8) Sağlık Kontrolleri & İzleme
**API Health**
- `GET /api/health` → `{ ok:true, version, db:true }`  
- Uptime monitörü: 1 dakikalık aralık, 10 sn timeout.

**Store/Admin Smoke** (kullanıcı tarafı):
- `/` 200 + LCP < 2.5s  
- `/kategori/tulumbalar` 200  
- `/urun/<slug>` 200  
- `/sepet` 200  
- `/odeme` iFrame host yüklü

**Loglama**
- Yapılandırılmış JSON: `level`, `reqId`, `userId`, `duration`, `route`, `status`.  
- Hata/uyarılar Vercel Logs’ta filtrelenebilir olmalı.

---

## 9) Post‑Deploy Doğrulama (Checklist)
- [ ] Home/PLP/PDP sayfaları açılıyor; görsel oranlar doğru.  
- [ ] TL formatları TR.  
- [ ] Checkout adımları → `create-order` OK.  
- [ ] PayTR **sandbox** ile test ödeme başarılı (staging).  
- [ ] `order_created` e‑postası ulaşıyor (Resend).  
- [ ] Admin Orders realtime toast çalışıyor.  
- [ ] BranchSuggest widget öneri veriyor.  
- [ ] CSP `frame-src` PayTR domainini kapsıyor.  
- [ ] Robots/meta (staging’de noindex).  
- [ ] GA4 eventleri geliyor (`begin_checkout`, `purchase`).

---

## 10) Rollback Prosedürü
1. **Uygulama**: Vercel → Project → Deployments → **Revert to Previous** (store/admin/api ayrı ayrı).  
2. **Env değişikliği kaynaklı ise**: ilgili env’i geri al + yeniden deploy.  
3. **Veritabanı**: son migrasyon seti için **down** komutunu çalıştır.  
4. **PayTR/Resend anahtar rotasyonu** gerekirse `.env` güncelle + redeploy.  
5. Kullanıcıya etki eden kesintilerde status sayfası/duyuru (Twitter/site banner) yayınla.

---

## 11) Olay Yönetimi (Incident Playbook)
**A) Ödeme Hataları Artıyor**
- Adımlar: Logs → `/payments/paytr/init` hata oranı, PayTR status sayfası, iFrame host erişimi.  
- Aksiyon: `PAYTR_SANDBOX=false`/true doğru mu? Timeout/retry ayarları; gerekirse **redirect fallback** aktif öner.

**B) Webhook Ulaşmıyor**
- Adımlar: Vercel Logs → `/webhooks/paytr` hit yok; iptal/tekrar deneme.  
- Aksiyon: DNS/firewall kontrol; imza doğrulama (401) logları; idempotency kayıtları.

**C) Zon Lookup Yanlış**
- Adımlar: `delivery_zone` kayıtlarını doğrula; geojson formatı; branch koordinatları.  
- Aksiyon: Hızlı hotfix: zone disable veya min toplam tutar güncellemesi.

**D) Bildirimler Gitmiyor**
- Adımlar: `notification_message` kuyruğu durumları, Resend API hataları.  
- Aksiyon: Retry backoff; geçici olarak şablon `enabled=false`.

---

## 12) Güvenlik Sertleştime (Hardening)
- **CSP**: `default-src 'self'; img-src 'self' https: data:; script-src 'self'; frame-src https://*.paytr.com; connect-src 'self' https://api.tulumbak.com;`  
- **Secrets**: FE projelerinde yalnız `NEXT_PUBLIC_*`.  
- **Rate limit**: public POST + webhooklarda IP başına `1000/10dk` (konfigüratif).  
- **RLS**: `branch_admin` kısıtları aktif (bkz. `database-schema.md §11`).  
- **PII**: Loglarda telefon/e‑posta maskele.

---

## 13) Sürümleme & Yayın
- **Branch**: `release/x.y.z` → staging → smoke → prod merge.  
- **Changelog**: Conventional Commits’ten otomatik üret.  
- **Tag**: `vX.Y.Z` (CI pipeline artefaktları iliş).

---

## 14) Ek Notlar
- **Storefront-starters** dosyası (canvas) güncel tutuluyor; gerçek API bağlanmadan önce bileşenleri bölüp `apps/store/components/storefront/…` yapısına taşı.  
- Staging’de `robots: noindex` + `X-Robots-Tag: noindex` header.  
- V2: Sentry/Logtail gibi harici log/izleme servisleri entegrasyonu.


# Contribution Guide — Tulumbak

> Bu belge; repo yapısı, branch/PR stratejisi, görev formatı (**#task / #context / #output**), code style, test piramidi, CI/CD, sürümleme, veri migrasyonları ve güvenlik kurallarını kapsar. Amaç: **hızlı**, **tutarlı** ve **güvenli** bir akış.

---

## 1) Temel Prensipler
- **Kaynak dosya:** `docs/00-index.md` (SSOT). Tüm görevler önce buraya referans verir.
- **Türkçe içerik, İngilizce kod.** Değişken/func isimleri İngilizce, UI metinleri TR.
- **Kısa iterasyon:** MVP odaklı, PR küçük ve atomik.
- **Belge‑önce:** PR’lar ilgili *brief/PRD* maddelerini linkler.

---

## 2) Repo & Araçlar
- **Paket yöneticisi:** `pnpm`
- **Node:** `>=20`
- **Framework:** Next.js (App Router), shadcn/ui, Tailwind, TanStack Table, RHF+Zod.
- **DB:** PostgreSQL (+ PostGIS opsiyonel), Supabase Auth.
- **Monorepo (opsiyonel):** `apps/` (store, admin), `packages/ui`, `packages/config`.

```
apps/
  store/
  admin-dashboard/
packages/
  ui/
  config/
docs/
```

---

## 3) Branch & Commit
**Branch isimleri**
- `feat/<scope>-<kısa-konu>`  → `feat/plp-filter-sticky`
- `fix/<scope>-<kısa-konu>`   → `fix/paytr-timeout`
- `chore/<scope>-<kısa-konu>` → `chore/eslint-rules`

**Conventional Commits**
- `feat: add variant editor to product form`
- `fix: correct courier webhook signature check`
- `docs: update admin-dashboard-brief links`
- `chore: bump deps`

**PR isim şablonu**
```
<scope>: <kısa açıklama>
```
Etiketler: `frontend`, `backend`, `admin`, `store`, `db`, `docs`.

---

## 4) Görev Formatı (Agent uyumlu)
Görevler **tek chat** içinde ilerler. Her görev bu şablonla açılır:
```
#task: (hedef)
#context: (dosya yolları ve ilgili maddeler)
#output: (istenen çıktı biçimi: md, tsx, json…)
```
**Örnek**
```
#task: Admin Orders listesinde BranchSuggest widget’ı için API entegrasyonunu yaz.
#context: docs/20-briefs/admin-dashboard-brief.md §6; docs/30-specs/api-specifications.md §4.5
#output: TypeScript (tsx) — components/widgets/branch-suggest.tsx + lib/api.ts değişiklikleri
```

**Agent kuralları**
- Önce context’i özetle, çelişki varsa uyar.
- Ürettikten sonra referans verdiğin maddeleri listele.
- Gerekliyse **ADR** aç (bkz. §13).

---

## 5) Kod Standartları
- **TypeScript strict**: `"strict": true`
- **ESLint + Prettier**: ortak config `packages/config` altında.
- **UI**: shadcn bileşenleri, Tailwind utility first.
- **Erişilebilirlik**: `aria-*`, focus ring, `aria-sort` tablolarda.
- **İsimler**: dosyalar `kebab-case`, bileşenler `PascalCase`.

**Önemli kurallar**
- **Görseller**: `next/image`, oranlar (Hero 16:9, kart 3:2), `sizes` zorunlu.
- **Para formatı**: `formatTL()` helper (1.234,56 TL).
- **Tarih/Saat**: ISO utc sakla, TR format göster.

---

## 6) Test Piramidi
- **Unit**: yardımcılar, dönüştürücüler, kurallar (örn. zone lookup).
- **API**: Supertest ile REST uçları.
- **E2E**: Playwright (kritik akışlar: ürün ekle → sipariş → atama → webhook).

**Min kapsama hedefi (MVP)**: Unit %60, API %50, kritik E2E 5 senaryo yeşil.

---

## 7) CI/CD
- **Platform:** Vercel (apps), DB: managed PostgreSQL.
- **Pipeline adımları**
  1. **Lint** (`pnpm lint`)
  2. **Typecheck** (`pnpm typecheck`)
  3. **Test** (`pnpm test`)
  4. **Build** (`pnpm build`)
  5. **Preview** (PR → Vercel preview URL)
  6. **Deploy** (protected branch → `staging`/`prod`)

**Env yönetimi**
- `dev`, `staging`, `prod` .env setleri; gizliler **Vercel Env**.
- Gerekli anahtarlar: PayTR, Resend, Courier, Webhook secrets (bkz. `api-specifications.md`).

---

## 8) Sürümleme & Yayın
- **SemVer**: `MAJOR.MINOR.PATCH`
- **Release branch**: `release/x.y.z` → `staging` üzerinde test → `prod` merge.
- **Changelog**: otomatik üretim (Conventional Commits’ten).

---

## 9) Veri Değişiklikleri & Migrasyon
- SQL migrasyon aracı: (ör. `drizzle-kit` veya `supabase migration`).
- **Kurallar**
  - *İleri/geri* script yaz (down migration şart).
  - Büyük tablo değişikliğinde **lock** kaçın; kolon ekleme + doldurma + switch stratejisi.
  - `courier_event.event_id` **unique**; idempotency korunur.
- **Seed**: Kategoriler ve örnek ürünler; SKU formatı `CAT-SKU-VAR-WT`.

---

## 10) Güvenlik
- **Auth**: Supabase (httpOnly cookies), RLS politikaları (branch_admin filtreleri).
- **Rate limit**: IP başına `1000/10dk` (ayar sayfası). Webhook’larda da uygulanır.
- **Webhook imzası**: HMAC‑SHA256, timing‑safe compare.
- **PII**: E-postalarda minimum bilgi; loglarda maskeleme.

---

## 11) İzleme (Observability)
- **Log**: her API için yapılandırılmış log (level, reqId, userId, duration).  
- **Metrics**: istek sayısı, hata oranı, P95 latency.  
- **Audit**: Şube/Kurye atama, rate limit değişikliği.

---

## 12) PR Şablonu
```
## Neden?
(İş gereksinimi / brief maddesi linki)

## Ne değişti?
- ...

## Ekran görüntüsü / GIF
(opsiyonel)

## Testler
- [ ] Unit
- [ ] API
- [ ] E2E

## Kontrol Listesi
- [ ] A11y (klavye, aria)
- [ ] Performans (image sizes, lazy)
- [ ] Dokümantasyon güncellendi (00-index veya ilgili brief)
```

---

## 13) ADR (Architectural Decision Record)
`/docs/50-process/adr/ADR-YYYYMMDD-<konu>.md`
- **Bağlam**: problem ve kısıtlar
- **Karar**: seçilen çözüm (örn. turf.js vs PostGIS)
- **Sonuçlar**: trade‑off, etkiler

**Ne zaman ADR?**
- Protokol/entegrasyon değişikliği (PayTR, Courier)
- Veri şeması değişimi (breaking)
- Kütüphane/altyapı seçimleri

---

## 14) Dokümantasyon
- Tüm yeni modül/akışlar için ilgili **brief/PRD** güncellenir.  
- **Relume/Design** değişirse `design-brief.md` güncelle.
- Kod örnekleri `admin-components.md` veya `api-specifications.md`’ye eklenir.

---

## 15) QA & Kabul Kriterleri (Genel)
- **DOR (Definition of Ready)**: Görev; kapsam net, kabul kriterleri var, API/DTO açık.  
- **DOD (Definition of Done)**: Kod + test + dokümantasyon + preview link + ölçüm ve log.

---

## 16) Sık Karşılaşılan Sorular
**S: CSV import var mı?**  
C: Evet, Products için SheetJS dialog’u (bkz. `admin-components.md`).

**S: WhatsApp entegrasyonu mesaj gönderiyor mu?**  
C: Hayır; yalnız CTA link (numara+mesaj admin’den ayarlanır).

**S: Konum takip (kurye) gerçek mi?**  
C: v1 demo, v2 gerçek zamanlı.

---

## 17) İlk Kurulum (Hızlı)
```bash
pnpm i
pnpm -C apps/store dev
pnpm -C apps/admin-dashboard dev
```
`.env` dosyalarını doldur; `docs/00-index.md` üzerinden hangi servislerin gerekli olduğunu kontrol et.

---

## 18) Onay & Sahiplik
- **CODEOWNERS**: `apps/store` (FE lead), `apps/admin-dashboard` (FE lead), `apps/api` (BE lead), `docs/` (PM/Derin).  
- Her PR’da ilgili **owner** review şarttır.


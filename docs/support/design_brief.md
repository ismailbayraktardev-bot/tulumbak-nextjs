# Tulumbak — Design Brief (Storefront + Admin)

> Bu brief; marka kimliği, görsel dil, tipografi, renk/token sistemi, grid & spacing, komponent standartları, hareket/erişilebilirlik kuralları ve teslimat kontrol listelerini içerir. Hedef: **sıcak, modern ve hızlı** bir deneyim.

---

## 1) Marka Kuzey Yıldızı (North Star)
- **Vibe:** El emeği, tazelik, Gaziantep mirası; modern ve yalın UI.
- **Doku:** Pastel bej zeminler, doğal ışık, yumuşak gölgeler, yuvarlatılmış köşeler.
- **Ton:** Sıcakkanlı, güven veren, kısa ve net.

---

## 2) Renk Sistemi
**Ana palet**
- `Primary (Amber)`: **#FCA311** (CTA, vurgu)
- `Background (Beige)`: **#FFF9F3** (sayfa zemini)
- `Foreground (Slate)`: **#1E293B** (başlıca metin)
- `Muted`: **#F1F5F9** (arka plan blokları)
- `Border`: **#E5E7EB**
- `Success`: **#22C55E**
- `Warning`: **#EAB308**
- `Destructive`: **#DC2626`

**Kullanım yüzdeleri (yaklaşık)**
- Arkaplan 70%, Metin 15%, Görsel alan 10%, Vurgu/CTA 5%.

**Durum rozetleri (Admin/Orders)**
- `pending` gray, `confirmed` blue, `preparing` amber, `ready` amber/600, `on_delivery` sky, `delivered` green, `cancelled|failed` red.

---

## 3) Tipografi
- **Başlıklar (H1–H3) & Uzun okuma:** **Merriweather** (600)  
- **Arayüz ve gövde metni:** **Lato** (400/500)
- **Fallback:** `-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`
- **Boyut ölçeği** (px): 12, 14, 16, 18, 20, 24, 30, 36, 48  
- **Satır yüksekliği:** min 1.5  
- **Başlık düzeni:** H1 ≤ 48, H2 ≤ 36, H3 ≤ 24, body base 16–18

**UI yönergeleri**
- Ürün adları tek satırdan fazlaysa **2 satır kısıt + ellipsis**.  
- Fiyat TL gösterimi: `1.800,00 TL` (nokta binlik, virgül kuruş).  
- Buton metinleri **fiil + kısalık**: “Sepete ekle”, “Hemen satın al”.

---

## 4) Grid, Spacing ve Breakpoints
- **Container genişlikleri:**  
  - `sm` 360–640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1440–1536
- **Grid:** 12 kolon; kolon aralığı **24px**; section düşey boşluk **64–96px**
- **Radius:** `lg:12`, `xl:16`, `2xl:20`
- **Gölge:** `card: 0 6px 20px rgba(0,0,0,0.05)`

**Sticky davranışlar**
- Store **Navbar** sticky.  
- PLP **Filter Bar** sticky (mobilde yatay kaydırılabilir pill’ler).  
- Sepet/Checkout özet kartı **sticky** sağda (lg+). 

---

## 5) Görsel Stil & Medya
- **Oranlar:** Hero **16:9**; ürün kartları **3:2**; kategori kutuları **4:3**.  
- **Işık:** Stüdyo/difüz yumuşak ışık; sıcak ton.  
- **Arkaplan:** Pastel bej/doku; abartı gradient yok.  
- **Format:** WebP (AVIF opsiyonel); dosya adı `kategori-urun-xx.webp`.  
- **`next/image`** için `sizes` tanımlı; `loading="lazy"` (hero hariç).  
- **Alt metin:** Anlamlı, ürün ve varyant içerir (“Fıstıklı yaş baklava, 1 kg”).

---

## 6) Komponent Rehberi (Storefront)
**Navbar**
- Solda logo, ortada arama, sağda hesap/sepet. Mobilde **Search as page**.

**Hero**
- Sol metin blok, sağ ürün foto; CTA: “Hemen Alışverişe Başla” (primary).

**Category Tiles**
- 5 kutu: Baklavalar, Tulumba, Şerbetli Tatlılar, Özel Lezzetler, Antep Fıstığı & Ezme.

**Product Card**
- Görsel 3:2, ad (2 satır), başlangıç fiyatı, **“Seçenekleri görüntüle”** (PDP’ye gider).  
- Hover: hafif yükselme + gölge.

**Filter Bar (PLP)**
- Kategori pill’leri; Gramaj (0.5/1/2/3/4 kg) pill; Fiyat **Slider**; “Filtreleri Sıfırla”.

**PDP — Ürün Başlık Alanı**
- Büyük görsel sol; sağda ad, fiyat, kısa açıklama.  
- **Varyant seçici:** buton pill’ler (kg / kişi).  
- Adet stepper; **primary:** “Sepete ekle”, **secondary:** “Hemen satın al”.

**Accordions**
- İçindekiler, Besin Değerleri, Ustanın Önerisi. 

**Related Products**
- 3–4 kart; PDP altında.

**Blog Card**
- 3 kolon grid; görsel, kategori etiketi, başlık, özet.

**WhatsApp Floating Button**
- Sağ alt; admin panelden **numara + başlangıç mesajı** konfigüre edilir.

**Kart CTA düzeni**
- Primary (#FCA311) dolu; Secondary outline; hover’da opacity artışı.

---

## 7) Komponent Rehberi (Admin)
- **App Shell:** Sol Sidebar (sabit), Topbar (sticky), yalnız içerik scroll.  
- **Data Table:** TanStack; server params; zebra opsiyonel; badge renkleri (bkz. Renk Sistemi).  
- **Formlar:** RHF + Zod; hata altında kısa ileti; üstte genel uyarı.  
- **Dialogs/Drawers:** Kurye atama, CSV import, şube atama widget’ı.  
- **Analytics Kartları:** KPI + min chart; boş durumda skeleton.

---

## 8) Erişilebilirlik (A11y)
- Kontrast **AA**; CTA/etiketler ≥ 4.5:1.  
- Hit-target min **44×44px**; form label’ları açık.  
- Focus ring görünür; klavye navigasyon tam.  
- Motion‑reduced: `prefers-reduced-motion` desteklenir.

---

## 9) Hareket (Motion)
- **Süre:** 150–250ms; giriş/çıkış 200–300ms.  
- **Easing:** `ease-out` açılma, `ease-in` kapanma.  
- **Skeleton/Loading:** Shimmer 1200ms; liste ilk yükte skeleton.

---

## 10) SEO & İçerik
- Her sayfada **tek H1**; meta başlık ≤ 60 karakter.  
- **Schema.org:** Product, Breadcrumb, Organization.  
- URL: `/urun/{slug}`, `/kategori/{slug}`; blog `/blog/{slug}`.

**Mikrocopy örnekleri (TR)**
- Sepet boş: “Tatlı kaçamaklarını sepete ekleyelim mi?”  
- Hata (ödemede): “İşlem tamamlanamadı. Kart bilgilerini kontrol edin.”  
- Başarılı sipariş: “Teşekkürler! Siparişiniz alındı.”

---

## 11) Figma Organizasyonu
**Pages**
1. Foundations (Renk, Tipografi, Grid, Elevation)  
2. Components (Buttons, Inputs, Cards, Table, Badges, Dialogs, Pills)  
3. Storefront Screens (Home, PLP, PDP, Cart, Checkout, Order Success, Blog)  
4. Admin Screens (Products, Orders, Couriers, Zones, Notifications, Analytics, Settings)

**Adlandırma**
- `cmp/[component]/[variant]/[state]`  (örn. `cmp/button/primary/hover`).  
- Variant props: `size: sm|md|lg`, `state: default|hover|disabled`.

**Notlar**
- Otomatik layout, constrain’ler ve responsive breakpoints kullan.

---

## 12) Design Tokens
**CSS değişkenleri (örnek)**
```css
:root{
  --background:#FFF9F3;
  --foreground:#1E293B;
  --primary:#FCA311; --primary-foreground:#ffffff;
  --muted:#F1F5F9; --muted-foreground:#64748B;
  --border:#E5E7EB; --card:#ffffff; --card-foreground:#1E293B;
  --success:#22C55E; --warning:#EAB308; --destructive:#DC2626;
  --radius-lg:12px; --radius-xl:16px; --radius-2xl:20px;
}
```

**JSON token dosyası (örnek)**
```json
{
  "color":{
    "background":"#FFF9F3","foreground":"#1E293B",
    "primary":"#FCA311","muted":"#F1F5F9","border":"#E5E7EB",
    "success":"#22C55E","warning":"#EAB308","destructive":"#DC2626"
  },
  "radius":{"lg":12,"xl":16,"2xl":20},
  "shadow":{"card":"0 6px 20px rgba(0,0,0,0.05)"},
  "typography":{"heading":"Merriweather","body":"Lato"}
}
```

**Tailwind config eşleme (özet)**
```ts
extend:{
  colors:{
    background:"#FFF9F3", foreground:"#1E293B",
    primary:{DEFAULT:"#FCA311", foreground:"#fff"},
    muted:{DEFAULT:"#F1F5F9", foreground:"#64748B"},
    border:"#E5E7EB", card:{DEFAULT:"#fff", foreground:"#1E293B"},
    success:"#22C55E", warning:"#EAB308", destructive:"#DC2626"
  },
  borderRadius:{lg:"12px", xl:"16px", "2xl":"20px"},
  boxShadow:{card:"0 6px 20px rgba(0,0,0,0.05)"}
}
```

---

## 13) Sayfa Bazlı Bölüm Kuralları (Sitemap’a uygun)
**Home**: Hero (16:9) → Bestsellers grid (3 kolon) → Category tiles (5) → 1843 teaser → Blog 3‑card → Delivery/Contact CTA.  
**PLP**: Başlık/intro → Sticky Filter Bar → 3‑kolon ürün grid → Pagination.  
**PDP**: Sol görsel, sağ bilgi → Varyant pill → CTA’lar → Accordions → İlgili ürünler.  
**Blog**: Featured header → 3‑kolon grid → Detay sayfası tipografi.  
**Contact**: Bilgi → Form → Harita → WhatsApp CTA.  
**Cart/Checkout/Order Success**: Sticky özet + büyük CTA.

---

## 14) Performans Hedefleri
- **LCP < 2.5s**, **CLS < 0.1**, **TTI < 3.5s** (store).  
- Görseller: responsive srcset + `sizes`; hero öncelikli yük; kritik CSS minimum.

---

## 15) Do / Don’t
**Do**: Bol beyaz alan, net hiyerarşi, kısa metin, anlamlı alt metin, gerçek ürün foto.  
**Don’t**: Aşırı gradient, yoğun gölge, çok renk, tam ekran modal furyası, uzun form alanları.

---

## 16) QA Kontrol Listesi
- [ ] Kontrast AA  
- [ ] H1 var ve benzersiz  
- [ ] Mobil nav + sticky filter davranışı  
- [ ] Kart görselleri 3:2; hero 16:9  
- [ ] TL formatı doğru  
- [ ] Focus ring görünür  
- [ ] Skeleton yüklemeleri  
- [ ] WhatsApp floating buton çalışıyor  
- [ ] PDP varyant seçici pill’ler erişilebilir

---

## 17) Teslimatlar
- Figma: Foundations + Components + Storefront + Admin sayfaları.  
- `packages/ui`: Button, Input, Card, Badge, Accordion, Dialog, Table, Tabs, Slider, Pagination, Toast, Tooltip.  
- Style docs: Bu brief + token JSON + Tailwind config snippet.

---

## 18) Ek Notlar
- Blog içerikleri ekipçe girilecek; tipografik stil hazır.  
- WhatsApp entegrasyonu **yalnız CTA** (API yok); admin’den numara/metin düzenlenir.  
- V2’de Kurye canlı konum görselleştirme (heat pulse) için harita bileşeni hazırlanacak.

# Data Seed — Kategoriler, Ürünler, SKU & Örnek CSV/JSON

> Amaç: MVP için **kategori/ürün** verilerini hızlıca içeri almak; SKU kuralı, slug kuralları, CSV/JSON şeması ve görsel isimlendirmesini netleştirmek. Bu seed, `database-schema.md` ve `storefront-sections.md` ile uyumludur.

---

## 1) Kategori Tanımları (MVP)
| id | ad | slug | açıklama | sıra |
|---|---|---|---|---|
| cat_tulumbalar | Tulumba Tatlıları | `tulumbalar` | Klasik ve dolgulu tulumba çeşitleri | 1 |
| cat_sutlu | Sütlü Tatlılar | `sutlu-tatlilar` | Sütlü/soğuk tatlılar | 2 |
| cat_serbetli | Şerbetli Tatlılar | `serbetli-tatlilar` | Baklava, kadayıf, şerbetli tatlılar | 3 |

> **Not**: İleride “Baklavalar” gibi alt kategori eklemek istersek `parent_category_id` ile ağaç yapısına geçebiliriz. MVP’de 3 üst kategori yeterli.

---

## 2) Slug & SKU Kuralları
**Slug (URL)**
- Türkçe karakterler sadeleştirilir: `ş→s, ç→c, ğ→g, ı→i, İ→i, ö→o, ü→u, â→a`  
- Boşluk/özel karakterler `-` olarak yazılır, çift `--` birleştirilir.
- Küçük harf: `"Antep Fıstıklı Tulumba" → "antep-fistikli-tulumba"`.

**SKU**
- Format: `<KAT>-<SIRA>` (3 harf kategori + 4 haneli sıra).  
  - Tulumba: `TUL-0001`, Sütlü: `SUT-0001`, Şerbetli: `SER-0001`.  
- Varyantlı ürünlerde: `-<VAR>` eki eklenir (örn. `TUL-0001-S1` tek kişilik; `BAK-0004-W1KG` 1 kg).  
- Barcode alanı opsiyonel; yoksa boş bırakılır.

---

## 3) Ürün CSV (MVP — tek fiyatlı/sade ürünler)
**Şema (header)**
```
category_slug,name,slug,type,price,currency,description,tags,sku,image,barcode
```
**Açıklama**
- `type`: `simple | variable` (MVP’de çoğu **simple**).  
- `tags`: virgüllü küçük etiketler (örn. `tulumba,antep-fistik`).  
- `image`: `/media/products/<slug>-1.jpg` önerilir (bkz. §6 görseller).  

**CSV İçerik**
```
tulumbalar,Tulumba Tatlısı,tulumba-tatlisi,simple,120,TRY,Tek kişilik klasik tulumba,"tulumba,klasik",TUL-0001,/media/products/tulumba-tatlisi-1.jpg,

tulumbalar,Antep Fıstıklı Tulumba,antep-fistikli-tulumba,simple,220,TRY,Antep fıstığı dolgulu tulumba,"tulumba,antep-fistik",TUL-0002,/media/products/antep-fistikli-tulumba-1.jpg,

tulumbalar,Frambuazlı Tulumba,frambuazli-tulumba,simple,220,TRY,Frambuaz dolgulu tulumba,"tulumba,frambuaz",TUL-0003,/media/products/frambuazli-tulumba-1.jpg,

tulumbalar,Çikolatalı Tulumba,cikolatali-tulumba,simple,220,TRY,Çikolata dolgulu tulumba,"tulumba,cikolata",TUL-0004,/media/products/cikolatali-tulumba-1.jpg,

tulumbalar,Kaymaklı Tulumba,kaymakli-tulumba,simple,220,TRY,Kaymak dolgulu tulumba,"tulumba,kaymak",TUL-0005,/media/products/kaymakli-tulumba-1.jpg,

tulumbalar,Tahinli Fıstıklı Tulumba,tahinli-fistikli-tulumba,simple,220,TRY,Tahin ve fıstık dolgulu tulumba,"tulumba,tahin,antep-fistik",TUL-0006,/media/products/tahinli-fistikli-tulumba-1.jpg,

tulumbalar,Karışık Dolgulu Tulumba,karisik-dolgulu-tulumba,simple,220,TRY,Birden fazla dolgu çeşidi,"tulumba,karisik",TUL-0007,/media/products/karisik-dolgulu-tulumba-1.jpg,

tulumbalar,Lotuslu Tulumba Tatlısı,lotuslu-tulumba-tatlisi,simple,220,TRY,Lotus kreması dolgulu ve bisküvi kırıklı,"tulumba,lotus",TUL-0008,/media/products/lotuslu-tulumba-tatlisi-1.jpg,

sutlu-tatlilar,Soğuk Baklava (Cevizli),soguk-baklava-cevizli,simple,290,TRY,Sütlü şerbetli cevizli soğuk baklava,"sutlu,baklava,ceviz",SUT-0001,/media/products/soguk-baklava-cevizli-1.jpg,

sutlu-tatlilar,Soğuk Baklava (Fıstıklı),soguk-baklava-fistikli,simple,390,TRY,Sütlü şerbetli Antep fıstıklı soğuk baklava,"sutlu,baklava,antep-fistik",SUT-0002,/media/products/soguk-baklava-fistikli-1.jpg,

sutlu-tatlilar,Cevizli Sütlü Nuriye,cevizli-sutlu-nuriye,simple,250,TRY,Geleneksel sütlü Nuriye tatlısı,"sutlu,ceviz",SUT-0003,/media/products/cevizli-sutlu-nuriye-1.jpg,

serbetli-tatlilar,Halka Tatlısı,halka-tatlisi,simple,40,TRY,Çıtır halka tatlısı,"serbetli,tulumba",SER-0001,/media/products/halka-tatlisi-1.jpg,

serbetli-tatlilar,Cevizli Özel Baklava,cevizli-ozel-baklava,simple,250,TRY,Küçük dilim özel cevizli baklava,"serbetli,baklava,ceviz",SER-0002,/media/products/cevizli-ozel-baklava-1.jpg,

serbetli-tatlilar,Fıstıklı Kaymaklı Midye Baklava,fistikli-kaymakli-midye-baklava,simple,390,TRY,Midye baklava; Antep fıstığı ve kaymaklı,"serbetli,baklava,antep-fistik,kaymak",SER-0003,/media/products/fistikli-kaymakli-midye-baklava-1.jpg,

serbetli-tatlilar,Cevizli Klasik Baklava,cevizli-klasik-baklava,simple,250,TRY,Klasik cevizli baklava (tek kişilik),"serbetli,baklava,ceviz",SER-0004,/media/products/cevizli-klasik-baklava-1.jpg,

serbetli-tatlilar,Diyarbakır Burma Kadayıf (Küçük),diyarbakir-burma-kadayif-kucuk,simple,90,TRY,Bol cevizli küçük porsiyon,"serbetli,kadayif,ceviz",SER-0005,/media/products/diyarbakir-burma-kadayif-kucuk-1.jpg,

serbetli-tatlilar,Cevizli Kadayıf,cevizli-kadayif,simple,250,TRY,Klasik tel kadayıf cevizli,"serbetli,kadayif,ceviz",SER-0007,/media/products/cevizli-kadayif-1.jpg,

serbetli-tatlilar,Cevizli Ev Baklavası,cevizli-ev-baklavasi,simple,250,TRY,Ev usulü baklava,"serbetli,baklava,ceviz",SER-0008,/media/products/cevizli-ev-baklavasi-1.jpg,

serbetli-tatlilar,Fıstıklı Kuru Baklava,fistikli-kuru-baklava,simple,390,TRY,Daha az şerbetli, bol fıstıklı,"serbetli,baklava,antep-fistik",SER-0009,/media/products/fistikli-kuru-baklava-1.jpg,

serbetli-tatlilar,Çikolatalı Cevizli Baklava,cikolatali-cevizli-baklava,simple,250,TRY,Çikolata dokunuşlu cevizli baklava,"serbetli,baklava,cikolata,ceviz",SER-0010,/media/products/cikolatali-cevizli-baklava-1.jpg,

serbetli-tatlilar,Kalburabastı (Cevizli),kalburabasti-cevizli,simple,190,TRY,Geleneksel cevizli kalburabastı,"serbetli,ceviz",SER-0011,/media/products/kalburabasti-cevizli-1.jpg,

serbetli-tatlilar,Lor Tatlısı,lor-tatlisi,simple,190,TRY,Yöresel lor peynirli tatlı,"serbetli,lor",SER-0012,/media/products/lor-tatlisi-1.jpg,

serbetli-tatlilar,Cevizli Halep Tatlısı,cevizli-halep-tatlisi,simple,320,TRY,Hindistan cevizli kaplama, cevizli iç,"serbetli,halep,ceviz",SER-0013,/media/products/cevizli-halep-tatlisi-1.jpg,

serbetli-tatlilar,Kaymaklı Cevizli Halep Tatlısı,kaymakli-cevizli-halep-tatlisi,simple,350,TRY,Kaymak ilaveli cevizli halep tatlısı,"serbetli,halep,ceviz,kaymak",SER-0014,/media/products/kaymakli-cevizli-halep-tatlisi-1.jpg,

serbetli-tatlilar,Şekerpare,sekerpare,simple,190,TRY,Klasik şerbetli kurabiye,"serbetli",SER-0016,/media/products/sekerpare-1.jpg,

serbetli-tatlilar,Bal Badem Tatlısı,bal-badem-tatlisi,simple,190,TRY,Haşhaş, tarçın ve badem aromalı,"serbetli,badem",SER-0017,/media/products/bal-badem-tatlisi-1.jpg,

serbetli-tatlilar,Ekmek Kadayıfı (Kaymaklı),ekmek-kadayifi-kaymakli,simple,220,TRY,Bol kaymaklı ekmek kadayıfı,"serbetli,kadayif,kaymak",SER-0018,/media/products/ekmek-kadayifi-kaymakli-1.jpg,

serbetli-tatlilar,Şambali Tatlısı,sambali-tatlisi,simple,50,TRY,Adet servis edilen şambali,"serbetli",SER-0019,/media/products/sambali-tatlisi-1.jpg,

serbetli-tatlilar,Kaymaklı Şambali Tatlısı,kaymakli-sambali-tatlisi,simple,70,TRY,Kaymak ile servis edilen şambali,"serbetli,kaymak",SER-0020,/media/products/kaymakli-sambali-tatlisi-1.jpg,

serbetli-tatlilar,Tahinli Kaymaklı Şambali (Fıstıklı),tahinli-kaymakli-sambali-fistikli,simple,80,TRY,Tahin ve fıstıkla zenginleştirilmiş şambali,"serbetli,tahin,kaymak,antep-fistik",SER-0021,/media/products/tahinli-kaymakli-sambali-fistikli-1.jpg,

serbetli-tatlilar,Kadayıf (Diyarbakır Burma — Cevizli),diyarbakir-burma-kadayifi-cevizli,simple,200,TRY,Bol cevizli Diyarbakır burma kadayıfı,"serbetli,kadayif,ceviz",SER-0022,/media/products/diyarbakir-burma-kadayifi-cevizli-1.jpg,
```

> **Not:** “Diyarbakır Burma Kadayıf (Küçük)” ve **200 TL** olan büyük porsiyonu ayrı ürünler olarak tanımlandı (`SER-0005` ve `SER-0022`). İstersen tek ürün + varyant (küçük/büyük) olarak da tanımlayabiliriz (bkz. §4).

---

## 4) Varyantlı Ürün Örneği (opsiyonel CSV — v1’te tek varyant)
**Header**
```
product_slug,variant_sku,attr_kind,attr_value,price,stock_qty,barcode
```
**Örnek**
```
cevizli-klasik-baklava,SER-0004-W0500,weight,0.5, , ,
cevizli-klasik-baklava,SER-0004-W1000,weight,1, , ,
```
Açıklamalar:
- `price` boş bırakılırsa, admin panelden girilir.  
- `attr_kind`: `weight | serving`.  
- `attr_value`: `kg` için **0.5 / 1 / 2** gibi sayısal; `serving` için `"tek" | 2 | 4` vb.  
- Eğer ürün `type=variable` ise ana fiyat yerine **varyant fiyatı** kullanılır.

---

## 5) JSON Seed (alternatif)
```json
{
  "categories": [
    { "id": "cat_tulumbalar", "name": "Tulumba Tatlıları", "slug": "tulumbalar" },
    { "id": "cat_sutlu", "name": "Sütlü Tatlılar", "slug": "sutlu-tatlilar" },
    { "id": "cat_serbetli", "name": "Şerbetli Tatlılar", "slug": "serbetli-tatlilar" }
  ],
  "products": [
    {
      "name": "Tulumba Tatlısı",
      "slug": "tulumba-tatlisi",
      "category_slug": "tulumbalar",
      "type": "simple",
      "price": 120,
      "currency": "TRY",
      "tags": ["tulumba","klasik"],
      "sku": "TUL-0001",
      "images": [{"url":"/media/products/tulumba-tatlisi-1.jpg","alt":"Tulumba tatlısı"}]
    },
    {
      "name": "Soğuk Baklava (Fıstıklı)",
      "slug": "soguk-baklava-fistikli",
      "category_slug": "sutlu-tatlilar",
      "type": "simple",
      "price": 390,
      "currency": "TRY",
      "tags": ["sutlu","baklava","antep-fistik"],
      "sku": "SUT-0002",
      "images": [{"url":"/media/products/soguk-baklava-fistikli-1.jpg","alt":"Fıstıklı soğuk baklava"}]
    }
  ]
}
```

---

## 6) Görsel Dosyaları (isimlendirme)
- Yol: `/public/media/products/` veya CDN.  
- İsim: `<slug>-<index>.jpg` (örn. `tulumba-tatlisi-1.jpg`).  
- Rasyo: Kart 3:2, Hero 16:9 (bkz. `storefront-sections.md`).  
- **Alt metin**: ürün + varyant (“Fıstıklı tulumba, tek kişilik”) biçiminde.

---

## 7) Import Yöntemleri
**A) Hızlı Seed (Backoffice/Script)**
- Node script ile CSV → JSON → REST `POST /admin/products/bulk` (veya doğrudan DB insert).  
- **Idempotent**: `slug` veya `sku` eşleşirse **update** moduna geç.  

**B) Admin Panel (v1.1)**
- `Products > Import` (SheetJS): CSV başlık eşleştirme → önizleme → içe aktar.  
- Hatalı satırlar için satır bazlı geri bildirim (ör. *slug zaten var*).

---

## 8) Varsayılanlar & İş Kuralları
- Para birimi **TL**; fiyatlar **KDV dahil** (UI buna göre etiketli).  
- Stok: ürün bazlı (MVP). Varyant stokları v2’de açılabilir.  
- `is_featured` alanı ile Home “Çok Satanlar” seçilebilir.  
- **Arama** için `search_keywords`: ad + etiketler + kategori adı birleşimi.

---

## 9) Kabul Kriterleri
- CSV dosyası içeri alınca **PLP/PDP** fiyat ve isimler doğru görünür.  
- Slug’lar TR kurallarına uygun, benzersizdir.  
- Her ürünün **SKU**’su benzersiz; ileride varyant eklendiğinde `-<VAR>` ile genişler.  
- Görseller doğru yollarla yüklenir; kartlarda 3:2 oran korunur.

---

## 10) İleriye Dönük (V2)
- **Varyant setleri** (weight/serving) ve varyant bazlı kampanya/indirim.  
- **CSV export** ve toplu fiyat güncelleme.  
- **Alt kategori** (Baklavalar) ve filtre optimizasyonu.  
- **Barcode** yapısının POS/Entegrasyon ile senkronu (opsiyon).


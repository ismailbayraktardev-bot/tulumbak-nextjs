# Courier Integration — Tulumbak (Şube/Zone + Atama + Webhook)

> Amaç: Tulumbak Storefront’ta oluşan siparişlerin **doğru şubeye atanması** ve **kurye uygulamasıyla** çift yönlü, güvenli ve idempotent iletişimin tanımı. Bu belge **MVP** kapsamını ve **v2** eklerini içerir.

---

## 1) Mimari Genel Bakış

```
Storefront → Backend (Tulumbak API) → Courier Service API
                                   ↑                    ↓
                             Webhooks (HMAC)      Status/Location events
```

- **Outbound (Tulumbak → Courier):** Sipariş/teslimat kaydı oluşturma, kurye atama, iptal.  
- **Inbound (Courier → Tulumbak):** `order-assigned`, `order-picked`, `on-the-way`, `delivered`, `failed`, **(v2)** `location-update`.
- **Atama Motoru:** Yeni siparişte **adres → zone → branch** eşlemesi yapar; önerilen şubeyi admin’e widget ile gösterir.

---

## 2) Varlıklar (Entities)

### 2.1 Branch (Şube)
- `id (uuid)`
- `name` — Menemen Lise Yolu | Menemen Cengiz Topel Cd. | İzmir Ulukent
- `location` — `{ lat, lng }` (WGS84)
- `open_hours` — örn. `Mon–Sun 09:00–21:00`
- `active` (bool)

### 2.2 DeliveryZone (Bölge)
- `id (uuid)`, `branch_id` (FK)
- `kind` — `polygon` | `radius`
- `geojson` — Polygon/MultiPolygon (EPSG:4326) veya `{ center:{lat,lng}, radius_m }`
- `min_order_total` (ops.)
- `active_hours` (ops.)

### 2.3 Courier (Kurye)
- `id (uuid)`, `name`, `phone`
- `vehicle_type` — bike | motorcycle | car
- `active` (bool)

### 2.4 Delivery (Teslimat kaydı)
- `id (uuid)` — Tulumbak tarafında `order_id` ile eşleşir
- `branch_id`, `courier_id (nullable)`
- `address` — text + `{lat,lng}`
- `slot` — örn. `2025-10-21T14:00/16:00`
- `status` — `pending | assigned | picked | on_the_way | delivered | failed | cancelled`

### 2.5 CourierEvent (Webhook Log)
- `id (uuid)`, `event_id (unique)`
- `event_type` — aşağıdaki event adlarından biri
- `payload (jsonb)`
- `processed_at`
- `signature_valid (bool)`

---

## 3) Sipariş → Şube Atama (Address → Zone → Branch)

### 3.1 Algoritma
1. **Geocode**: Adres alındığında `{lat,lng}` elde edilir (ilk siparişte yapılır ve siparişe kaydedilir).  
2. **Zone Lookup**: `point-in-polygon` veya `distance ≤ radius`.  
3. **Kural**: Zone eşleşirse o zone’un `branch_id`’si **önerilen** şube olur.  
4. **Hiçbiri eşleşmezse**: Haversine ile **en yakın şube** bulunur → rozet: “Bölge dışı (yakın: X)”.  
5. **Çalışma saatleri**: Şube kapalıysa uyarı, bir sonraki uygun şube önerisi.  
6. **Admin widget**: “Önerilen: Ulukent (2.1 km) — [Ata] [Değiştir…]”.  
7. **Idempotency**: Aynı siparişe birden fazla atamayı engelle.

> Geo motoru için seçenekler: **PostGIS** (tercih) veya **turf.js** ile server-side hesap (Polygon & mesafe).

### 3.2 Admin Widget (UI)
- Orders List’te yeni sipariş satırında veya Detay sayfasında görünür.  
- Tek tıkla **Şubeye Ata** → ardından **Kurye Ata** modalı açılabilir.

---

## 4) Outbound API (Tulumbak → Courier Service)

**Base URL (örnek):** `https://courier.tulumbak.com/api/v1`

### 4.1 Create Delivery
`POST /deliveries`
```json
{
  "delivery_id": "a9f1…",          // Tulumbak tarafındaki order/delivery id
  "branch_id": "br_ulukent",
  "customer": { "name": "Ali", "phone": "+90…" },
  "address": { "text": "…", "lat": 38.6123, "lng": 27.0699 },
  "slot": { "from": "2025-10-21T14:00:00+03:00", "to": "2025-10-21T16:00:00+03:00" },
  "notes": "Zil çalın, bekleyin",
  "items": [ { "sku": "TLM-STD-1KG", "qty": 1 } ]
}
```
**201**
```json
{ "success": true, "courier_ref": "c-del-78421" }
```

### 4.2 Assign Courier
`POST /deliveries/{courier_ref}/assign`
```json
{ "courier_id": "cr_102" }
```
**200** `{ "success": true }`

### 4.3 Cancel Delivery
`POST /deliveries/{courier_ref}/cancel`
```json
{ "reason": "customer_cancelled" }
```
**200** `{ "success": true }`

**Headers (tüm istekler):**
- `Authorization: Bearer <COURIER_API_KEY>`
- `Idempotency-Key: <uuid>`

**Hata Kodları:** `400 INVALID_PAYLOAD`, `401 UNAUTHORIZED`, `404 NOT_FOUND`, `409 DUPLICATE`, `429 RATE_LIMITED`, `500 COURIER_ERROR`.

---

## 5) Inbound Webhooks (Courier → Tulumbak)

**Endpoint Base:** `POST https://tulumbak.com/api/webhooks/courier`

**Headers:**
- `X-Webhook-Signature: sha256=<hex>` (HMAC-SHA256, secret: `COURIER_WEBHOOK_SECRET`)
- `Content-Type: application/json`

**Genel Olay Şeması**
```json
{
  "event_id": "evt_9b1e…",       
  "type": "order-assigned | order-picked | on-the-way | delivered | failed | location-update",
  "created_at": "2025-10-21T14:10:22Z",
  "data": {
    "courier_ref": "c-del-78421",
    "delivery_id": "a9f1…",      
    "courier": { "id": "cr_102", "name": "Mehmet" },
    "location": { "lat": 38.61, "lng": 27.07 },
    "status_note": "yola çıkıldı"
  }
}
```

### 5.1 Olay Tipleri
- `order-assigned` — kurye atandı → Orders.status=`on_delivery` öncesi `ready` olabilir.
- `order-picked` — sipariş mağazadan alındı → `on_delivery`.
- `on-the-way` — yolda; (opsiyonel) müşteriye bildirim.
- `delivered` — teslim edildi → kapanış; teslim notu (kurye app tarafında). 
- `failed` — teslim edilemedi; neden zorunlu.
- **(v2)** `location-update` — {lat,lng, heading, speed?}; yalnız admin haritada canlı göstermek için.

### 5.2 Güvenlik — İmza Doğrulama (Node örneği)
```ts
import crypto from "node:crypto";
function verify(body: string, signature: string, secret: string){
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const sig = signature.replace("sha256=", "");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  return a.length===b.length && crypto.timingSafeEqual(a,b);
}
```

### 5.3 Idempotency
- `event_id` **unique**; daha önce işlendi ise **200** döndür ama tekrarlama.
- İşlem öncesi `courier_events(event_id)` kontrolü.

### 5.4 Retry Politikası
- `2xx` → başarı.  
- `5xx` → Courier yeniden dener: **exp backoff** `1m, 5m, 15m, 1h` (24h’ye kadar).  
- `4xx` → yeniden deneme **yok** (örn. `401`, `404`).

---

## 6) Durum Geçişleri (Orders)

```
pending → confirmed → preparing → ready → on_delivery → delivered
                                   ↘ cancelled | failed
```
- `order-assigned` → `on_delivery` öncesi `ready` ile birlikte kullanılır.  
- `failed` → **neden** zorunlu: `no_answer | wrong_address | out_of_zone | other`.

---

## 7) Ortam Değişkenleri (.env)
```
COURIER_API_URL=https://courier.tulumbak.com/api/v1
COURIER_API_KEY=***
COURIER_WEBHOOK_SECRET=***
GEO_PROVIDER=postgis|turf
```

---

## 8) Örnek Next.js Route’ları (MVP İskelet)

### 8.1 Webhook Handler
```ts
// app/api/webhooks/courier/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "@/lib/webhook-verify";
import { upsertCourierEvent, processCourierEvent } from "@/lib/courier-events";

export async function POST(req: NextRequest){
  const raw = await req.text();
  const sig = req.headers.get("x-webhook-signature") || "";
  if(!verify(raw, sig, process.env.COURIER_WEBHOOK_SECRET!)){
    return NextResponse.json({ success:false, error:"INVALID_SIGNATURE" }, { status:401 });
  }
  const evt = JSON.parse(raw);
  const already = await upsertCourierEvent(evt); // idempotent
  if(already) return NextResponse.json({ success:true, dedup:true });
  await processCourierEvent(evt); // status update + notifications
  return NextResponse.json({ success:true });
}
```

### 8.2 Zone Lookup (turf.js örnek)
```ts
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import distance from "@turf/distance";

export function findBranchByLocation(pt, zones, branches){
  for(const z of zones){
    if(z.kind==="polygon" && booleanPointInPolygon(pt, z.geojson))
      return z.branch_id;
    if(z.kind==="radius"){
      const d = distance(pt, z.geojson.center, { units:"kilometers" });
      if(d*1000 <= z.geojson.radius_m) return z.branch_id;
    }
  }
  // fallback: nearest branch
  let best = null; let bestKm = Infinity;
  for(const b of branches){
    const km = distance(pt, [b.location.lng, b.location.lat], { units:"kilometers" });
    if(km < bestKm){ bestKm = km; best = b.id; }
  }
  return { branch_id: best, nearest_km: bestKm };
}
```

---

## 9) Bildirim Entegrasyonu (MVP)
- Olay → `notifications.emit(event, payload)`; email şablonları TR; WhatsApp yalnız floating CTA (numara/metin admin’den).

---

## 10) Rate Limit & Güvenlik
- **Inbound webhooks:** IP başına `1000/10dk` (ayar sayfasından değiştirilebilir).  
- **HMAC** zorunlu; saat sürüklenmesine karşı `created_at` toleransı ±5dk (opsiyonel).  
- **Audit log:** Şube atama, kurye atama, iptal nedenleri.

---

## 11) Test Senaryoları (QA)
1. Zone içi adres → doğru şube **otomatik** önerilir.  
2. Zone dışı adres → en yakın şube önerisi + rozet.  
3. Create Delivery → 201, courier_ref döner.  
4. `order-picked` → status `on_delivery`, toast tetiklenir.  
5. `delivered` → sipariş kapanır, müşteriye email gider.  
6. INVALID_SIGNATURE → 401, log kaydı.  
7. Duplicate `event_id` → 200 dedup.  
8. Cancel → status `cancelled` ve courier’a bildirilir.  
9. v2 `location-update` → harita demosu güncellenir.

---

## 12) v2 Yol Haritası
- **Canlı kurye konumu**: 10–15 sn aralıklarla `location-update`; admin haritasında pulse.  
- **Dinamik atama**: Kurye yoğunluğu/rota süresi tahmini ile şube önerisi.  
- **Müşteri takip linki**: Basit harita ve ETA.

---

## 13) cURL Örnekleri
```bash
# Create Delivery
curl -X POST "$COURIER_API_URL/deliveries" \
 -H "Authorization: Bearer $COURIER_API_KEY" \
 -H "Idempotency-Key: $(uuidgen)" \
 -H "Content-Type: application/json" \
 -d '{
  "delivery_id":"a9f1","branch_id":"br_ulukent",
  "customer":{"name":"Ali","phone":"+90555"},
  "address":{"text":"…","lat":38.61,"lng":27.07},
  "slot":{"from":"2025-10-21T14:00:00+03:00","to":"2025-10-21T16:00:00+03:00"},
  "items":[{"sku":"TLM-STD-1KG","qty":1}]
 }'
```

---

## 14) Kabul Kriterleri (MVP)
- Şube/zone yönetimi arayüzü çalışır; yeni zone eklenebilir.  
- Sipariş adresiyle önerilen şube otomatik bulunur; widget ile atanır.  
- Courier’e teslimat oluşturma/atama/iptal uçları çalışır (mock veya gerçek).  
- Webhook imza doğrulama + idempotent çalışma kanıtlandı.  
- Orders status geçişleri UI’da ve DB’de tutarlı.  
- QA senaryoları geçer; log ve ölçüm metrikleri toplanır.

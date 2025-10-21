# Notifications Integration — Tulumbak (Email • WhatsApp CTA • SMS Placeholder)

> Amaç: MVP’de **Email (Resend)** ile operasyon akışlarını bildirmek, **WhatsApp** için yalnız **floating CTA** ayarını yönetmek, **SMS** için ayar sayfasını hazır tutmak. Tüm metinler **TR**, şablonlar değişken tabanlıdır.

---

## 1) Kanallar ve Kapsam
- **Email (Resend)** → aktif (MVP). Olay-temelli şablonlar: `user_activation`, `order_created`, `order_on_delivery`, `order_delivered`, `order_failed|cancelled`.
- **WhatsApp CTA** → storefront’ta sağ-alt buton; admin’den **numara** ve **varsayılan mesaj** yönetilir. API ile mesaj gönderimi **yok**.
- **SMS** → yönetim ekranı/ayar **var**, gönderim **v2**. (Sağlayıcı: NetGSM veya eşdeğer.)

---

## 2) Şablon Sistemi
- Kaynak: `notification_template` tablosu (bkz. `database-schema.md`).
- **Dil:** `language = "tr"`.
- **Motor:** Basit **Mustache** değişkenleri (`{{var}}`) + koşullar `{{#if delivered}}...{{/if}}` (uygulama katmanında).
- **Değişken Sözlüğü** (örn.)
  - Genel: `brand_name`, `brand_logo_url`, `support_email`, `support_phone`, `whatsapp_cta_url`
  - Kullanıcı: `user.name`, `user.email`
  - Sipariş: `order.id`, `order.total`, `order.status`, `order.slot.from`, `order.slot.to`, `order.created_at`
  - Teslimat/Kurye: `courier.name`, `courier.phone`, `tracking_url`
  - Adres: `address.text`, `address.city`, `address.district`

> **Not:** `whatsapp_cta_url` admin ayarından inşa edilir: `https://wa.me/<numara>?text=<urlencode(message)>`.

---

## 3) Olaylar (Triggers)
| Event Key | Ne Zaman | Alıcı |
|---|---|---|
| `user_activation` | Üyelik oluşturulduğunda doğrulama linki | Kullanıcı |
| `order_created` | Sipariş oluşturuldu | Kullanıcı + (ops.) admin bildirimi |
| `order_on_delivery` | Kurye yola çıktığında (webhook `on-the-way` veya `picked`) | Kullanıcı |
| `order_delivered` | Teslim edildi | Kullanıcı |
| `order_failed` | Teslim edilemedi | Kullanıcı + (ops.) admin |

Admin’den **etkin/pasif** ve konu/metin düzenleme yapılabilir. Test gönderimi mümkündür.

---

## 4) Email (Resend) — Kurulum
- **ENV**
```
RESEND_API_KEY=***
EMAIL_FROM="Tulumbak <no-reply@tulumbak.com>"
EMAIL_REPLY_TO="destek@tulumbak.com"
BRAND_LOGO_URL=https://…/logo.png
```
- **Paketler**
```bash
pnpm add resend @react-email/components @react-email/render
```
- **Sunucu yardımcıları** `lib/notify/email.ts`
```ts
import { Resend } from "resend";
import { render } from "@react-email/render";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail({ to, subject, react, text }: { to: string; subject: string; react?: React.ReactElement; text?: string; }){
  const html = react ? render(react) : undefined;
  return await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to, subject, html, text,
    reply_to: process.env.EMAIL_REPLY_TO,
  });
}
```

---

## 5) Email Şablonları (React Email)
> **Stil**: Amber (#FCA311) vurgulu buton, bej arkaplan, sistem fontu (Arial/Helvetica, fallback). Logo üstte, alt bilgi destek iletişimi.

### 5.1 `OrderCreatedEmail`
**Konu:** `Siparişiniz alındı — #{{order.id}}`

**Örnek React Email** `emails/order-created.tsx`
```tsx
import { Button, Hr, Img, Section, Text } from "@react-email/components";

export default function OrderCreated({ order, brandLogoUrl, whatsappUrl }: any){
  return (
    <Section style={{ background:"#FFF9F3", padding:24, fontFamily:"Arial,Helvetica,sans-serif", color:"#1E293B" }}>
      <Img src={brandLogoUrl} alt="Tulumbak" width="120"/>
      <Text style={{ fontSize:20, fontWeight:700, marginTop:16 }}>Teşekkürler! Siparişiniz alındı.</Text>
      <Text style={{ marginTop:8 }}>Sipariş No: <b>#{order.id}</b> — Toplam: <b>{{""+order.total}} TL</b></Text>
      <Text>Teslimat aralığı: <b>{{order.slot.from}}</b> – <b>{{order.slot.to}}</b></Text>
      <Button href={whatsappUrl} style={{ background:"#FCA311", color:"#fff", padding:"12px 20px", borderRadius:8, marginTop:16 }}>Sorunuz mu var? WhatsApp’tan yazın</Button>
      <Hr/>
      <Text style={{ fontSize:12, color:"#64748B" }}>Bu e-posta otomatik gönderilmiştir. Sorularınız için {process.env.EMAIL_REPLY_TO} adresine yazabilirsiniz.</Text>
    </Section>
  );
}
```

### 5.2 `OrderOnDeliveryEmail`
**Konu:** `Siparişiniz yola çıktı — #{{order.id}}`

İçerik: Kurye adı/telefonu, tahmini aralık, takip linki.

### 5.3 `OrderDeliveredEmail`
**Konu:** `Afiyet olsun! Siparişiniz teslim edildi — #{{order.id}}`

İçerik: Kısa teşekkür, değerlendirme/geri bildirim butonu.

### 5.4 `UserActivationEmail`
**Konu:** `Hesabınızı doğrulayın`

İçerik: Aktivasyon linki `{{activation_url}}`, 24 saat geçerli notu.

> Tüm şablonlar `notification_template.body` içine **Mustache** olarak da kaydedilebilir; React Email yalnız build-time default sağlayıcı.

---

## 6) Tetikleme (Service)
`lib/notify/index.ts`
```ts
import { sendEmail } from "./email";
import OrderCreated from "@/emails/order-created";
import Mustache from "mustache";

export async function notify(event: string, payload: any){
  const tpl = await getTemplate({ channel:"email", event, language:"tr" });
  const { subject, body, enabled } = tpl || {};
  if(!enabled) return;
  // Mustache fallback
  if(body){
    const text = Mustache.render(body, payload);
    return sendEmail({ to: payload.user.email, subject, text });
  }
  // React Email default
  if(event === 'order_created'){
    const react = OrderCreated({ order: payload.order, brandLogoUrl: process.env.BRAND_LOGO_URL, whatsappUrl: payload.whatsapp_cta_url });
    return sendEmail({ to: payload.user.email, subject: subject || `Siparişiniz alındı — #${payload.order.id}`, react });
  }
}
```

**Olay bağlama:**
- `order.created` → `notify('order_created', payload)`
- Courier webhook `on-the-way` → `notify('order_on_delivery', payload)`
- Courier webhook `delivered` → `notify('order_delivered', payload)`

---

## 7) Admin UI
- **Notification Templates** (`/admin/notification-templates`)
  - Liste: kanal, event, dil, enabled.  
  - Düzenle: **Subject**, **Body (Mustache)**, **Enabled**.  
  - **Test Gönder**: `POST /admin/notification-templates/{id}/test { to:"..." }`
- **WhatsApp CTA** (`/admin/settings/whatsapp-cta`)
  - Alanlar: **Telefon** (`+90…`), **Varsayılan mesaj** (örn. “Merhaba, siparişim hakkında bilgi almak istiyorum.”).  
  - Örnek link önizlemesi: `https://wa.me/...`.
- **SMS Settings** (`/admin/settings/sms`)
  - Sağlayıcı seçimi (disabled), API anahtarı alanları, gönderim testi **devre dışı**.

---

## 8) API Uçları (Özet)
- `GET/PUT /admin/settings/whatsapp-cta`  
- `GET/POST /admin/notification-templates` … `/{id}` … `/{id}/test`  
- (v2) `GET/PUT /admin/settings/sms`

Storefront kullanımı (WhatsApp CTA):
- Ayar çek: `GET /settings/whatsapp-cta`  
- Buton: sağ-alt fixed, `href=whatsapp_cta_url` (yeni sekme)

---

## 9) Rate Limit, Retry, Idempotency
- Email gönderimleri **queue**’ya yazılır (tablo: `notification_message`) ve işleyici (cron/route handler) tarafından gönderilir.
- Başarısızlıkta retry: 1m, 5m, 15m (max 24h).  
- `notification_message.status`: `queued|sent|failed`.
- Admin **Test Gönder** 60 sn rate limit / IP.

---

## 10) Güvenlik & KVKK
- E-postalarda **minimum PII**; sipariş özetinde adresin yalnız ilk satırı.  
- Unsubscribe gerekmiyor (işlemsel e-posta), yine de footer’da kısa not: “Bu e-posta işlem bilgilendirmesidir.”
- Webhook ve ödeme verileri e-postaya **eklenmez**.

---

## 11) Örnek Mustache Gövdeleri
**order_created.body**
```
Merhaba {{user.name}},
Siparişiniz alındı. Sipariş No: #{{order.id}}
Teslimat aralığı: {{order.slot.from}} – {{order.slot.to}}
Toplam: {{order.total}} TL
Sorularınız için WhatsApp: {{whatsapp_cta_url}}
```

**order_on_delivery.body**
```
Merhaba {{user.name}}, siparişiniz yola çıktı.
Kurye: {{courier.name}} ({{courier.phone}})
Takip: {{tracking_url}}
```

**order_delivered.body**
```
Afiyet olsun {{user.name}}!
Siparişiniz #{{order.id}} teslim edildi. Görüşünüzü bizimle paylaşır mısınız?
```

**user_activation.body**
```
Merhaba {{user.name}}, hesabınızı doğrulamak için bağlantıya tıklayın:
{{activation_url}}
Bağlantı 24 saat geçerlidir.
```

---

## 12) Test Senaryoları
1) `order_created` e-postası tetiklenir ve `notification_message` kaydı `sent` olur.  
2) WhatsApp CTA ayarı güncellendiğinde storefront buton linki değişir.  
3) Admin “Test Gönder” alanı rate‑limit’e takılmadan bir kez çalışır, ikinci denemede 429 üretir.  
4) `order_on_delivery` ve `order_delivered` courier webhook’larıyla tetiklenir.  
5) E-posta HTML’i mobilde 360px genişlikte taşmıyor.

---

## 13) Kabul Kriterleri (MVP)
- Resend ile **order_created**, **order_on_delivery**, **order_delivered**, **user_activation** e-postaları gönderilir.  
- Admin’de **Notification Templates** CRUD + **Test Gönder** çalışır.  
- WhatsApp floating CTA ayarı yönetilir ve storefront’ta gözükür.  
- SMS ayar sayfası hazır; gönderim **devre dışı**.  
- Retry/idempotency ve KVKK kuralları uygulanır.


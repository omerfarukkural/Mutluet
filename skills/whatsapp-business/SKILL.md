# whatsapp-business

WhatsApp Business API ve Twilio üzerinden mesaj gönderir.

TRIGGER: "whatsapp gönder", "whatsapp mesajı", "whatsapp bildir", "meta business api mesaj", "whatsapp template gönder", "whatsapp otp"

## Görev
WhatsApp Business Cloud API (Meta) ve Twilio Sandbox üzerinden mesaj gönderir.

## Gerekli Ortam Değişkenleri
```
# Meta WhatsApp Business API
WHATSAPP_TOKEN          # Graph API Access Token
WHATSAPP_PHONE_NUMBER_ID # Telefon numarası ID (Meta Business Suite'ten)
WHATSAPP_BUSINESS_ID    # Business Account ID

# Twilio WhatsApp Sandbox (geliştirme için)
TWILIO_ACCOUNT_SID      # AC...
TWILIO_AUTH_TOKEN       # ...
TWILIO_WHATSAPP_FROM    # whatsapp:+14155238886 (Sandbox numarası)
```

## Meta WhatsApp Cloud API

### Template Mesaj Gönder (Onaylı Şablon)
```bash
curl -X POST "https://graph.facebook.com/v17.0/$WHATSAPP_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WHATSAPP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "+90[numara]",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": { "code": "tr" }
    }
  }'
```

### Serbest Metin Mesajı (24 saat penceresi içinde)
```bash
curl -X POST "https://graph.facebook.com/v17.0/$WHATSAPP_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WHATSAPP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "+90[numara]",
    "type": "text",
    "text": { "body": "Merhaba! Mutluet'e hoş geldiniz." }
  }'
```

### Medyalı Mesaj (Görsel)
```bash
curl -X POST "https://graph.facebook.com/v17.0/$WHATSAPP_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WHATSAPP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "+90[numara]",
    "type": "image",
    "image": {
      "link": "https://mutluet.org/images/logo.png",
      "caption": "İyilik Fabrikası"
    }
  }'
```

## Twilio ile WhatsApp (Node.js)
```javascript
import twilio from 'twilio';
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Metin mesajı
await client.messages.create({
  from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
  to: 'whatsapp:+90XXXXXXXXXX',
  body: 'Mutluet\'ten mesajınız var!'
});

// Medyalı mesaj
await client.messages.create({
  from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
  to: 'whatsapp:+90XXXXXXXXXX',
  body: 'Etkinlik afişi',
  mediaUrl: ['https://mutluet.org/images/etkinlik.jpg']
});
```

## WhatsApp Webhook (Gelen Mesajlar)
```typescript
// backend/src/routes/whatsapp.ts
import { Router } from 'express';
const router = Router();

// Webhook doğrulama
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Gelen mesajları işle
router.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const message = body.entry[0].changes[0].value.messages[0];
    console.log('Gelen WhatsApp mesajı:', message);
    // İşle...
  }
  res.sendStatus(200);
});

export default router;
```

## Meta Business Suite Kurulum Adımları
1. https://business.facebook.com → İşletme oluştur
2. Meta for Developers (https://developers.facebook.com) → App oluştur → "Business" tipi
3. WhatsApp ürününü ekle → Test telefon numarası al
4. Settings > Access Token → Uzun ömürlü token oluştur
5. Webhook URL ayarla: `https://mutluet-backend.azurewebsites.net/api/whatsapp/webhook`

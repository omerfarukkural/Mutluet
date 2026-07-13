# twilio-comm

Twilio üzerinden SMS, ses araması ve OTP doğrulama gönderir.

TRIGGER: "twilio sms", "sms gönder", "doğrulama kodu gönder", "otp gönder", "twilio arama", "twilio verify", "telefon doğrulama"

## Görev
Twilio API üzerinden SMS, ses araması ve OTP doğrulama işlemlerini yönetir.

## Gerekli Ortam Değişkenleri
```
TWILIO_ACCOUNT_SID    # AC...
TWILIO_AUTH_TOKEN     # ...
TWILIO_PHONE_NUMBER   # +1... (Twilio numarası)
TWILIO_VERIFY_SID     # VA... (Verify Service SID)
TWILIO_MESSAGING_SID  # MG... (Messaging Service SID)
```

## Kurulum
```bash
cd backend && pnpm add twilio
```

## SMS Gönderimi

### Basit SMS
```typescript
import twilio from 'twilio';
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const message = await client.messages.create({
  body: 'Mutluet: Hesabınız başarıyla oluşturuldu! 🎉',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+905XXXXXXXXX'
});
console.log(`Mesaj gönderildi: ${message.sid}`);
```

### Mesajlaşma Servisi ile SMS (Yüksek hacimli)
```typescript
const message = await client.messages.create({
  body: '[mesaj]',
  messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
  to: '+905XXXXXXXXX'
});
```

### Medyalı SMS (MMS)
```typescript
const message = await client.messages.create({
  body: 'Etkinlik afişi ektedir!',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+905XXXXXXXXX',
  mediaUrl: ['https://mutluet.org/images/etkinlik.jpg']
});
```

## OTP / Telefon Doğrulama (Twilio Verify)

### Verify Service Oluştur (Tek Seferlik)
```javascript
const service = await client.verify.v2.services.create({
  friendlyName: 'Mutluet Doğrulama',
  codeLength: 6
});
console.log(`Verify SID: ${service.sid}`); // TWILIO_VERIFY_SID'ye kaydet
```

### Doğrulama Kodu Gönder
```typescript
async function otpGonder(telefonNumarasi: string, kanal: 'sms' | 'call' | 'whatsapp' = 'sms') {
  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID!)
    .verifications
    .create({ to: telefonNumarasi, channel: kanal, locale: 'tr' });

  return verification.status; // 'pending'
}
```

### Kodu Doğrula
```typescript
async function otpDogrula(telefonNumarasi: string, kod: string): Promise<boolean> {
  const check = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID!)
    .verificationChecks
    .create({ to: telefonNumarasi, code: kod });

  return check.status === 'approved';
}
```

### Express Route Örneği
```typescript
// backend/src/routes/otp.ts
import { Router } from 'express';
import twilio from 'twilio';

const router = Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Kod gönder
router.post('/otp/gonder', async (req, res) => {
  const { telefon } = req.body;
  if (!telefon) return res.status(400).json({ hata: 'Telefon numarası gerekli' });

  try {
    await client.verify.v2.services(process.env.TWILIO_VERIFY_SID!)
      .verifications.create({ to: telefon, channel: 'sms', locale: 'tr' });
    res.json({ basarili: true, mesaj: 'Doğrulama kodu gönderildi' });
  } catch (err) {
    res.status(500).json({ hata: 'Kod gönderilemedi' });
  }
});

// Kodu doğrula
router.post('/otp/dogrula', async (req, res) => {
  const { telefon, kod } = req.body;

  try {
    const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID!)
      .verificationChecks.create({ to: telefon, code: kod });

    if (check.status === 'approved') {
      res.json({ basarili: true, mesaj: 'Telefon doğrulandı' });
    } else {
      res.status(400).json({ hata: 'Geçersiz kod' });
    }
  } catch (err) {
    res.status(500).json({ hata: 'Doğrulama başarısız' });
  }
});

export default router;
```

## Ses Araması (TwiML)
```typescript
// Telefon araması başlat
const call = await client.calls.create({
  url: 'https://mutluet-backend.azurewebsites.net/api/twilio/twiml',
  to: '+905XXXXXXXXX',
  from: process.env.TWILIO_PHONE_NUMBER
});

// TwiML endpoint (ne söyleneceği)
router.get('/twiml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice" language="tr-TR">
        Mutluet platformundan aranıyorsunuz.
        Doğrulama kodunuz: 1, 2, 3, 4, 5, 6.
      </Say>
    </Response>`);
});
```

## Mesaj Durumu İzleme (Webhook)
```typescript
// Twilio Console'da Status Callback URL ayarla
router.post('/twilio/status', (req, res) => {
  const { MessageSid, MessageStatus, To } = req.body;
  console.log(`Mesaj ${MessageSid} → ${To}: ${MessageStatus}`);
  // delivered, failed, undelivered durumlarını kaydet
  res.sendStatus(200);
});
```

## Twilio Console İpuçları
1. Console → Phone Numbers → Türkiye'ye SMS gönderim izni kontrol et
2. Messaging Geographic Permissions → Turkey → Etkinleştir
3. $100 kredi → Console → Billing → Otomatik doldurma ayarla
4. Trial hesapta sadece verified numaralara gönderim yapılabilir

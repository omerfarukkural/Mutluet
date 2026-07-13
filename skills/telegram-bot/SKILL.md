# telegram-bot

Telegram Bot API üzerinden bildirim ve mesaj gönderir.

TRIGGER: "telegram bildir", "telegram gönder", "telegram bot mesajı", "telegram grubuna yaz", "telegram kanalı", "telegram deploy bildirimi"

## Görev
Telegram Bot API üzerinden metin, görsel ve doküman gönderir; bot komutları yönetir.

## Gerekli Ortam Değişkenleri
```
TELEGRAM_BOT_TOKEN  # 123456789:ABC... (BotFather'dan)
TELEGRAM_CHAT_ID    # -100... (grup) veya 123... (kişisel)
```

## Bot Oluşturma (Tek Seferlik)
1. Telegram'da @BotFather'a mesaj at
2. `/newbot` komutunu gönder
3. Bot adı: "Mutluet Bildirim"
4. Bot kullanıcı adı: "mutluet_bildirim_bot"
5. Token'ı kopyala → `TELEGRAM_BOT_TOKEN`
6. Chat ID için: Gruba botu ekle → `/start` at → `https://api.telegram.org/bot$TOKEN/getUpdates` ile ID'yi bul

## Temel Mesaj Gönderimi
```bash
# Metin mesajı
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": \"$TELEGRAM_CHAT_ID\", \"text\": \"[mesaj]\", \"parse_mode\": \"Markdown\"}"

# HTML formatı ile
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -d "chat_id=$TELEGRAM_CHAT_ID&text=<b>Başlık</b>%0A<i>İtalik metin</i>&parse_mode=HTML"
```

## Deploy Bildirimi
```bash
send_telegram() {
  local MESSAGE="$1"
  curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d "chat_id=$TELEGRAM_CHAT_ID" \
    --data-urlencode "text=$MESSAGE" \
    -d "parse_mode=Markdown" > /dev/null
}

# Kullanım
BRANCH=$(git branch --show-current)
COMMIT=$(git log -1 --pretty=%s)
DATE=$(date '+%d.%m.%Y %H:%M')

send_telegram "✅ *Mutluet Deploy Tamamlandı*
🌿 Branch: \`$BRANCH\`
📦 Commit: $COMMIT
🕐 Zaman: $DATE
🔗 [Frontend](https://mutluet.azurestaticapps.net) | [Backend](https://mutluet-backend.azurewebsites.net)"
```

## Görsel Gönder
```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendPhoto" \
  -F "chat_id=$TELEGRAM_CHAT_ID" \
  -F "photo=@/path/to/screenshot.png" \
  -F "caption=Hata ekran görüntüsü"
```

## Doküman Gönder
```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendDocument" \
  -F "chat_id=$TELEGRAM_CHAT_ID" \
  -F "document=@/path/to/rapor.pdf" \
  -F "caption=Haftalık Rapor"
```

## Node.js ile Bot
```typescript
import TelegramBot from 'node-telegram-bot-api';
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

// Komut dinle
bot.onText(/\/durum/, async (msg) => {
  const chatId = msg.chat.id;
  // Sağlık kontrolü yap
  await bot.sendMessage(chatId, '✅ Tüm sistemler çalışıyor!');
});

// Hata bildirimi
bot.on('polling_error', (error) => {
  console.error('Telegram polling hatası:', error);
});
```

## Telegram Webhook (Bot sunucu dinleme)
```bash
# Webhook ayarla
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://mutluet-backend.azurewebsites.net/api/telegram/webhook"

# Webhook durumu kontrol
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

## Bildirim Kategorileri
| Emoji | Durum |
|-------|-------|
| ✅ | Başarılı |
| ❌ | Hata |
| ⚠️ | Uyarı |
| 🚀 | Deploy |
| 🔒 | Güvenlik |
| 📊 | Rapor |

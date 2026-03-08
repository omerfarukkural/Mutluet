# slack-notify

Slack kanallarına mesaj ve bildirim gönderir.

TRIGGER: "slack bildir", "slack'e gönder", "slack mesaj yaz", "ekibe slack'ten haber ver", "deploy bildirimi slack", "slack kanal mesajı"

## Görev
Slack API ve MCP üzerinden mesaj gönderir, kanal yönetimi yapar.

## Gerekli Ortam Değişkenleri
```
SLACK_BOT_TOKEN    # xoxb-... (Bot User OAuth Token)
SLACK_WEBHOOK_URL  # https://hooks.slack.com/services/... (Incoming Webhook)
SLACK_TEAM_ID      # T... (Team/Workspace ID)
```

## MCP ile Slack (Önerilen)
```
mcp__slack__post_message         # Mesaj gönder
mcp__slack__list_channels        # Kanalları listele
mcp__slack__list_users           # Kullanıcıları listele
mcp__slack__get_channel_history  # Kanal geçmişi
mcp__slack__reply_to_thread      # Thread yanıtı
```

## Webhook ile Basit Bildirim
```bash
# Metin mesajı
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-type: application/json' \
  -d '{"text": "[mesaj]"}'

# Kanal belirterek
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-type: application/json' \
  -d '{"text": "[mesaj]", "channel": "#geliştirme"}'
```

## Bot API ile Zengin Mesaj
```bash
# Block Kit mesajı (renkli, formatlı)
curl -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H 'Content-type: application/json' \
  -d '{
    "channel": "#geliştirme",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*:rocket: Deploy Tamamlandı!*\n:white_check_mark: Frontend ve backend başarıyla güncellendi."
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": ":clock1: $(date '+%d.%m.%Y %H:%M') | :git: main branch"
          }
        ]
      }
    ]
  }'
```

## Node.js SDK
```javascript
import { WebClient } from '@slack/web-api';
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Mesaj gönder
await slack.chat.postMessage({
  channel: '#geliştirme',
  text: '[mesaj]',
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '*Deploy Bildirimi*' }
    }
  ]
});

// Dosya yükle
await slack.files.uploadV2({
  channel_id: 'C...',
  file: Buffer.from('içerik'),
  filename: 'rapor.txt'
});
```

## Slack App Oluşturma
1. https://api.slack.com/apps → "Create New App"
2. "From scratch" → Uygulama adı: "Mutluet Bot" → Workspace seç
3. "Incoming Webhooks" → Aktif et → Webhook URL kopyala
4. "OAuth & Permissions" → Bot Token Scopes ekle:
   - `chat:write`
   - `channels:read`
   - `users:read`
5. "Install to Workspace" → Bot Token kopyala

## Kanal Listesi (Proje)
- `#geliştirme` — Geliştirici bildirimleri
- `#deploy` — Deploy bildirimler
- `#hatalar` — Hata alarmları
- `#genel` — Genel duyurular

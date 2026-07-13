# social-media

Tüm sosyal medya platformlarında içerik paylaşımı ve yönetimi yapar.

TRIGGER: "instagram paylaş", "facebook post", "twitter at", "linkedin paylaş", "youtube yükle", "sosyal medya paylaşımı", "canva ile görsel yap", "tüm platformlara paylaş", "sosyal medya kampanyası"

## Görev
Instagram, Facebook, X (Twitter), LinkedIn, YouTube ve Canva üzerinden içerik yönetimi yapar.

## Gerekli Ortam Değişkenleri
```
# Meta (Instagram + Facebook)
META_ACCESS_TOKEN       # Graph API Long-Lived Token
META_PAGE_ID            # Facebook Sayfa ID
INSTAGRAM_USER_ID       # Instagram Business Account ID

# X (Twitter)
TWITTER_BEARER_TOKEN    # Read-only Bearer Token
TWITTER_API_KEY         # API Key
TWITTER_API_SECRET      # API Secret
TWITTER_ACCESS_TOKEN    # Access Token
TWITTER_ACCESS_SECRET   # Access Token Secret

# LinkedIn
LINKEDIN_ACCESS_TOKEN   # OAuth2 Access Token
LINKEDIN_AUTHOR_URN     # urn:li:person:ABC123

# YouTube
YOUTUBE_API_KEY         # Google Cloud Console
YOUTUBE_CHANNEL_ID      # Kanal ID

# Canva
CANVA_ACCESS_TOKEN      # Canva Connect API Token
```

## Instagram & Facebook (Meta Graph API)

### Facebook Sayfa Post
```bash
curl -X POST "https://graph.facebook.com/v17.0/$META_PAGE_ID/feed" \
  -d "message=İyilik Fabrikası Mutluet'e hoş geldiniz! 🌟&access_token=$META_ACCESS_TOKEN"
```

### Instagram Görsel Post (2 Adımlı)
```bash
# 1. Medya container oluştur
MEDIA_ID=$(curl -s -X POST "https://graph.facebook.com/v17.0/$INSTAGRAM_USER_ID/media" \
  -d "image_url=https://mutluet.org/images/post.jpg" \
  -d "caption=Bugün #gönüllülük etkinliğimize 50 kişi katıldı! ❤️ #mutluet #iyilikfabrikasi" \
  -d "access_token=$META_ACCESS_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

# 2. Yayınla
curl -X POST "https://graph.facebook.com/v17.0/$INSTAGRAM_USER_ID/media_publish" \
  -d "creation_id=$MEDIA_ID&access_token=$META_ACCESS_TOKEN"
```

### Instagram Hikaye (Carousel)
```bash
# Her görsel için container oluştur, sonra carousel yayınla
for IMAGE_URL in "url1" "url2" "url3"; do
  curl -X POST "https://graph.facebook.com/v17.0/$INSTAGRAM_USER_ID/media" \
    -d "image_url=$IMAGE_URL&is_carousel_item=true&access_token=$META_ACCESS_TOKEN"
done
```

## X (Twitter) API v2

### Tweet At
```bash
curl -X POST "https://api.twitter.com/2/tweets" \
  -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mutluet ile gönüllü ol, değişime katkı sun! 🌱 #gönüllülük #sosyalyardım"}'
```

### Node.js ile Twitter (twitter-api-v2)
```typescript
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!
});

// Tweet at
await client.v2.tweet('Mutluet ile gönüllü ol! 🌟');

// Medyalı tweet
const mediaId = await client.v1.uploadMedia('./images/etkinlik.jpg');
await client.v2.tweet({ text: 'Bugünkü etkinlikten kareler 📸', media: { media_ids: [mediaId] } });
```

## LinkedIn

### Metin Paylaşımı
```bash
curl -X POST "https://api.linkedin.com/v2/ugcPosts" \
  -H "Authorization: Bearer $LINKEDIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"author\": \"$LINKEDIN_AUTHOR_URN\",
    \"lifecycleState\": \"PUBLISHED\",
    \"specificContent\": {
      \"com.linkedin.ugc.ShareContent\": {
        \"shareCommentary\": {\"text\": \"Mutluet platformunda gönüllü faaliyetlerimiz devam ediyor. #gönüllülük\"},
        \"shareMediaCategory\": \"NONE\"
      }
    },
    \"visibility\": {\"com.linkedin.ugc.MemberNetworkVisibility\": \"PUBLIC\"}
  }"
```

## YouTube (Google API)

### Video Bilgisi Getir
```javascript
const { google } = require('googleapis');
const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

// Kanal videoları
const { data } = await youtube.search.list({
  channelId: process.env.YOUTUBE_CHANNEL_ID,
  type: ['video'],
  order: 'date',
  maxResults: 10,
  part: ['snippet']
});
```

## Canva Connect API

### Tasarım Export
```bash
# Token al
curl -X POST "https://api.canva.com/rest/v1/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$AUTH_CODE&..."

# Tasarımları listele
curl "https://api.canva.com/rest/v1/designs" \
  -H "Authorization: Bearer $CANVA_ACCESS_TOKEN"

# Tasarım export et
curl -X POST "https://api.canva.com/rest/v1/exports" \
  -H "Authorization: Bearer $CANVA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"design_id": "[design_id]", "format": {"type": "png", "lossless": true}}'
```

## Pushbullet ile Çapraz Cihaz Bildirim
```bash
curl -X POST https://api.pushbullet.com/v2/pushes \
  -H "Access-Token: $PUSHBULLET_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "note", "title": "Sosyal Medya", "body": "Post başarıyla paylaşıldı!"}'
```

## Tüm Platformlara Toplu Paylaşım
```typescript
async function tumPlatformlardaPaylas(icerik: string, gorselUrl?: string) {
  const sonuclar = await Promise.allSettled([
    facebookPaylas(icerik, gorselUrl),
    instagramPaylas(icerik, gorselUrl),
    twitterPaylas(icerik),
    linkedinPaylas(icerik)
  ]);

  sonuclar.forEach((sonuc, i) => {
    const platform = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn'][i];
    if (sonuc.status === 'fulfilled') {
      console.log(`✅ ${platform}: Başarılı`);
    } else {
      console.error(`❌ ${platform}: ${sonuc.reason}`);
    }
  });
}
```

## İçerik Takvimi
- Pazartesi: Haftalık motivasyon paylaşımı
- Çarşamba: Etkinlik duyurusu
- Cuma: Haftalık özet ve teşekkür
- Hafta sonu: Topluluk hikayesi

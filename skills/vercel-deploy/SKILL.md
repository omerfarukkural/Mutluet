# vercel-deploy

Vercel platformuna frontend deployment yapar (alternatif deploy).

TRIGGER: "vercel'e deploy et", "vercel deployment", "vercel'e yükle", "vercel preview", "vercel prod"

## Görev
Vercel'e frontend deployment gerçekleştirir.

## Kurulum (Tek Seferlik)
```bash
# Vercel CLI kur
npm install -g vercel

# Login
vercel login

# Projeyi bağla
cd /home/user/Mutluet && vercel link
```

## Deployment Komutları
```bash
# Preview deployment (PR/branch için)
vercel

# Production deployment
vercel --prod

# Belirli branch
vercel --prod --build-env NODE_ENV=production

# Ortam değişkeni ekle
vercel env add VITE_API_URL production
vercel env add VITE_SUPABASE_URL production

# Deployment listesi
vercel ls

# Deployment logları
vercel logs [deployment-url]

# Deployment kaldır
vercel remove [deployment-url]
```

## Vercel Yapılandırması (`vercel.json`)
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://mutluet-backend.azurewebsites.net/api/$1" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

## Gerekli Ortam Değişkenleri (Vercel Dashboard)
```
VITE_API_URL              # Backend API URL'i
VITE_SUPABASE_URL         # Supabase proje URL'i
VITE_SUPABASE_ANON_KEY    # Supabase anonim key
VITE_STRIPE_PUBLISHABLE_KEY # Stripe public key
```

## Hata Yönetimi
- Build hatası → `vercel logs` ile hata detaylarına bak
- 404 hatası → `vercel.json`'da rewrites kontrolü
- Env değişkeni sorunu → `vercel env ls` ile değişkenleri kontrol et

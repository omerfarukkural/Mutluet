# 🤖 MUTLUET - CLAUDE CODE PROMPT LIBRARY

Bu dokuman, Mutluet projesi için hazır Claude Code promptlarını içerir. Her promptu kopyalayıp Claude'a yapıştırabilirsiniz.

---

## 📋 İÇİNDEKİLER

1. [Genel Yapı Promptları](#genel-yapı-promptları)
2. [Backend Geliştirme Promptları](#backend-geliştirme-promptları)
3. [Frontend Geliştirme Promptları](#frontend-geliştirme-promptları)
4. [Database Promptları](#database-promptları)
5. [API Entegrasyon Promptları](#api-entegrasyon-promptları)
6. [Test Promptları](#test-promptları)
7. [Deployment Promptları](#deployment-promptları)

---

## 🏗️ GENEL YAPI PROMPTLARI

### Yeni Feature Branch Oluştur

```
Mutluet projesinde yeni bir feature geliştireceğim.

GÖREV: [feature adı - örn: user-profile-page]

ADIMLAR:
1. main branch'ten yeni bir feature branch oluştur
2. Gerekli dosya yapısını hazırla
3. Temel boilerplate kodunu yaz
4. Git commit yap

Branch adı: feature/[feature-adi]

Başlayalım.
```

### Kod Review İsteği

```
Aşağıdaki kodu incele ve iyileştirme önerileri sun:

[KOD BLOĞU]

İNCELE:
- Performans sorunları
- Güvenlik açıkları
- Best practices uygunluğu
- Kod tekrarları
- Error handling eksiklikleri
- TypeScript type güvenliği

Detaylı rapor ver.
```

### Refactoring Promptu

```
Bu kodu refactor et:

[KOD BLOĞU]

SORUNLAR:
- [sorun 1]
- [sorun 2]

İYİLEŞTİRMELER:
- Clean Code prensiplerine uygun hale getir
- DRY (Don't Repeat Yourself) uygula
- Naming convention'ları düzelt
- Okunabilirliği artır

Yeni versiyonunu ver.
```

---

## 🔧 BACKEND GELİŞTİRME PROMPTLARI

### Yeni API Endpoint Oluştur

```
BACKEND: Yeni API endpoint oluştur

ENDPOINT: [METHOD] /api/[path]
AÇIKLAMA: [ne yapacak]

GEREKSİNİMLER:
- HTTP Method: [GET/POST/PUT/DELETE]
- Request Body Schema:
  {
    "field1": "type",
    "field2": "type"
  }
- Response Schema:
  {
    "success": boolean,
    "data": {...}
  }
- Authentication: [Required/Optional]
- Validations: [liste]
- Error Handling: [hangi durumlar]

DOSYALAR:
- Route: backend/src/routes/[name].ts
- Controller: backend/src/controllers/[name].controller.ts
- Service: backend/src/services/[name].service.ts
- Validation: backend/src/validations/[name].validation.ts

Tam implementasyonu yap.
```

### Database Schema Oluştur (Prisma)

```
PRISMA SCHEMA: Yeni model ekle

MODEL ADI: [ModelName]
AÇIKLAMA: [ne için kullanılacak]

FIELDS:
- id: Int @id @default(autoincrement())
- [field1]: [type]
- [field2]: [type] @relation(...)
- createdAt: DateTime @default(now())
- updatedAt: DateTime @updatedAt

RELATIONS:
- [ilişkiler]

INDEXES:
- [hangi alanlara index]

İŞLEMLER:
1. schema.prisma'ya model ekle
2. Migration oluştur: pnpm prisma migrate dev --name [migration-name]
3. Prisma Client'ı güncelle
4. TypeScript type'ları otomatik oluştur

Başlayalım.
```

### Authentication Middleware

```
MIDDLEWARE: JWT Authentication kontrolü

GEREKSİNİMLER:
- Bearer token kontrolü
- Token doğrulama (jsonwebtoken)
- Kullanıcı bilgisini request'e ekle
- Hata durumunda 401 döndür

KULLANIM:
Protected route'larda middleware olarak kullanılacak:
router.get('/protected', authMiddleware, controller)

Dosya: backend/src/middleware/auth.middleware.ts

Tam kodu yaz.
```

### Socket.IO Event Handler

```
SOCKET.IO: Real-time event handler

EVENT ADI: [event-name]
AÇIKLAMA: [ne zaman tetiklenir]

SERVER:
- Event listener
- Data validation
- Broadcast/Emit logic
- Error handling

CLIENT KULLANIMI:
```typescript
socket.emit('event-name', data);
socket.on('event-name', (data) => {...});
```

Dosya: backend/src/socket/[name].socket.ts

Implementasyonu yap.
```

---

## 🎨 FRONTEND GELİŞTİRME PROMPTLARI

### React Component Oluştur

```
REACT COMPONENT: [ComponentName]
DOSYA: src/components/[folder]/[ComponentName].tsx

AÇIKLAMA: [ne yapar]

PROPS:
- prop1: type
- prop2?: type (optional)

STATE:
- [state değişkenleri]

FEATURES:
- [özellikler listesi]

STYLING:
- Tailwind CSS kullan
- Responsive design
- Dark mode desteği

ÖRNEK KULLANIM:
```tsx
<ComponentName prop1="value" />
```

Tam component kodunu yaz.
```

### API Service Hook

```
CUSTOM HOOK: API çağrısı için React hook

HOOK ADI: use[Name]
DOSYA: src/hooks/use[Name].ts

API ENDPOINT: [METHOD] /api/[path]
STATE MANAGEMENT:
- data: T | null
- loading: boolean
- error: Error | null

FONKSIYONLAR:
- fetch[Name]: () => Promise<void>
- refetch: () => void

ERROR HANDLING:
- Toast notification
- Console logging (dev mode)

ÖRNEK KULLANIM:
```tsx
const { data, loading, error, fetchData } = use[Name]();
```

Tam hook kodunu yaz.
```

### Form Validation (React Hook Form + Zod)

```
FORM VALIDATION: [FormName]

FIELDS:
- field1: string (required, min 3, max 50)
- field2: email (required)
- field3: number (min 0, max 100)

ZOD SCHEMA:
- Type-safe validation
- Custom error messages (Türkçe)

REACT HOOK FORM:
- useForm hook setup
- Field registration
- Submit handler
- Error display

ÖRNEK:
```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('field1')} />
  {errors.field1 && <span>{errors.field1.message}</span>}
</form>
```

Dosya: src/validations/[name].schema.ts
Component: src/components/forms/[Name]Form.tsx

Hem schema hem component'i yaz.
```

### Context Provider

```
CONTEXT PROVIDER: [Name]Context

AMAÇ: [Global state yönetimi için ne tutacak]

STATE:
- value1: type
- value2: type

ACTIONS:
- setValue1: (value: type) => void
- setValue2: (value: type) => void

PERSISTENCE:
- localStorage'a kaydet
- sayfa yenilendiğinde restore et

DOSYALAR:
- src/contexts/[Name]Context.tsx
- src/hooks/use[Name].ts

KULLANIM:
```tsx
// App.tsx
<NameProvider>
  <App />
</NameProvider>

// Component
const { value1, setValue1 } = useName();
```

Tam implementation yap.
```

---

## 🗄️ DATABASE PROMPTLARI

### Supabase Query

```
SUPABASE QUERY: [İşlem adı]

TABLO: [table_name]
İŞLEM: [SELECT/INSERT/UPDATE/DELETE]

QUERY:
- Filters: [koşullar]
- Order: [sıralama]
- Limit: [limit]
- Relations: [join'ler]

ÖRNEK:
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('column', value)
  .order('created_at', { ascending: false });
```

Row Level Security (RLS) Policy:
- [güvenlik kuralları]

Tam query ve policy kodunu yaz.
```

### Database Migration Script

```
DATABASE MIGRATION

AMAÇ: [ne değişecek]

DEĞIŞIKLIKLER:
- Yeni tablo: [tablo adı]
- Yeni kolon: [tablo.kolon]
- İndeks: [hangi kolonlara]
- Foreign key: [ilişkiler]

UP MIGRATION:
```sql
-- Migration kodu
```

DOWN MIGRATION (Rollback):
```sql
-- Geri alma kodu
```

Migration dosyası oluştur: backend/prisma/migrations/[timestamp]_[name]/migration.sql
```

---

## 🔌 API ENTEGRASYON PROMPTLARI

### Google OAuth Integration

```
GOOGLE OAUTH: Login entegrasyonu

FRONTEND:
- Google button component
- OAuth flow başlatma
- Callback handling

BACKEND:
- OAuth endpoint (/auth/google)
- Token validation
- User creation/login
- JWT token generation

ENVIRONMENT VARIABLES:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL

DOSYALAR:
- backend/src/routes/oauth.ts
- src/components/auth/GoogleLoginButton.tsx

Tam entegrasyonu yap.
```

### Stripe Payment Integration

```
STRIPE PAYMENT: Bağış ödeme sistemi

AKIŞ:
1. Frontend: Tutar seç → Payment Intent oluştur
2. Backend: Stripe API'ye istek → Client Secret döndür
3. Frontend: Stripe Elements ile kart bilgisi al → Ödemeyi tamamla
4. Backend: Webhook ile confirmation al → Database'e kaydet

KOMPONENLER:
- DonationForm.tsx (tutar seçimi)
- StripeCheckout.tsx (kart bilgisi)
- SuccessPage.tsx (başarı ekranı)

BACKEND:
- POST /api/donations/create-intent
- POST /api/stripe/webhook

ENVIRONMENT VARIABLES:
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET

Tam implementasyonu yap.
```

### Azure Communication Services (Video Call)

```
AZURE COMMUNICATION: Video görüşme

FEATURES:
- Token generation (backend)
- Call başlatma (frontend)
- Video stream (local + remote)
- Audio/Video toggle
- Screen sharing

BACKEND:
- POST /api/video/token
  Response: { token, userId }

FRONTEND:
- VideoCallScreen.tsx
- Azure Communication SDK integration
- Call controls component

PERMISSIONS:
- Camera
- Microphone

Dosya yapısı ve kodu oluştur.
```

---

## 🧪 TEST PROMPTLARI

### Unit Test Yazma

```
UNIT TEST: [FunctionName/ComponentName]

TEST EDİLECEK KOD:
[kod bloğu]

TEST CASES:
1. ✅ Success case: [açıklama]
2. ❌ Error case: [açıklama]
3. 🔄 Edge case: [açıklama]

FRAMEWORK:
- Backend: Jest
- Frontend: Vitest + Testing Library

MOCK:
- API calls
- External dependencies

DOSYA: [name].test.ts

Tam test kodunu yaz.
```

### Integration Test

```
INTEGRATION TEST: [API Endpoint]

ENDPOINT: [METHOD] /api/[path]

TEST SENARYOLARI:
1. Valid request → 200 OK
2. Invalid input → 400 Bad Request
3. Unauthorized → 401
4. Not found → 404
5. Database error → 500

SETUP:
- Test database
- Mock data seeding
- Cleanup after tests

FRAMEWORK: Supertest + Jest

Dosya: backend/tests/integration/[name].test.ts

Tam test suite'i yaz.
```

---

## 🚀 DEPLOYMENT PROMPTLARI

### Azure Deployment Script

```
AZURE DEPLOYMENT: Backend deploy

RESOURCE GROUP: mutluet-prod-rg
APP NAME: mutluet-api

ADIMLAR:
1. Build oluştur
2. Azure'a login
3. Resources oluştur (if not exists)
4. Deploy
5. Environment variables set et

SCRIPT:
- deploy-azure.sh
- .github/workflows/azure-deploy.yml (CI/CD)

ENVIRONMENT:
- NODE_ENV=production
- [diğer env variables]

Hem script hem GitHub Actions workflow'u yaz.
```

### Vercel Frontend Deploy

```
VERCEL DEPLOYMENT: Frontend deploy

PROJECT: Mutluet
FRAMEWORK: Vite + React

CONFIG:
- vercel.json
- Build command: pnpm run build
- Output directory: dist
- Environment variables

FEATURES:
- Preview deployments (PR'ler için)
- Production deployment (main branch)
- Custom domain: mutluet.org

GitHub Actions workflow + vercel.json oluştur.
```

---

## 💡 ÖZEL SENARYOLAR

### Hata Ayıklama

```
BUG FIX: [Hata açıklaması]

HATA MESAJI:
[error message]

OLUŞTUĞU DURUM:
[ne zaman, hangi koşullarda]

BEKLENEN DAVRANŞ:
[ne olmalıydı]

GERÇEKLEŞEN:
[ne oldu]

İLGİLİ KOD:
[kod bloğu]

Hatayı bul ve düzelt. Açıklama ile birlikte çözümü ver.
```

### Performance Optimization

```
PERFORMANCE: [Hangi bölüm]

SORUN:
- Yavaş çalışıyor
- Gereksiz re-render'lar
- Ağır API çağrıları

ÖLÇÜMLERİ:
- Current: [mevcut süre/performans]
- Target: [hedef]

OPTİMİZASYON YÖNTEMLERİ:
- Memoization (useMemo, useCallback)
- Code splitting
- Lazy loading
- Caching
- Database indexing

İlgili kodu analiz et ve optimize et.
```

### Security Audit

```
GÜVENLİK KONTROLÜ: [Feature/Endpoint]

KONTROL EDİLECEKLER:
- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF
- Authentication bypass
- Authorization issues
- Input validation
- Sensitive data exposure

KOD:
[kod bloğu]

Güvenlik açıklarını tespit et ve çözüm öner.
```

---

## 📱 MOBİL UYGULAMA PROMPTLARI (İleride Flutter için)

### Flutter Screen Oluştur

```
FLUTTER SCREEN: [ScreenName]

DOSYA: lib/features/[feature]/presentation/screens/[name]_screen.dart

LAYOUT:
- AppBar: [title]
- Body: [içerik]
- Bottom Navigation: [varsa]

WIDGETS:
- [widget listesi]

STATE MANAGEMENT:
- Provider / Riverpod

API:
- GET/POST /api/[endpoint]

Responsive design + Material Design 3 kullan.
Tam kodu yaz.
```

---

## 🎯 KULLANIM İPUÇLARI

### En İyi Uygulamalar

1. **Spesifik Ol**: Promptta ne istediğini detaylı açıkla
2. **Context Ver**: Mevcut kod yapısını göster
3. **Örnek Göster**: Beklediğin output'u örnekle
4. **Sınırla**: Bir seferde tek bir görev iste
5. **Test İste**: Her zaman test kodu da iste

### Prompt Şablonu

```
GÖREV: [Kısa başlık]
DOSYA: [path/to/file]
AÇIKLAMA: [Detaylı açıklama]

GEREKSİNİMLER:
- [gereksinim 1]
- [gereksinim 2]

ÖRNEK KULLANIM:
[kod örneği]

ÇIKTI:
- [beklenen dosyalar]
- [beklenen özellikler]

Başlayalım.
```

---

## 📞 DESTEK

Bu promptlar Mutluet projesi için optimize edilmiştir.

**Proje Yapısı:**
- Backend: Express.js + TypeScript + Prisma + Supabase
- Frontend: React + Vite + TypeScript + Tailwind
- Database: PostgreSQL (Supabase)
- Deployment: Azure (Backend) + Vercel (Frontend)

**Dokümantasyon:**
- API Docs: `/docs/API_KEYS_REHBERI.md`
- Deployment: `/docs/VERCEL_DEPLOYMENT.md`

---

💡 **Not:** Bu promptları ihtiyacınıza göre customize edin!

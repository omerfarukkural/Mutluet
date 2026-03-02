# 🏗️ MUTLUET SİSTEM MİMARİSİ - KAPSAMLI REHBER

## 📋 İÇİNDEKİLER

1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Rol Tabanlı Erişim Sistemi](#rol-tabanlı-erişim-sistemi)
3. [Seviye ve Rozet Sistemi](#seviye-ve-rozet-sistemi)
4. [Veri Akış Diyagramları](#veri-akış-diyagramları)
5. [JetBrains Araçları](#jetbrains-araçları)
6. [Öğrenme Yol Haritası](#öğrenme-yol-haritası)

---

## 🎯 SİSTEM GENEL BAKIŞ

### Mimari Şeması (Katmanlar)

```
┌─────────────────────────────────────────────────────────────┐
│                    KULLANICI ARAYÜZÜ (Frontend)              │
│  React + TypeScript + TailwindCSS + Radix UI                │
│  http://localhost:5173                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS + WebSocket
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    API KATMANI (Backend)                     │
│  Express.js + TypeScript + Socket.IO                        │
│  http://localhost:3001                                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Routes  │  │ User Routes  │  │ Event Routes │     │
│  │ /api/auth/*  │  │ /api/users/* │  │ /api/events/*│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Donation     │  │ Matching     │  │ Chat         │     │
│  │ Routes       │  │ Routes       │  │ Routes       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Prisma ORM
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL)                         │
│  Port 5432                                                   │
│                                                              │
│  13 Tablolar:                                               │
│  • User (kullanıcılar)                                      │
│  • Donation (bağışlar)                                      │
│  • Event (etkinlikler)                                      │
│  • EventParticipant (katılımcılar)                          │
│  • Message (mesajlar)                                       │
│  • Match (eşleşmeler)                                       │
│  • Achievement (başarılar/rozetler)                         │
│  • UserAchievement (kullanıcı başarıları)                   │
│  • Challenge (görevler)                                     │
│  • UserChallenge (kullanıcı görevleri)                      │
│  • Organization (kuruluşlar)                                │
│  • UserRole (kullanıcı rolleri) - EKLENECEK                │
│  • ActivityLog (aktivite kayıtları) - EKLENECEK            │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 ROL TABANLI ERİŞİM SİSTEMİ

### Roller ve Hiyerarşi

```
                    ┌─────────────┐
                    │   ADMIN     │ (En Üst Yetki)
                    │  Sistem     │
                    │  Yöneticisi │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │                             │
      ┌─────▼──────┐              ┌─────▼──────┐
      │  MODERATOR │              │ EVENT_MGR  │
      │  Moderatör │              │ Etkinlik   │
      │  Yönetici  │              │ Yöneticisi │
      └─────┬──────┘              └─────┬──────┘
            │                           │
            └──────────┬────────────────┘
                       │
                ┌──────▼──────┐
                │  VOLUNTEER  │
                │  Gönüllü    │
                └──────┬──────┘
                       │
                ┌──────▼──────┐
                │    USER     │ (Temel Kullanıcı)
                │  Üye        │
                └─────────────┘
```

### Her Rolün Yetkileri

#### 1. USER (Temel Üye)
**Erişebileceği Sayfalar:**
- ✅ Ana Sayfa (Home)
- ✅ Kategoriler
- ✅ Etkinlikler (görüntüleme, katılma)
- ✅ Bağış Yapma
- ✅ Profil
- ✅ Eşleşme
- ✅ Sohbet
- ✅ Harita
- ✅ Oyunlar
- ❌ Admin Paneli
- ❌ Moderasyon Paneli
- ❌ Etkinlik Oluşturma

**Yapabilecekleri:**
- Kayıt ol / Giriş yap
- Profil düzenle
- Bağış yap
- Etkinliklere katıl
- Mesajlaşma
- Eşleşme
- Başarı kazanma
- Görev tamamlama

#### 2. VOLUNTEER (Gönüllü)
**USER + ek yetkiler:**
- ✅ Gönüllü Paneli (/volunteer)
- ✅ Gönüllülük saatlerini kaydet
- ✅ Gönüllü rozetleri
- ✅ Özel gönüllü görevleri
- ✅ Topluluk etkinliklerine öncelikli katılım

**Nasıl Kazanılır:**
- 10 saat gönüllülük yapınca OTOMATIK
- Veya 5 etkinliğe katılınca
- Veya admin tarafından manuel atama

#### 3. EVENT_MANAGER (Etkinlik Yöneticisi)
**VOLUNTEER + ek yetkiler:**
- ✅ Etkinlik Yönetim Paneli (/event-management)
- ✅ Etkinlik oluşturma
- ✅ Etkinlik düzenleme
- ✅ Katılımcı onaylama
- ✅ Fotoğraf yükleme
- ✅ Etkinlik raporu oluşturma
- ✅ Form doldurma

**Özel Formlar:**
1. **Etkinlik Oluşturma Formu:**
   - Başlık, Açıklama
   - Tarih, Saat, Konum
   - Kategori, Hedef Katılımcı
   - Fotoğraf (max 10)
   - Bütçe, Sponsor

2. **Etkinlik Sonrası Rapor Formu:**
   - Katılımcı sayısı
   - Harcama detayı
   - Fotoğraflar (etkinlik sırasında)
   - Geri bildirimler
   - Sonraki adımlar

**Nasıl Kazanılır:**
- 50 saat gönüllülük + 10 etkinliğe katılım
- Admin tarafından atama
- Başvuru formu doldur + onay

#### 4. MODERATOR (Moderatör)
**EVENT_MANAGER + ek yetkiler:**
- ✅ Moderasyon Paneli (/moderation)
- ✅ Kullanıcı yönetimi (ban, uyarı)
- ✅ İçerik moderasyonu
- ✅ Mesaj/yorum silme
- ✅ Kullanıcı şikayetlerini inceleme
- ✅ Raporları görüntüleme
- ❌ Sistem ayarları

**Nasıl Kazanılır:**
- Sadece admin atar
- Güvenilir ve deneyimli gönüllüler

#### 5. ADMIN (Sistem Yöneticisi)
**Tüm Yetkiler:**
- ✅ Admin Paneli (/admin) - TAM ERİŞİM
- ✅ Kullanıcı rolleri atama/değiştirme
- ✅ Sistem ayarları
- ✅ Database yönetimi
- ✅ Tüm istatistikler
- ✅ API key yönetimi
- ✅ Deployment yönetimi

---

## 🎖️ SEVİYE VE ROZET SİSTEMİ

### Seviye Sistemi (Gamification)

```
Level 1  ────► Level 2  ────► Level 3  ────► Level 4  ────► Level 5
  👤          ⭐           🌟           💎           👑
Yeni Üye    Aktif Üye    Deneyimli   Uzman      Efsane
(0-100 XP)  (100-500)    (500-1500)  (1500-5000) (5000+)
```

### XP (Deneyim Puanı) Kazanma

| Aktivite | XP Kazancı |
|----------|-----------|
| Kayıt ol | +50 XP |
| İlk bağış | +100 XP |
| Etkinliğe katıl | +50 XP/etkinlik |
| Gönüllülük (1 saat) | +20 XP/saat |
| Görev tamamla | +30 XP/görev |
| Başarı kazan | +100 XP |
| Mesaj gönder | +5 XP |
| Eşleşme | +25 XP |

### Rozetler (Achievements)

#### Başlangıç Rozetleri
```
🎁 İlk Bağış
   Koşul: İlk bağışını yap
   Ödül: +100 XP

⭐ Gönüllü Yıldız
   Koşul: 10 saat gönüllülük
   Ödül: +200 XP + VOLUNTEER rolü

🦋 Sosyal Kelebek
   Koşul: 5 etkinliğe katıl
   Ödül: +150 XP
```

#### İleri Seviye Rozetler
```
⏰ 100 Saat
   Koşul: 100 saat gönüllülük
   Ödül: +500 XP + Özel profil rozeti

💰 Cömert Gönül
   Koşul: 1000₺ toplam bağış
   Ödül: +300 XP + Özel renk

🏆 Etkinlik Ustası
   Koşul: 20 etkinliğe katıl
   Ödül: +400 XP + EVENT_MANAGER rolü için başvuru hakkı
```

### Otomatik Rol Yükseltme Sistemi

```javascript
// Pseudo-kod
async function checkRoleUpgrade(userId) {
  const user = await getUser(userId);
  const stats = user.stats;

  // VOLUNTEER kontrolü
  if (user.role === 'USER' &&
      (stats.volunteerHours >= 10 || stats.eventsAttended >= 5)) {
    await upgradeUserRole(userId, 'VOLUNTEER');
    await sendNotification(userId, {
      title: '🎉 Tebrikler!',
      message: 'Gönüllü seviyesine yükseldiniz!',
      unlocked: ['Gönüllü Paneli', 'Özel Görevler', 'Öncelikli Katılım']
    });
  }

  // EVENT_MANAGER kontrolü
  if (user.role === 'VOLUNTEER' &&
      stats.volunteerHours >= 50 &&
      stats.eventsAttended >= 10) {
    await createApplicationForm(userId, 'EVENT_MANAGER');
    await sendNotification(userId, {
      title: '🚀 Yeni Fırsat!',
      message: 'Etkinlik Yöneticisi olmaya hak kazandınız!',
      action: 'Başvur'
    });
  }
}
```

---

## 📊 VERİ AKIŞ DİYAGRAMLARI

### 1. Kullanıcı Kaydı ve Giriş

```
[Tarayıcı]
    │
    │ 1. Kayıt ol (email, şifre, isim)
    │
    ▼
[Frontend: Login Component]
    │
    │ 2. api.register() çağrısı
    │
    ▼
[API Client: src/lib/api.ts]
    │
    │ 3. POST /api/auth/register
    │    Body: { email, password, name }
    │
    ▼
[Backend: auth.ts route]
    │
    │ 4. Şifreyi hashle (bcrypt)
    │ 5. Database'e kaydet
    │
    ▼
[PostgreSQL Database]
    │
    │ User tablosuna INSERT
    │
    ▼
[Backend: auth.ts]
    │
    │ 6. JWT token oluştur
    │ 7. Response dön
    │
    ▼
[Frontend: API Client]
    │
    │ 8. Token'ı localStorage'a kaydet
    │ 9. User state'i güncelle
    │
    ▼
[Frontend: AuthContext]
    │
    │ 10. user state'i tüm app'e yayınla
    │
    ▼
[Ana Sayfa'ya yönlendir]
```

### 2. Etkinlik Oluşturma (Event Manager)

```
[EVENT_MANAGER Kullanıcı]
    │
    │ 1. /event-management sayfasına git
    │
    ▼
[Frontend: EventManagement Component]
    │
    │ 2. Formu doldur:
    │    • Başlık, Açıklama
    │    • Tarih, Saat, Konum
    │    • Kategori
    │    • Fotoğraflar
    │
    ▼
[Frontend: Validation]
    │
    │ 3. Form validasyonu
    │    • Zorunlu alanlar dolu mu?
    │    • Tarih geçerli mi?
    │    • Fotoğraf boyutu uygun mu?
    │
    ▼
[Frontend: File Upload]
    │
    │ 4. Fotoğrafları upload et
    │    • Cloudinary/S3'e yükle
    │    • URL'leri al
    │
    ▼
[API Client]
    │
    │ 5. POST /api/events
    │    Body: { title, description, date, images, ... }
    │
    ▼
[Backend: event.ts]
    │
    │ 6. Role kontrolü (EVENT_MANAGER mi?)
    │ 7. Event oluştur
    │
    ▼
[Database]
    │
    │ INSERT INTO Event
    │
    ▼
[Backend]
    │
    │ 8. Bildirim gönder:
    │    • Tüm kullanıcılara yeni etkinlik bildirimi
    │    • Email (opsiyonel)
    │    • Push notification (opsiyonel)
    │
    ▼
[Frontend]
    │
    │ 9. Başarı mesajı göster
    │ 10. /events sayfasına yönlendir
```

### 3. Rozet Kazanma (Otomatik)

```
[Kullanıcı Aksiyonu]
(Örnek: Bağış yap)
    │
    ▼
[Backend: donation.ts]
    │
    │ 1. Bağışı kaydet
    │ 2. User stats güncelle (totalDonations++)
    │
    ▼
[Achievement Check Middleware]
    │
    │ 3. Başarı kontrolü yap:
    │    • İlk bağış mı?
    │    • 1000₺ üstü mü?
    │    • Anonim mi?
    │
    ▼
[Achievement Service]
    │
    │ 4. Eğer koşul sağlanıyorsa:
    │    • UserAchievement oluştur
    │    • XP ekle
    │    • Seviye kontrol et
    │
    ▼
[Notification Service]
    │
    │ 5. Kullanıcıya bildirim:
    │    "🎉 Yeni rozet kazandınız!"
    │
    ▼
[WebSocket (Socket.IO)]
    │
    │ 6. Real-time bildirim gönder
    │
    ▼
[Frontend: Notification Toast]
    │
    │ 7. Ekranda göster:
    │    "🎁 İlk Bağış rozetini kazandınız!"
```

---

## 🛠️ JETBRAINS ARAÇLARI

### Mutluet Projesi İçin Gerekli JetBrains Ürünleri

#### 1. **WebStorm** (ÖNERİLEN - TEMEL)
**Ne İşe Yarar:**
- Frontend (React, TypeScript) geliştirme
- Backend (Node.js, Express) geliştirme
- Full-stack web projesi için PERFECT

**Özellikler:**
- TypeScript autocomplete
- React component refactoring
- Database tools (PostgreSQL)
- Git entegrasyonu
- Debug tools
- Terminal

**Fiyat:** Öğrenci ücretsiz (JetBrains Student Pack)

#### 2. **DataGrip** (OPSİYONEL - DATABASE)
**Ne İşe Yarar:**
- PostgreSQL database yönetimi
- SQL yazma ve test etme
- Database schema görselleştirme

**Alternatif:** Prisma Studio kullanabilirsin (ücretsiz, proje içinde)

#### 3. **Fleet** (YENİ - HAFIF EDİTÖR)
**Ne İşe Yarar:**
- Hızlı editör
- WebStorm'dan daha hafif
- Modern arayüz

**Ne Zaman Kullan:**
- Hızlı dosya düzenleme
- Hafif projeler

### JetBrains Öğrenci Paketi Nasıl Alınır?

1. https://www.jetbrains.com/community/education/#students
2. **"Apply Now"** tıkla
3. Üniversite email'ini kullan (.edu.tr)
4. Onay gelince tüm ürünler 1 yıl ücretsiz!

### WebStorm Kurulum ve Ayarlar

```bash
# WebStorm'u indir
# https://www.jetbrains.com/webstorm/download/

# Projeyi aç
# File > Open > ~/Mutluet seç

# Ayarlar (⌘,)
Preferences > Languages & Frameworks > TypeScript
  ✅ Enable TypeScript Service
  ✅ Recompile on changes

Preferences > Languages & Frameworks > Node.js
  ✅ Node interpreter: /opt/homebrew/bin/node

Preferences > Tools > Database
  ✅ PostgreSQL datasource ekle
  ✅ Host: localhost, Port: 5432, Database: mutluet
```

### Yararlı WebStorm Kısayolları

| Kısayol | İşlev |
|---------|-------|
| ⌘ + B | Tanıma git (Go to Definition) |
| ⌘ + P | Parametre bilgisi |
| ⌘ + Shift + F | Global arama |
| ⌘ + / | Satır yorum |
| ⌘ + Option + L | Kodu düzenle (format) |
| ⌘ + Shift + A | Komut palet |
| Ctrl + Space | Otomatik tamamlama |

---

## 📚 ÖĞRENME YOL HARİTASI

### Seviye 1: TEMEL KAVRAMLAR (1-2 Hafta)

#### Öğrenilecekler:
1. **Web Nasıl Çalışır?**
   - HTTP/HTTPS nedir?
   - Request/Response
   - Client-Server modeli

2. **Frontend Temelleri**
   - HTML: Sayfa yapısı
   - CSS: Stil
   - JavaScript: Dinamik davranış
   - React: Component yapısı

3. **Backend Temelleri**
   - Node.js nedir?
   - Express.js: API oluşturma
   - REST API kavramı

#### Kaynaklar:
- **Ücretsiz:** https://www.freecodecamp.org/learn
- **Video:** https://www.youtube.com/@fireship (5 dakikalık özetler)
- **Türkçe:** https://www.youtube.com/@AdemIlter

#### Pratik:
```javascript
// Basit bir API endpoint yaratma
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Merhaba Dünya!' });
});

// Frontend'den çağırma
fetch('/api/hello')
  .then(response => response.json())
  .then(data => console.log(data.message));
```

### Seviye 2: MUTLUET STACK'İNİ ANLAMA (2-3 Hafta)

#### Öğrenilecekler:
1. **TypeScript**
   - Type safety nedir?
   - Interface, Type
   - Generic'ler

2. **React Derinlemesine**
   - Hooks (useState, useEffect, useContext)
   - Component lifecycle
   - Props vs State

3. **Prisma ORM**
   - Schema tanımlama
   - Migration
   - CRUD işlemleri

4. **PostgreSQL**
   - İlişkisel database
   - SQL sorguları
   - Index, Foreign Key

#### Kaynaklar:
- **TypeScript:** https://www.typescriptlang.org/docs/
- **React:** https://react.dev/learn
- **Prisma:** https://www.prisma.io/docs

#### Pratik:
```typescript
// Mutluet'teki gerçek kodları incele
// 1. User modelini anla (backend/prisma/schema.prisma)
// 2. Auth context'i anla (src/contexts/AuthContext.tsx)
// 3. API client'i anla (src/lib/api.ts)
```

### Seviye 3: SİSTEM MİMARİSİNİ KAVRAMA (3-4 Hafta)

#### Öğrenilecekler:
1. **Authentication & Authorization**
   - JWT token nasıl çalışır?
   - Role-based access control
   - Middleware

2. **Database İlişkileri**
   - One-to-Many
   - Many-to-Many
   - Foreign Keys

3. **Real-time İletişim**
   - WebSocket
   - Socket.IO
   - Event-driven architecture

#### Pratik Proje:
```typescript
// Mutluet'e yeni bir özellik ekle
// Örnek: "Takip Et" butonu

// 1. Database schema (backend/prisma/schema.prisma)
model Follow {
  id         String   @id @default(uuid())
  followerId String
  followedId String
  follower   User     @relation("Follower", fields: [followerId], references: [id])
  followed   User     @relation("Followed", fields: [followedId], references: [id])
  createdAt  DateTime @default(now())

  @@unique([followerId, followedId])
}

// 2. API endpoint (backend/src/routes/user.ts)
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  await prisma.follow.create({
    data: {
      followerId: req.userId,
      followedId: userId
    }
  });
  res.json({ message: 'Takip ediliyor' });
});

// 3. Frontend button (src/app/components/profile.tsx)
const handleFollow = async () => {
  await api.followUser(userId);
  setIsFollowing(true);
};
```

---

## 🎮 EĞLENCELİ ÖĞRENME TEKNİKLERİ

### 1. YAPBOZ YÖNTEMİ 🧩

Her kod parçasını yapboz parçası gibi düşün:

```
┌─────────────────────────────────────────┐
│         TAM MUTLUET SİSTEMİ             │
├─────────────┬──────────┬────────────────┤
│  Frontend   │ Backend  │   Database     │
│   Parçası   │  Parçası │    Parçası     │
└─────────────┴──────────┴────────────────┘

Frontend Parçası daha da bölünür:
┌────────┬────────┬────────┬────────┐
│ Login  │ Home   │ Profile│ Admin  │
│Component│Component│Component│Component
└────────┴────────┴────────┴────────┘

Her component de parçalara ayrılır:
Login Component:
  ├── Form (input'lar)
  ├── Button (gönder butonu)
  ├── Validation (kontroller)
  └── API Call (backend'e istek)
```

**Pratik:**
1. Bir özelliği seç (örn: "Bağış Yap")
2. Hangi parçaları gerekiyor? Listele
3. Her parçayı sırayla tamamla
4. Birleştir!

### 2. LEGO YÖNTEMİ 🧱

Her fonksiyon bir Lego parçası:

```typescript
// Temel Lego parçaları (utility functions)
function validateEmail(email: string): boolean {
  return email.includes('@');
}

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Bu parçaları birleştirerek büyük yapı oluştur
async function registerUser(email: string, password: string) {
  if (!validateEmail(email)) {
    throw new Error('Geçersiz email');
  }

  const hashedPassword = hashPassword(password);

  return await createUserInDatabase(email, hashedPassword);
}
```

### 3. OYUN SEVİYELERİ 🎮

Kodlamayı oyun gibi düşün:

```
Level 1: Tutorial
  ✅ Hello World yaz
  ✅ Basit HTML sayfası
  ✅ CSS ile renk değiştir

Level 2: First Quest
  ✅ React component oluştur
  ✅ State kullan
  ✅ API'ye istek at

Level 3: Boss Fight
  ✅ Authentication sistemi kur
  ✅ Database bağla
  ✅ CRUD işlemleri yap

Level 4: Endgame
  ✅ Mutluet'e yeni özellik ekle
  ✅ Deploy et
  ✅ Production'da çalıştır
```

---

## 📈 TAKİP SİSTEMLERİ

### 1. GitHub Issues (Proje Yönetimi)

```bash
# Yeni issue oluştur
gh issue create --title "Rozet sistemi ekle" --body "XP ve seviye sistemi için rozet eklenmeli"

# Issue'ya label ekle
gh issue edit 1 --add-label "enhancement,good first issue"

# Issue kapat
gh issue close 1
```

### 2. Notion (Dokümantasyon)

**Notion Template:**
```
📁 Mutluet Projesi
  ├── 📄 Öğrenme Notları
  │   ├── TypeScript Notları
  │   ├── React Hooks
  │   └── Prisma Kullanımı
  ├── 📋 Yapılacaklar (Kanban)
  │   ├── Todo
  │   ├── In Progress
  │   └── Done
  ├── 🐛 Bug Tracker
  └── 💡 Fikir Deposu
```

### 3. Trello (Kanban Board)

**Kartlar:**
```
[Backlog]           [To Do]         [In Progress]    [Done]
• Rozet sistemi    • Admin paneli   • Login sayfası  ✅ Database kurulum
• Email servisi    • Role sistemi                    ✅ Frontend setup
• Push notif.                                        ✅ Backend API
```

---

## 🔑 ANAHTAR KAVRAMLAR

### 1. Dependency Injection (Bağımlılık Enjeksiyonu)

**Ne demek?**
Bir fonksiyon/class'ın ihtiyaç duyduğu şeyleri dışarıdan almak.

```typescript
// KÖTÜ: Sıkı bağımlılık
class UserService {
  private db = new PostgresDatabase(); // ❌ Doğrudan bağımlı

  async getUser(id: string) {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// İYİ: Bağımlılık enjeksiyonu
class UserService {
  constructor(private db: Database) {} // ✅ Dışarıdan alıyor

  async getUser(id: string) {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Kullanım
const postgresDb = new PostgresDatabase();
const userService = new UserService(postgresDb);
```

**Neden önemli?**
- Test edilebilir
- Değiştirilebilir (Postgres → MySQL)
- Esnek

### 2. Middleware (Ara Yazılım)

**Ne demek?**
İstek ile cevap arasında çalışan fonksiyonlar.

```typescript
// Mutluet'teki authMiddleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Token'ı al
  const token = req.headers.authorization?.split(' ')[1];

  // 2. Token yok mu? → Hata ver
  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  // 3. Token geçerli mi? → Kontrol et
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    // 4. Devam et (next route handler'a geç)
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Kullanım
app.get('/api/profile', authMiddleware, async (req, res) => {
  // Buraya geldiğinde user authenticated
  const user = await getUser(req.userId);
  res.json(user);
});
```

**Analoji:**
Middleware = Havalimanı güvenlik kontrolü
- Pasaport kontrolü (authentication)
- Bagaj tarama (validation)
- Sadece geçerliler uçağa biner (next())

### 3. State Management (Durum Yönetimi)

**Ne demek?**
Uygulamanın verilerini yönetmek.

```typescript
// Mutluet'teki AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // State: Tüm app'in bildiği kullanıcı bilgisi
  const [user, setUser] = useState<User | null>(null);

  // Action: Giriş yap
  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user); // State güncelle
  };

  // Action: Çıkış yap
  const logout = () => {
    setUser(null); // State temizle
    api.clearToken();
  };

  // Tüm app'e yayınla
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Herhangi bir component'te kullan
function Profile() {
  const { user } = useAuth(); // Context'ten al
  return <div>Merhaba {user?.name}!</div>;
}
```

**Analoji:**
State Management = TV kumandası
- State = TV'nin şu anki durumu (hangi kanal, ses seviyesi)
- Actions = Butonlar (kanal değiştir, ses arttır)
- Context = Kumanda sinyali (tüm eve yayılır)

---

## 🎯 SONUÇ VE SONRAKİ ADIMLAR

Bu dokümanda öğrendikleriniz:
- ✅ Sistem mimarisi
- ✅ Rol tabanlı erişim
- ✅ Seviye ve rozet sistemi
- ✅ Veri akış diyagramları
- ✅ JetBrains araçları
- ✅ Öğrenme yol haritası

**Sonraki Adımlar:**
1. Bu dokümandaki kavramları not al
2. WebStorm'u kur ve projeyi aç
3. Her gün bir küçük özellik ekle
4. Sorular çıktıkça Google'la ve dene!

**Hatırla:**
> "En iyi öğrenme yöntemi yapmaktır!" 🚀

---

**Devam dosyaları:**
- `ROL_SİSTEMİ_DETAY.md` - Rol sisteminin teknik implementasyonu
- `ROZET_SİSTEMİ_DETAY.md` - Rozet ve seviye sisteminin kodu
- `API_DOKÜMANTASYONU.md` - Tüm API endpoint'lerinin detaylı açıklaması

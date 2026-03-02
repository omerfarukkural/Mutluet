# 🎭 ROL SİSTEMİ - TEKNİK İMPLEMENTASYON

## 📋 İÇİNDEKİLER

1. [Database Schema Güncellemeleri](#database-schema)
2. [Backend API Endpoints](#backend-api)
3. [Frontend Components](#frontend-components)
4. [Rol Kontrolü Middleware](#rol-kontrolü)
5. [Otomatik Yükseltme Sistemi](#otomatik-yükseltme)
6. [Etkinlik Yöneticisi Paneli](#etkinlik-yöneticisi)

---

## 🗄️ DATABASE SCHEMA

### 1. User Tablosuna Yeni Alanlar

```prisma
// backend/prisma/schema.prisma

model User {
  id                String          @id @default(uuid())
  email             String          @unique
  name              String
  password          String?
  role              UserRole        @default(USER)
  level             Int             @default(1)        // YENİ: Seviye
  xp                Int             @default(0)        // YENİ: Deneyim puanı
  authProvider      AuthProvider    @default(EMAIL)

  // İstatistikler
  totalDonations    Float           @default(0)
  volunteerHours    Int             @default(0)
  eventsAttended    Int             @default(0)
  engagementScore   Int             @default(0)

  // Profil
  bio               String?
  avatar            String?
  location          String?
  phone             String?
  interests         String[]

  // Yeni: Rol geçmişi
  roleHistory       RoleChange[]                       // YENİ

  // İlişkiler
  donations         Donation[]
  eventParticipations EventParticipant[]
  sentMessages      Message[]        @relation("SentMessages")
  receivedMessages  Message[]        @relation("ReceivedMessages")
  matchesAsUser1    Match[]          @relation("MatchUser1")
  matchesAsUser2    Match[]          @relation("MatchUser2")
  achievements      UserAchievement[]
  challenges        UserChallenge[]
  managedEvents     Event[]          @relation("EventManager")  // YENİ
  activityLogs      ActivityLog[]                      // YENİ

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
}

// YENİ: Roller enum
enum UserRole {
  USER          // Temel kullanıcı
  VOLUNTEER     // Gönüllü
  EVENT_MANAGER // Etkinlik yöneticisi
  MODERATOR     // Moderatör
  ADMIN         // Sistem yöneticisi
}

// YENİ: Rol değişiklik geçmişi
model RoleChange {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  fromRole    UserRole
  toRole      UserRole
  reason      String   // "Automatic upgrade", "Admin assignment", "Application approved"
  changedBy   String?  // Admin ID (eğer manuel ise)
  createdAt   DateTime @default(now())
}

// YENİ: Aktivite logları
model ActivityLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String   // "login", "donation", "event_join", "achievement_unlock"
  details     Json?    // Ekstra bilgiler
  xpGained    Int      @default(0)
  createdAt   DateTime @default(now())
}

// Event tablosunu güncelle
model Event {
  id                  String              @id @default(uuid())
  title               String
  description         String
  category            EventCategory
  date                DateTime
  time                String
  location            String
  images              String[]           // YENİ: Çoklu fotoğraf
  currentParticipants Int                @default(0)
  maxParticipants     Int?

  // YENİ: Etkinlik yöneticisi
  managerId           String?
  manager             User?              @relation("EventManager", fields: [managerId], references: [id])

  // YENİ: Etkinlik durumu
  status              EventStatus        @default(DRAFT)

  // YENİ: Etkinlik raporu
  report              EventReport?

  participants        EventParticipant[]
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
}

enum EventStatus {
  DRAFT       // Taslak (henüz yayınlanmadı)
  PUBLISHED   // Yayınlandı
  ONGOING     // Devam ediyor
  COMPLETED   // Tamamlandı
  CANCELLED   // İptal edildi
}

// YENİ: Etkinlik raporu
model EventReport {
  id                String   @id @default(uuid())
  eventId           String   @unique
  event             Event    @relation(fields: [eventId], references: [id])

  actualParticipants Int
  totalExpense      Float
  feedback          String?
  images            String[] // Etkinlik sırasında çekilen fotoğraflar
  nextSteps         String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### 2. Migration Çalıştırma

```bash
cd ~/Mutluet/backend

# Schema'yı kaydet ve migration oluştur
npx prisma migrate dev --name add_role_system

# Veya direkt push (development için)
npx prisma db push
```

---

## 🔌 BACKEND API ENDPOINTS

### 1. Rol Yönetimi Routes

```typescript
// backend/src/routes/role.ts

import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// Kullanıcının rolünü güncelle (ADMIN only)
router.patch('/users/:userId/role',
  authMiddleware,
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { newRole, reason } = req.body;

      // Mevcut kullanıcıyı al
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Rol değişikliğini kaydet
      await prisma.$transaction([
        // Kullanıcı rolünü güncelle
        prisma.user.update({
          where: { id: userId },
          data: { role: newRole }
        }),

        // Geçmişe kaydet
        prisma.roleChange.create({
          data: {
            userId,
            fromRole: user.role,
            toRole: newRole,
            reason,
            changedBy: req.userId
          }
        }),

        // Aktivite log'u
        prisma.activityLog.create({
          data: {
            userId,
            action: 'role_changed',
            details: {
              from: user.role,
              to: newRole,
              by: req.userId
            }
          }
        })
      ]);

      res.json({
        message: 'Rol başarıyla güncellendi',
        newRole
      });
    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({ error: 'Rol güncellenemedi' });
    }
});

// Rol geçmişini getir
router.get('/users/:userId/role-history',
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Sadece admin veya kendi geçmişini görebilir
      const currentUser = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });

      if (currentUser?.role !== 'ADMIN' && userId !== req.userId) {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }

      const history = await prisma.roleChange.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      res.json(history);
    } catch (error) {
      console.error('Role history error:', error);
      res.status(500).json({ error: 'Geçmiş alınamadı' });
    }
});

// Otomatik rol yükseltme kontrolü (cron job veya her aktivitede)
router.post('/check-auto-upgrade',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          volunteerHours: true,
          eventsAttended: true,
          totalDonations: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      let upgraded = false;
      let newRole = user.role;
      let unlocked: string[] = [];

      // USER → VOLUNTEER kontrolü
      if (user.role === 'USER' &&
          (user.volunteerHours >= 10 || user.eventsAttended >= 5)) {
        newRole = 'VOLUNTEER';
        upgraded = true;
        unlocked = [
          'Gönüllü Paneli',
          'Özel Gönüllü Görevleri',
          'Öncelikli Etkinlik Katılımı',
          'Gönüllü Rozetleri'
        ];
      }

      // VOLUNTEER → EVENT_MANAGER kontrolü (başvuru hakkı)
      if (user.role === 'VOLUNTEER' &&
          user.volunteerHours >= 50 &&
          user.eventsAttended >= 10) {
        // Başvuru formu oluştur (henüz otomatik yükseltme yok)
        return res.json({
          canApply: true,
          role: 'EVENT_MANAGER',
          message: 'Etkinlik Yöneticisi olmaya hak kazandınız! Başvurunuzu yapabilirsiniz.'
        });
      }

      if (upgraded) {
        // Rol değişikliğini kaydet
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: {
              role: newRole,
              xp: { increment: 200 } // Bonus XP
            }
          }),

          prisma.roleChange.create({
            data: {
              userId,
              fromRole: user.role,
              toRole: newRole,
              reason: 'Automatic upgrade based on activity'
            }
          })
        ]);

        res.json({
          upgraded: true,
          newRole,
          unlocked,
          message: `Tebrikler! ${newRole} seviyesine yükseldiniz!`
        });
      } else {
        res.json({
          upgraded: false,
          currentRole: user.role,
          message: 'Henüz yükseltme koşulları sağlanmadı'
        });
      }
    } catch (error) {
      console.error('Auto upgrade error:', error);
      res.status(500).json({ error: 'Kontrol yapılamadı' });
    }
});

export default router;
```

### 2. Middleware: Rol Kontrolü

```typescript
// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Mevcut auth middleware
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

// YENİ: Rol gerektiren middleware
export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: 'Bu işlem için yetkiniz yok',
          required: allowedRoles,
          current: user.role
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Rol kontrolü başarısız' });
    }
  };
};

// YENİ: Minimum rol gerektiren middleware
export const requireMinRole = (minRole: string) => {
  const roleHierarchy: Record<string, number> = {
    'USER': 1,
    'VOLUNTEER': 2,
    'EVENT_MANAGER': 3,
    'MODERATOR': 4,
    'ADMIN': 5
  };

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      const userLevel = roleHierarchy[user.role] || 0;
      const requiredLevel = roleHierarchy[minRole] || 999;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Yetersiz yetki seviyesi',
          required: minRole,
          current: user.role
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      console.error('Min role check error:', error);
      return res.status(500).json({ error: 'Yetki kontrolü başarısız' });
    }
  };
};
```

### 3. Event Management Routes

```typescript
// backend/src/routes/event-management.ts

import { Router } from 'express';
import { authMiddleware, requireMinRole } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// Etkinlik oluştur (EVENT_MANAGER veya üstü)
router.post('/',
  authMiddleware,
  requireMinRole('EVENT_MANAGER'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        date,
        time,
        location,
        images,
        maxParticipants
      } = req.body;

      const event = await prisma.event.create({
        data: {
          title,
          description,
          category,
          date: new Date(date),
          time,
          location,
          images: images || [],
          maxParticipants,
          managerId: req.userId,
          status: 'DRAFT' // Başta taslak
        }
      });

      // Aktivite log'u
      await prisma.activityLog.create({
        data: {
          userId: req.userId!,
          action: 'event_created',
          details: {
            eventId: event.id,
            title: event.title
          },
          xpGained: 50
        }
      });

      // XP ekle
      await prisma.user.update({
        where: { id: req.userId },
        data: {
          xp: { increment: 50 },
          engagementScore: { increment: 10 }
        }
      });

      res.json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Etkinlik oluşturulamadı' });
    }
});

// Etkinliği yayınla (DRAFT → PUBLISHED)
router.patch('/:eventId/publish',
  authMiddleware,
  requireMinRole('EVENT_MANAGER'),
  async (req, res) => {
    try {
      const { eventId } = req.params;

      // Etkinlik sahibi mi kontrol et
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { managerId: true, status: true }
      });

      if (!event) {
        return res.status(404).json({ error: 'Etkinlik bulunamadı' });
      }

      if (event.managerId !== req.userId && req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Bu etkinliği yayınlayamazsınız' });
      }

      if (event.status !== 'DRAFT') {
        return res.status(400).json({ error: 'Sadece taslak etkinlikler yayınlanabilir' });
      }

      const updated = await prisma.event.update({
        where: { id: eventId },
        data: { status: 'PUBLISHED' }
      });

      res.json(updated);
    } catch (error) {
      console.error('Publish event error:', error);
      res.status(500).json({ error: 'Etkinlik yayınlanamadı' });
    }
});

// Etkinlik raporu oluştur
router.post('/:eventId/report',
  authMiddleware,
  requireMinRole('EVENT_MANAGER'),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const {
        actualParticipants,
        totalExpense,
        feedback,
        images,
        nextSteps
      } = req.body;

      // Etkinlik sahibi mi kontrol et
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { managerId: true, status: true }
      });

      if (!event) {
        return res.status(404).json({ error: 'Etkinlik bulunamadı' });
      }

      if (event.managerId !== req.userId && req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Bu etkinlik için rapor oluşturamazsınız' });
      }

      const report = await prisma.eventReport.create({
        data: {
          eventId,
          actualParticipants,
          totalExpense,
          feedback,
          images: images || [],
          nextSteps
        }
      });

      // Etkinlik durumunu güncelle
      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'COMPLETED' }
      });

      // XP ekle
      await prisma.user.update({
        where: { id: req.userId },
        data: {
          xp: { increment: 100 },
          engagementScore: { increment: 20 }
        }
      });

      res.json(report);
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ error: 'Rapor oluşturulamadı' });
    }
});

// Yönettiği etkinlikleri getir
router.get('/my-events',
  authMiddleware,
  requireMinRole('EVENT_MANAGER'),
  async (req, res) => {
    try {
      const events = await prisma.event.findMany({
        where: { managerId: req.userId },
        include: {
          participants: true,
          report: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(events);
    } catch (error) {
      console.error('Get managed events error:', error);
      res.status(500).json({ error: 'Etkinlikler alınamadı' });
    }
});

export default router;
```

### 4. Index.ts'yi Güncelle

```typescript
// backend/src/index.ts

import roleRoutes from './routes/role.js';
import eventManagementRoutes from './routes/event-management.js';

// ... mevcut kodlar ...

app.use('/api/roles', roleRoutes);
app.use('/api/event-management', eventManagementRoutes);
```

---

## 🎨 FRONTEND COMPONENTS

### 1. Event Manager Dashboard

```tsx
// src/app/components/event-manager-dashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { Calendar, Plus, Image, FileText, CheckCircle } from "lucide-react";

export function EventManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rol kontrolü
    if (!user || !['EVENT_MANAGER', 'MODERATOR', 'ADMIN'].includes(user.role)) {
      navigate('/home');
      return;
    }

    loadMyEvents();
  }, [user, navigate]);

  const loadMyEvents = async () => {
    try {
      const events = await api.getMyManagedEvents();
      setMyEvents(events);
    } catch (error) {
      console.error('Load events error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h1 className="text-2xl font-bold">Etkinlik Yönetimi</h1>
        <p className="text-purple-100">Hoş geldin, {user?.name}</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/event-management/create')}
          className="bg-white p-4 rounded-xl shadow-sm border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors"
        >
          <Plus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Yeni Etkinlik</p>
        </button>

        <button
          onClick={() => navigate('/event-management/drafts')}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Taslaklar</p>
        </button>
      </div>

      {/* My Events */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Etkinliklerim
        </h2>

        {myEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Henüz etkinlik oluşturmadınız</p>
            <button
              onClick={() => navigate('/event-management/create')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              İlk Etkinliğini Oluştur
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event: any) => (
              <div
                key={event.id}
                className="bg-white rounded-xl p-4 shadow-sm"
                onClick={() => navigate(`/event-management/${event.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                    event.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                    event.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {event.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📅 {new Date(event.date).toLocaleDateString('tr-TR')}</span>
                  <span>👥 {event.currentParticipants} katılımcı</span>
                  {event.images?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {event.images.length}
                    </span>
                  )}
                </div>

                {event.status === 'COMPLETED' && event.report && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Rapor tamamlandı</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Create Event Form

```tsx
// src/app/components/create-event-form.tsx

import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../lib/api";
import { Upload, X, Plus } from "lucide-react";

export function CreateEventForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'EGITIM',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
  });
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const event = await api.createEvent({
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        images
      });

      // Başarı bildirimi
      alert('Etkinlik başarıyla oluşturuldu!');
      navigate(`/event-management/${event.id}`);
    } catch (error) {
      console.error('Create event error:', error);
      alert('Etkinlik oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Gerçek production'da Cloudinary/S3'e yüklenecek
    // Şimdilik base64'e çevirelim (demo için)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold">Yeni Etkinlik Oluştur</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Başlık */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etkinlik Başlığı *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Örn: Kitap Bağışı Kampanyası"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Etkinlik hakkında detaylı bilgi..."
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="EGITIM">Eğitim</option>
            <option value="SAGLIK">Sağlık</option>
            <option value="GIDA">Gıda Yardımı</option>
            <option value="BARINAK">Barınma</option>
            <option value="ACIL">Acil Yardım</option>
            <option value="DIGER">Diğer</option>
          </select>
        </div>

        {/* Tarih ve Saat */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saat *
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Konum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konum *
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Örn: Merkez Kütüphane, İstanbul"
          />
        </div>

        {/* Max Katılımcı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maksimum Katılımcı (Opsiyonel)
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Sınırsız için boş bırak"
          />
        </div>

        {/* Fotoğraf Yükleme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotoğraflar (Max 10)
          </label>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square">
                <img
                  src={img}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 10 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-2">Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/event-management')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Oluşturuluyor...' : 'Taslak Olarak Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🎯 SONUÇ

Bu dokümanda implementasyonu yapılanlar:
- ✅ Database schema güncellemeleri
- ✅ Rol yönetimi API'leri
- ✅ Middleware (rol kontrolü)
- ✅ Otomatik yükseltme sistemi
- ✅ Event Manager paneli (frontend + backend)
- ✅ Etkinlik oluşturma formu
- ✅ Fotoğraf yükleme

**Sonraki Adımlar:**
1. Migration'ları çalıştır
2. Route'ları backend'e ekle
3. Frontend component'leri ekle
4. Test et!

**İlgili Dosyalar:**
- `ROZET_SİSTEMİ_DETAY.md` - Rozet ve XP sistemi
- `API_DÖKÜMAN Human: import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import type { User, Event, Donation } from "../../types";
import {
  Users,
  Calendar,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalEvents: 0,
    activeUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== "ADMIN") {
      navigate("/home");
      return;
    }

    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data
      const [usersData, eventsData, donationsData] = await Promise.all([
        api.getAllUsers(),
        api.getAllEvents(),
        api.getAllDonations(),
      ]);

      setUsers(usersData);
      setEvents(eventsData);
      setDonations(donationsData);

      // Calculate stats
      const totalDonationAmount = donationsData.reduce(
        (sum, d) => sum + d.amount,
        0
      );
      const activeUsersCount = usersData.filter(
        (u) => u.engagementScore > 0
      ).length;

      setStats({
        totalUsers: usersData.length,
        totalDonations: totalDonationAmount,
        totalEvents: eventsData.length,
        activeUsers: activeUsersCount,
      });
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Veri yüklenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-indigo-100">Hoş geldin, {user.name}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Hata</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aktif Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeUsers}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Bağış</p>
              <p className="text-2xl font-bold text-gray-900">
                ₺{stats.totalDonations.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Etkinlik</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEvents}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Son Kayıtlar
          </h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {users.slice(0, 5).map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    u.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {u.role}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {u.engagementScore} puan
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Yaklaşan Etkinlikler
          </h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Henüz etkinlik yok</p>
              <p className="text-sm">
                Prisma Studio'dan etkinlik ekleyebilirsin
              </p>
            </div>
          ) : (
            events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        📅 {new Date(event.date).toLocaleDateString("tr-TR")}
                      </span>
                      <span className="text-xs text-gray-500">
                        👥 {event.currentParticipants} katılımcı
                      </span>
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      event.category === "EGITIM"
                        ? "bg-blue-100 text-blue-700"
                        : event.category === "SAGLIK"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {event.category}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Donations */}
      <div className="mx-4 mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Son Bağışlar</h2>
          <Heart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {donations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Henüz bağış yok</p>
            </div>
          ) : (
            donations.slice(0, 5).map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {donation.type === "MONETARY" ? "Para" : "Ayni"} Bağış
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ₺{donation.amount.toLocaleString("tr-TR")}
                  </p>
                  {donation.isAnonymous && (
                    <p className="text-xs text-gray-400">Anonim</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mt-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.open("http://localhost:5555", "_blank")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Prisma Studio</p>
            <p className="text-xs text-gray-500 mt-1">
              Database'i yönet
            </p>
          </button>

          <button
            onClick={() => navigate("/home")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">
              Kullanıcı Görünümü
            </p>
            <p className="text-xs text-gray-500 mt-1">Normal kullanıcı gibi gör</p>
          </button>

          <button
            onClick={loadAdminData}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Verileri Yenile</p>
            <p className="text-xs text-gray-500 mt-1">İstatistikleri güncelle</p>
          </button>

          <button
            onClick={() => window.open("http://localhost:3001/health", "_blank")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Backend Status</p>
            <p className="text-xs text-gray-500 mt-1">API durumunu kontrol et</p>
          </button>
        </div>
      </div>
    </div>
  );
} hata açıklanıyor hataların açıklanarak ve kod bloğundaki tüm kodlar vs bakılarak hangisi nerede ve nasıl kullanılıyor vs herşey mutlaka düzeltilmeli ve bir daha bu hata olmamalı ve yayında bu hatalar olursa farketmeden kullanıcılar yarın bir gün görmemesi gerekir
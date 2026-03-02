# Mutluet Backend

## Setup

### 1. PostgreSQL Kurulumu

```bash
# macOS - Homebrew ile
brew install postgresql@16
brew services start postgresql@16

# Database oluştur
psql postgres
CREATE DATABASE mutluet;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE mutluet TO postgres;
\q
```

### 2. Backend Kurulumu

```bash
cd ~/Mutluet/backend
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

## API Endpoints

### Health Check
```bash
GET http://localhost:3001/health
```

### Authentication

**Register**
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Login**
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Social Auth**
```bash
POST http://localhost:3001/api/auth/social/google
Content-Type: application/json

{
  "token": "google-oauth-token",
  "email": "user@gmail.com",
  "name": "User Name",
  "avatar": "https://avatar-url.jpg",
  "providerId": "google-user-id"
}
```

**Magic Link**
```bash
POST http://localhost:3001/api/auth/magic-link
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### User

**Get Current User**
```bash
GET http://localhost:3001/api/users/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Update Profile**
```bash
PATCH http://localhost:3001/api/users/me
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "My bio",
  "location": "İstanbul, Kadıköy",
  "interests": ["eğitim", "sosyal"]
}
```

**Get Stats**
```bash
GET http://localhost:3001/api/users/me/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

### Donations

**Get My Donations**
```bash
GET http://localhost:3001/api/donations/my-donations
Authorization: Bearer YOUR_JWT_TOKEN
```

**Create Donation**
```bash
POST http://localhost:3001/api/donations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 100,
  "type": "EGITIM",
  "description": "Eğitim fonu bağışı"
}
```

### Events

**Get All Events**
```bash
GET http://localhost:3001/api/events
```

**Get Upcoming Events**
```bash
GET http://localhost:3001/api/events/upcoming
```

**Join Event**
```bash
POST http://localhost:3001/api/events/:eventId/join
Authorization: Bearer YOUR_JWT_TOKEN
```

### Matching

**Get Potential Matches**
```bash
GET http://localhost:3001/api/matching/potential
Authorization: Bearer YOUR_JWT_TOKEN
```

**Create Match**
```bash
POST http://localhost:3001/api/matching/:userId/match
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "compatibilityScore": 85
}
```

### Chat

**Get Conversations**
```bash
GET http://localhost:3001/api/chat/conversations
Authorization: Bearer YOUR_JWT_TOKEN
```

**Get Messages**
```bash
GET http://localhost:3001/api/chat/messages/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Send Message**
```bash
POST http://localhost:3001/api/chat/messages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "receiverId": "user-uuid",
  "content": "Merhaba!"
}
```

### Organizations

**Get All Organizations**
```bash
GET http://localhost:3001/api/organizations
```

**Get Nearby Organizations**
```bash
GET http://localhost:3001/api/organizations/nearby?lat=41.0082&lng=28.9784&radius=10
```

# 🤝 Mutluet

**Mutluet** - NGO platform for volunteers, donations, events, and social connections

A comprehensive social impact platform connecting volunteers, donors, and organizations to create positive change in communities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Node](https://img.shields.io/badge/Node-22+-green)

## 🌟 Features

### 🎯 Core Features
- **User Authentication** - Email/password, Google, Facebook, TikTok OAuth, Magic Link
- **Volunteer Management** - Track hours, join events, earn achievements
- **Donation System** - Secure donations with Stripe integration
- **Event Discovery** - Browse and join upcoming charity events
- **Social Matching** - Connect with like-minded volunteers based on interests
- **Real-time Chat** - Socket.IO powered messaging system
- **Video Calls** - Azure Communication Services integration
- **Organization Directory** - Find nearby NGOs and support centers
- **Gamification** - Achievements, challenges, and leaderboards

### 🎨 Design
- Mobile-first responsive design
- Figma-based UI/UX implementation
- Dark/light mode support
- Accessible components (Radix UI + Material-UI)

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL 16
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/omerfarukkural/Mutluet.git
cd Mutluet

# Run automatic setup
./QUICK_START.sh
```

Or manually:

```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Create database
psql postgres -c "CREATE DATABASE mutluet;"

# Backend setup
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev

# Frontend setup (new terminal)
cd ..
pnpm install
pnpm dev
```

### Access
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Prisma Studio:** http://localhost:5555 (run `pnpm prisma:studio`)

## 📁 Project Structure

```
Mutluet/
├── backend/                # Express + TypeScript + Prisma
│   ├── prisma/            # Database schema & migrations
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic (Socket.IO)
│   │   ├── middleware/    # Auth & validation
│   │   └── config/        # Database & config
│   └── .env              # Environment variables
├── src/                   # React + TypeScript frontend
│   ├── app/
│   │   └── components/   # UI components & pages
│   ├── contexts/         # React contexts (Auth)
│   ├── lib/              # API client
│   └── types/            # TypeScript types
└── docs/                 # Documentation
```

## 🔧 Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.IO
- **Auth:** JWT + OAuth 2.0
- **Payments:** Stripe
- **Video:** Azure Communication Services

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **UI Components:** Radix UI + Material-UI
- **Routing:** React Router v7
- **State:** React Context API
- **Icons:** Lucide React

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/register      # Register new user
POST /api/auth/login         # Login with credentials
POST /api/auth/social/:provider  # OAuth login
POST /api/auth/magic-link    # Request magic link
```

### Users
```bash
GET  /api/users/me           # Get current user
PATCH /api/users/me          # Update profile
GET  /api/users/me/stats     # Get user statistics
```

### Donations
```bash
GET  /api/donations/my-donations  # List user donations
POST /api/donations               # Create donation
```

### Events
```bash
GET  /api/events                  # List all events
GET  /api/events/upcoming         # Upcoming events
POST /api/events/:id/join         # Join event
```

### Matching
```bash
GET  /api/matching/potential      # Get potential matches
POST /api/matching/:userId/match  # Create match
```

### Chat
```bash
GET  /api/chat/conversations      # List conversations
GET  /api/chat/messages/:userId   # Get messages
POST /api/chat/messages           # Send message
```

### Organizations
```bash
GET  /api/organizations           # List organizations
GET  /api/organizations/nearby    # Find nearby orgs
```

Full API documentation: [backend/README.md](backend/README.md)

## 🌍 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mutluet
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
STRIPE_SECRET_KEY=your-stripe-key
AZURE_COMMUNICATION_CONNECTION_STRING=your-azure-connection
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
pnpm test

# E2E tests
pnpm test:e2e
```

## 📦 Deployment

### Backend (Azure App Service)
```bash
cd backend
pnpm build
# Deploy to Azure
```

### Frontend (Azure Static Web Apps / Vercel / Netlify)
```bash
pnpm build
# Deploy dist/ folder
```

### Database (Azure SQL / Supabase)
```bash
# Update DATABASE_URL in production .env
pnpm prisma:migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Ömer Faruk Kural** - [@omerfarukkural](https://github.com/omerfarukkural)

## 🙏 Acknowledgments

- Design inspiration from Figma community
- UI components from Radix UI and Material-UI
- Real-time features powered by Socket.IO
- Video calls via Azure Communication Services

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/omerfarukkural/Mutluet/issues)
- **Website:** [bitebimuv.org](https://bitebimuv.org)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Made with ❤️ for social good

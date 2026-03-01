import {
  Heart,
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  Bell,
  Sparkles,
  Trophy,
  MessageCircle,
  Zap,
  Target,
  Award,
} from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";

const quickStats = [
  { label: "Bağışlar", value: "₺2,450", icon: Heart, color: "text-red-600" },
  { label: "Gönüllülük", value: "48 saat", icon: Users, color: "text-blue-600" },
  { label: "Etkinlikler", value: "12", icon: Calendar, color: "text-green-600" },
  { label: "Etkileşim", value: "856", icon: TrendingUp, color: "text-purple-600" },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Kitap Bağışı Kampanyası",
    date: "3 Mart 2026",
    time: "14:00",
    location: "Merkez Kütüphane",
    participants: 24,
    category: "Eğitim",
  },
  {
    id: 2,
    title: "Doğa Yürüyüşü",
    date: "5 Mart 2026",
    time: "09:00",
    location: "Kent Ormanı",
    participants: 15,
    category: "Sosyal",
  },
  {
    id: 3,
    title: "Çocuk Atölyesi",
    date: "7 Mart 2026",
    time: "15:00",
    location: "Toplum Merkezi",
    participants: 32,
    category: "Eğitim",
  },
];

const liveActivities = [
  {
    id: 1,
    type: "donation",
    user: "Ayşe D.",
    action: "100₺ bağış yaptı",
    time: "2 dk önce",
    icon: Heart,
  },
  {
    id: 2,
    type: "volunteer",
    user: "Mehmet K.",
    action: "Eğitim etkinliğine katıldı",
    time: "15 dk önce",
    icon: Users,
  },
  {
    id: 3,
    type: "achievement",
    user: "Zeynep A.",
    action: "100 saat gönüllülük rozetini kazandı",
    time: "1 saat önce",
    icon: Trophy,
  },
];

const achievements = [
  { id: 1, name: "İlk Bağış", icon: "🎁", unlocked: true },
  { id: 2, name: "Gönüllü Yıldız", icon: "⭐", unlocked: true },
  { id: 3, name: "Sosyal Kelebek", icon: "🦋", unlocked: true },
  { id: 4, name: "100 Saat", icon: "⏰", unlocked: false },
];

const challenges = [
  {
    id: 1,
    title: "Haftalık Hedef",
    description: "5 etkinliğe katıl",
    progress: 3,
    total: 5,
    reward: "50 puan",
  },
  {
    id: 2,
    title: "Bağış Kahramanı",
    description: "500₺ bağış yap",
    progress: 250,
    total: 500,
    reward: "Özel rozet",
  },
];

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1">Merhaba! 👋</h1>
            <p className="text-white/80 text-sm">Bugün harika görünüyorsun</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/profile">
              <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">S</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className="text-sm font-medium mb-0.5">{stat.value}</div>
                <div className="text-xs text-white/70">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Featured Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/games">
            <Card className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
              <Sparkles className="w-8 h-8 mb-2" />
              <h3 className="text-sm font-medium mb-1">Oyun Oyna</h3>
              <p className="text-xs text-white/80">12 farklı oyun</p>
            </Card>
          </Link>
          <Link to="/matching">
            <Card className="p-4 bg-gradient-to-br from-pink-600 to-pink-700 text-white border-0">
              <Heart className="w-8 h-8 mb-2" />
              <h3 className="text-sm font-medium mb-1">Eşleş</h3>
              <p className="text-xs text-white/80">Yeni arkadaşlar</p>
            </Card>
          </Link>
          <Link to="/chat">
            <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
              <MessageCircle className="w-8 h-8 mb-2" />
              <h3 className="text-sm font-medium mb-1">Sohbet</h3>
              <p className="text-xs text-white/80">5 yeni mesaj</p>
            </Card>
          </Link>
          <Link to="/map">
            <Card className="p-4 bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
              <MapPin className="w-8 h-8 mb-2" />
              <h3 className="text-sm font-medium mb-1">Keşfet</h3>
              <p className="text-xs text-white/80">Yakındaki yerler</p>
            </Card>
          </Link>
        </div>

        {/* Daily Challenge */}
        <Card className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-gray-900 font-medium">Günün Görevi</h3>
                <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full">
                  +100 puan
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Bir arkadaşınla oyun oyna ve bonus kazan!
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-yellow-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: "40%" }}></div>
                </div>
                <span className="text-xs text-gray-600">2/5</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Challenges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-600" />
              Aktif Görevler
            </h3>
            <button className="text-xs text-gray-600">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4 bg-white border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-gray-900 text-sm mb-1">{challenge.title}</h4>
                    <p className="text-xs text-gray-600">{challenge.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    {challenge.reward}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-600" />
              Başarılar
            </h3>
            <button className="text-xs text-gray-600">Tümünü Gör</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                  achievement.unlocked
                    ? "bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400"
                    : "bg-gray-100 border-2 border-gray-300"
                }`}
              >
                <div className={`text-2xl mb-1 ${!achievement.unlocked && "grayscale opacity-50"}`}>
                  {achievement.icon}
                </div>
                <div className="text-xs text-gray-700 text-center px-1">
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-600" />
              Canlı Aktiviteler
            </h3>
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Canlı
            </span>
          </div>
          <Card className="bg-white border-gray-200 divide-y divide-gray-200">
            {liveActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Yaklaşan Etkinlikler</h3>
            <Link to="/events" className="text-xs text-gray-600">
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to="/events">
                <Card className="p-4 bg-white border-gray-200 hover:border-gray-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-1">{event.title}</h4>
                      <div className="space-y-1 mb-2">
                        <p className="text-xs text-gray-600">
                          📅 {event.date} • {event.time}
                        </p>
                        <p className="text-xs text-gray-600">
                          📍 {event.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {event.category}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.participants} katılımcı
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
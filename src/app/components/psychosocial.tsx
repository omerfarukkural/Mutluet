import {
  Brain,
  Phone,
  MessageCircle,
  Video,
  BookOpen,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const supportOptions = [
  {
    id: "call",
    title: "Hemen Ara",
    description: "7/24 destek hattımız",
    icon: Phone,
    available: true,
  },
  {
    id: "chat",
    title: "Sohbet Desteği",
    description: "Anlık mesajlaşma",
    icon: MessageCircle,
    available: true,
  },
  {
    id: "video",
    title: "Video Görüşme",
    description: "Uzman psikologlarla",
    icon: Video,
    available: true,
  },
  {
    id: "group",
    title: "Grup Seansları",
    description: "Haftalık grup terapileri",
    icon: Users,
    available: false,
  },
];

const resources = [
  {
    id: 1,
    title: "Stresle Başa Çıkma Teknikleri",
    category: "Rehber",
    duration: "5 dk okuma",
  },
  {
    id: 2,
    title: "Nefes Egzersizleri",
    category: "Pratik",
    duration: "10 dk",
  },
  {
    id: 3,
    title: "Olumlu Düşünce Pratikleri",
    category: "Rehber",
    duration: "8 dk okuma",
  },
];

const upcomingSessions = [
  {
    id: 1,
    title: "Kaygı Yönetimi Grup Seansı",
    date: "5 Mart 2026",
    time: "14:00",
    participants: 8,
    maxParticipants: 12,
  },
  {
    id: 2,
    title: "Farkındalık Meditasyonu",
    date: "7 Mart 2026",
    time: "18:00",
    participants: 15,
    maxParticipants: 20,
  },
];

export function Psychosocial() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900">Psikososyal Destek</h1>
        <p className="text-sm text-gray-600 mt-1">
          Profesyonel destek ve kaynaklara erişin
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Emergency Banner */}
        <Card className="p-4 bg-gray-900 text-white border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">Acil Destek Hattı</h3>
              <p className="text-sm text-white/80">7/24 ulaşılabilir</p>
            </div>
            <Button
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Ara
            </Button>
          </div>
        </Card>

        {/* Support Options */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3">Destek Seçenekleri</h3>
          <div className="grid grid-cols-2 gap-3">
            {supportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.id}
                  className={`p-4 bg-white border-gray-200 ${
                    option.available
                      ? "cursor-pointer hover:border-gray-400"
                      : "opacity-50"
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h4 className="text-gray-900 mb-1 text-sm">
                    {option.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {option.description}
                  </p>
                  {!option.available && (
                    <p className="text-xs text-gray-500 mt-2">Yakında</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Yaklaşan Seanslar</h3>
            <button className="text-xs text-gray-600">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <Card
                key={session.id}
                className="p-4 bg-white border-gray-200"
              >
                <h4 className="text-gray-900 mb-2">{session.title}</h4>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {session.date} • {session.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {session.participants}/{session.maxParticipants} Katılımcı
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-300"
                >
                  Katıl
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Kaynaklar</h3>
            <button className="text-xs text-gray-600">Tümünü Gör</button>
          </div>
          <div className="space-y-2">
            {resources.map((resource) => (
              <Card
                key={resource.id}
                className="p-4 bg-white border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 text-sm mb-1">
                      {resource.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {resource.category} • {resource.duration}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Self-Assessment */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-gray-900 mb-2">Ruh Hali Değerlendirmesi</h3>
          <p className="text-sm text-gray-600 mb-4">
            Bugün kendinizi nasıl hissediyorsunuz?
          </p>
          <div className="flex gap-2">
            {["😊", "😐", "😔", "😟", "😢"].map((emoji, index) => (
              <button
                key={index}
                className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

import { Bell, Users, DollarSign, Calendar, MapPin, Clock } from "lucide-react";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";

const upcomingEvents = [
  {
    id: 1,
    title: "Okul Malzemesi Dağıtımı",
    date: "15 Mart 2026",
    time: "10:00",
    location: "Merkez İlkokulu",
    attendees: 12,
  },
  {
    id: 2,
    title: "Yemek Dağıtımı",
    date: "18 Mart 2026",
    time: "14:00",
    location: "Toplum Merkezi",
    attendees: 8,
  },
  {
    id: 3,
    title: "Ağaç Dikme Etkinliği",
    date: "22 Mart 2026",
    time: "09:00",
    location: "Kent Parkı",
    attendees: 15,
  },
];

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Top App Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white">B</span>
          </div>
          <span className="text-lg text-gray-900">Bitebimuv</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gray-900 rounded-full"></span>
        </button>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="p-6 bg-white border-gray-200">
          <h2 className="text-xl text-gray-900 mb-1">
            Hoş geldiniz, Ahmet 👋
          </h2>
          <p className="text-sm text-gray-600">
            Bugün harika bir gün, değişim yaratmaya hazır mısınız?
          </p>
        </Card>

        {/* Quick Stats */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3">İstatistikler</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 bg-white border-gray-200 text-center">
              <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl text-gray-900 mb-1">247</div>
              <div className="text-xs text-gray-600">Gönüllü</div>
            </Card>
            <Card className="p-4 bg-white border-gray-200 text-center">
              <DollarSign className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl text-gray-900 mb-1">₺45K</div>
              <div className="text-xs text-gray-600">Bağış</div>
            </Card>
            <Card className="p-4 bg-white border-gray-200 text-center">
              <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl text-gray-900 mb-1">12</div>
              <div className="text-xs text-gray-600">Etkinlik</div>
            </Card>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Yaklaşan Etkinlikler</h3>
            <button className="text-xs text-gray-600">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="p-4 bg-white border-gray-200"
              >
                <h4 className="text-gray-900 mb-2">{event.title}</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {event.date} • {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} Katılımcı</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

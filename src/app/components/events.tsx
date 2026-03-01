import { Search, Calendar, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

const events = [
  {
    id: 1,
    title: "Okul Malzemesi Dağıtımı",
    date: "15 Mart 2026",
    time: "10:00",
    location: "Merkez İlkokulu",
    attendees: 12,
    category: "This Week",
  },
  {
    id: 2,
    title: "Yemek Dağıtımı",
    date: "18 Mart 2026",
    time: "14:00",
    location: "Toplum Merkezi",
    attendees: 8,
    category: "This Week",
  },
  {
    id: 3,
    title: "Ağaç Dikme Etkinliği",
    date: "22 Mart 2026",
    time: "09:00",
    location: "Kent Parkı",
    attendees: 15,
    category: "This Month",
  },
  {
    id: 4,
    title: "Kıyafet Bağışı Kampanyası",
    date: "25 Mart 2026",
    time: "13:00",
    location: "Merkez Ofis",
    attendees: 10,
    category: "This Month",
  },
  {
    id: 5,
    title: "Çocuk Eğitim Programı",
    date: "28 Mart 2026",
    time: "15:00",
    location: "Eğitim Merkezi",
    attendees: 20,
    category: "This Month",
  },
];

const filters = ["All", "This Week", "This Month"];

export function Events() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter((event) => {
    const matchesFilter = activeFilter === "All" || event.category === activeFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900 mb-4">Etkinlikler</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Etkinlik ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-gray-300"
          />
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Event Cards */}
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="bg-white border-gray-200 overflow-hidden">
              {/* Event Image Placeholder */}
              <div className="h-32 bg-gray-200 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              
              {/* Event Details */}
              <div className="p-4">
                <h3 className="text-gray-900 mb-3">{event.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {event.date} • {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} Katılımcı</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

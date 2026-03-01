import { MapPin, Navigation, Search, Filter } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const locations = [
  {
    id: 1,
    name: "Merkez İlkokulu",
    type: "Etkinlik",
    distance: "1.2 km",
    lat: 41.0082,
    lng: 28.9784,
  },
  {
    id: 2,
    name: "Toplum Merkezi",
    type: "Yardım Noktası",
    distance: "2.5 km",
    lat: 41.0122,
    lng: 28.9754,
  },
  {
    id: 3,
    name: "Kent Parkı",
    type: "Etkinlik",
    distance: "3.8 km",
    lat: 41.0052,
    lng: 28.9814,
  },
  {
    id: 4,
    name: "Psikososyal Destek Merkezi",
    type: "Destek",
    distance: "0.8 km",
    lat: 41.0092,
    lng: 28.9794,
  },
];

export function Map() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900 mb-4">Harita</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Konum ara..."
            className="pl-10 pr-12 h-11 border-gray-300"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-[300px] bg-gray-200">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-b border-gray-400"
              style={{ top: `${i * 5}%`, width: "100%" }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-r border-gray-400 h-full"
              style={{ left: `${i * 5}%` }}
            />
          ))}
        </div>

        {/* Location Markers */}
        {locations.map((location, index) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location.id)}
            className={`absolute w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              selectedLocation === location.id
                ? "bg-gray-900 scale-125"
                : "bg-gray-600"
            }`}
            style={{
              top: `${20 + index * 20}%`,
              left: `${25 + index * 15}%`,
            }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </button>
        ))}

        {/* Current Location Button */}
        <Button
          size="icon"
          className="absolute bottom-4 right-4 w-12 h-12 bg-white border-2 border-gray-300 text-gray-700 rounded-full shadow-lg hover:bg-gray-50"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      {/* Locations List */}
      <div className="px-6 py-4">
        <h3 className="text-sm text-gray-700 mb-3">Yakınınızdaki Noktalar</h3>
        <div className="space-y-3">
          {locations.map((location) => (
            <Card
              key={location.id}
              className={`p-4 bg-white cursor-pointer transition-all ${
                selectedLocation === location.id
                  ? "border-gray-900"
                  : "border-gray-200"
              }`}
              onClick={() => setSelectedLocation(location.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">{location.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{location.type}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Navigation className="w-3 h-3" />
                    <span>{location.distance}</span>
                  </div>
                </div>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Yol Tarifi
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

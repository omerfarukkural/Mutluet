import {
  Building2,
  Search,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  Heart,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

const institutionCategories = [
  { id: "government", name: "Devlet Kurumları", icon: Building2, count: 12 },
  { id: "health", name: "Sağlık", icon: Heart, count: 8 },
  { id: "education", name: "Eğitim", icon: GraduationCap, count: 15 },
  { id: "legal", name: "Hukuki", icon: Shield, count: 6 },
  { id: "employment", name: "İstihdam", icon: Briefcase, count: 9 },
];

const institutions = [
  {
    id: 1,
    name: "AFAD - Afet ve Acil Durum Yönetimi Başkanlığı",
    category: "Devlet Kurumları",
    phone: "122",
    address: "Ankara",
    services: ["Acil Yardım", "Afet Koordinasyonu", "İhtiyaç Tespit"],
  },
  {
    id: 2,
    name: "Aile ve Sosyal Hizmetler Bakanlığı",
    category: "Devlet Kurumları",
    phone: "183",
    address: "Ankara",
    services: ["Sosyal Yardım", "Aile Danışmanlığı", "Çocuk Koruma"],
  },
  {
    id: 3,
    name: "Sağlık Bakanlığı - Destek Hattı",
    category: "Sağlık",
    phone: "184",
    address: "Ankara",
    services: ["Sağlık Danışma", "Randevu", "Acil Sağlık"],
  },
  {
    id: 4,
    name: "Milli Eğitim Bakanlığı - Destek Merkezi",
    category: "Eğitim",
    phone: "147",
    address: "Ankara",
    services: ["Eğitim Desteği", "Okul Kayıt", "Burs Başvuru"],
  },
  {
    id: 5,
    name: "İŞKUR - Türkiye İş Kurumu",
    category: "İstihdam",
    phone: "170",
    address: "Tüm İller",
    services: ["İş Bulma", "Meslek Edindirme", "İşe Yerleştirme"],
  },
];

export function Institutions() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900 mb-4">Resmi Kurumlar</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Kurum veya hizmet ara..."
            className="pl-10 h-11 border-gray-300"
          />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3">Kategoriler</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {institutionCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full whitespace-nowrap hover:border-gray-400 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({category.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Institutions List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Tüm Kurumlar</h3>
            <span className="text-xs text-gray-500">
              {institutions.length} kurum
            </span>
          </div>
          <div className="space-y-3">
            {institutions.map((institution) => (
              <Card
                key={institution.id}
                className="p-4 bg-white border-gray-200"
              >
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-1">
                        {institution.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {institution.category}
                      </p>
                    </div>
                    <button className="ml-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{institution.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{institution.address}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Hizmetler:</p>
                  <div className="flex flex-wrap gap-2">
                    {institution.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 h-9 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Ara
                  </button>
                  <button className="flex-1 h-9 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Yol Tarifi
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Emergency Numbers */}
        <Card className="p-4 bg-gray-900 text-white border-0">
          <h3 className="mb-3">Acil Durum Numaraları</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Polis", number: "155" },
              { name: "Ambulans", number: "112" },
              { name: "İtfaiye", number: "110" },
              { name: "AFAD", number: "122" },
            ].map((emergency, index) => (
              <button
                key={index}
                className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="text-2xl mb-1">{emergency.number}</div>
                <div className="text-xs text-white/80">{emergency.name}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

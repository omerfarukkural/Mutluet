import {
  Heart,
  Users,
  GraduationCap,
  Home,
  Utensils,
  ShieldCheck,
  Brain,
  Gamepad2,
  MessageCircle,
  Building2,
  Stethoscope,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";

const categories = [
  { id: "donation", name: "Bağış Yap", icon: Heart, count: 45, color: "bg-gray-100" },
  { id: "volunteer", name: "Gönüllülük", icon: Users, count: 32, color: "bg-gray-100" },
  { id: "education", name: "Eğitim", icon: GraduationCap, count: 28, color: "bg-gray-100" },
  { id: "housing", name: "Barınma", icon: Home, count: 12, color: "bg-gray-100" },
  { id: "food", name: "Gıda Yardımı", icon: Utensils, count: 56, color: "bg-gray-100" },
  { id: "legal", name: "Hukuki Destek", icon: ShieldCheck, count: 18, color: "bg-gray-100" },
  { id: "psycho", name: "Psikososyal Destek", icon: Brain, count: 24, color: "bg-gray-100" },
  { id: "games", name: "Oyunlar", icon: Gamepad2, count: 8, color: "bg-gray-100" },
  { id: "chat", name: "Sohbet", icon: MessageCircle, count: 120, color: "bg-gray-100" },
  { id: "institutions", name: "Resmi Kurumlar", icon: Building2, count: 34, color: "bg-gray-100" },
  { id: "health", name: "Sağlık", icon: Stethoscope, count: 42, color: "bg-gray-100" },
  { id: "resources", name: "Kaynaklar", icon: BookOpen, count: 67, color: "bg-gray-100" },
];

export function Categories() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900">Kategoriler</h1>
        <p className="text-sm text-gray-600 mt-1">
          İhtiyacınıza göre kategori seçin
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const linkPath = 
              category.id === "chat" ? "/chat" :
              category.id === "psycho" ? "/psychosocial" :
              category.id === "games" ? "/games" :
              category.id === "institutions" ? "/institutions" :
              "/home";

            return (
              <Link key={category.id} to={linkPath}>
                <Card className="p-4 bg-white border-gray-200 hover:border-gray-400 transition-colors h-full">
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-gray-900 mb-1">{category.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {category.count} içerik
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

import {
  User,
  Clock,
  DollarSign,
  ChevronRight,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { WordPressButton } from "./wordpress-button";

const donationHistory = [
  { id: 1, date: "28 Şubat 2026", amount: 100, cause: "Eğitim Fonu" },
  { id: 2, date: "15 Şubat 2026", amount: 250, cause: "Gıda Yardımı" },
  { id: 3, date: "8 Şubat 2026", amount: 75, cause: "Acil Yardım" },
];

const settingsItems = [
  { id: "settings", label: "Ayarlar", icon: Settings },
  { id: "notifications", label: "Bildirimler", icon: Bell },
  { id: "privacy", label: "Gizlilik", icon: Shield },
  { id: "help", label: "Yardım & Destek", icon: HelpCircle },
];

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900">Profil</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6 bg-white border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            {/* Profile Photo */}
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-gray-900 mb-1">Ahmet Yılmaz</h2>
              <p className="text-sm text-gray-600">ahmet@email.com</p>
            </div>
          </div>

          {/* Volunteer Hours Stat */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl text-gray-900">48</div>
                  <div className="text-sm text-gray-600">Gönüllülük Saati</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Bu ay</div>
            </div>
          </div>
        </Card>

        {/* Donation History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-700">Bağış Geçmişi</h3>
            <button className="text-xs text-gray-600">Tümünü Gör</button>
          </div>

          <Card className="bg-white border-gray-200 divide-y divide-gray-200">
            {donationHistory.map((donation) => (
              <div key={donation.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 mb-1">{donation.cause}</div>
                  <div className="text-xs text-gray-600">{donation.date}</div>
                </div>
                <div className="text-gray-900">₺{donation.amount}</div>
              </div>
            ))}
          </Card>
        </div>

        {/* Admin Access */}
        {user?.role === "ADMIN" && (
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 p-4">
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 text-white"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Admin Paneli</div>
                <div className="text-sm text-white/80">
                  Platform yönetimi ve istatistikler
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </Card>
        )}

        {/* WordPress SSO */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 px-2">Hızlı Erişim</h3>
          <WordPressButton />
        </div>

        {/* Settings List */}
        <Card className="bg-white border-gray-200 divide-y divide-gray-200">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="flex-1 text-left text-gray-700">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </Card>

        {/* Logout Button */}
        <button className="w-full p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

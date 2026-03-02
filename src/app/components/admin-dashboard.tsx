import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import type { User, Event, Donation } from "../../types";
import {
  Users,
  Calendar,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalEvents: 0,
    activeUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== "ADMIN") {
      navigate("/home");
      return;
    }

    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data
      const [usersData, eventsData, donationsData] = await Promise.all([
        api.getAllUsers(),
        api.getAllEvents(),
        api.getAllDonations(),
      ]);

      setUsers(usersData);
      setEvents(eventsData);
      setDonations(donationsData);

      // Calculate stats
      const totalDonationAmount = donationsData.reduce(
        (sum, d) => sum + d.amount,
        0
      );
      const activeUsersCount = usersData.filter(
        (u) => u.engagementScore > 0
      ).length;

      setStats({
        totalUsers: usersData.length,
        totalDonations: totalDonationAmount,
        totalEvents: eventsData.length,
        activeUsers: activeUsersCount,
      });
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Veri yüklenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-indigo-100">Hoş geldin, {user.name}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Hata</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aktif Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeUsers}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Bağış</p>
              <p className="text-2xl font-bold text-gray-900">
                ₺{stats.totalDonations.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Etkinlik</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEvents}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Son Kayıtlar
          </h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {users.slice(0, 5).map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    u.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {u.role}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {u.engagementScore} puan
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Yaklaşan Etkinlikler
          </h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Henüz etkinlik yok</p>
              <p className="text-sm">
                Prisma Studio'dan etkinlik ekleyebilirsin
              </p>
            </div>
          ) : (
            events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        📅 {new Date(event.date).toLocaleDateString("tr-TR")}
                      </span>
                      <span className="text-xs text-gray-500">
                        👥 {event.currentParticipants} katılımcı
                      </span>
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      event.category === "EGITIM"
                        ? "bg-blue-100 text-blue-700"
                        : event.category === "SAGLIK"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {event.category}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Donations */}
      <div className="mx-4 mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Son Bağışlar</h2>
          <Heart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {donations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Henüz bağış yok</p>
            </div>
          ) : (
            donations.slice(0, 5).map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {donation.type === "MONETARY" ? "Para" : "Ayni"} Bağış
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ₺{donation.amount.toLocaleString("tr-TR")}
                  </p>
                  {donation.isAnonymous && (
                    <p className="text-xs text-gray-400">Anonim</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mt-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.open("http://localhost:5555", "_blank")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Prisma Studio</p>
            <p className="text-xs text-gray-500 mt-1">
              Database'i yönet
            </p>
          </button>

          <button
            onClick={() => navigate("/home")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">
              Kullanıcı Görünümü
            </p>
            <p className="text-xs text-gray-500 mt-1">Normal kullanıcı gibi gör</p>
          </button>

          <button
            onClick={loadAdminData}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Verileri Yenile</p>
            <p className="text-xs text-gray-500 mt-1">İstatistikleri güncelle</p>
          </button>

          <button
            onClick={() => window.open("http://localhost:3001/health", "_blank")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Backend Status</p>
            <p className="text-xs text-gray-500 mt-1">API durumunu kontrol et</p>
          </button>
        </div>
      </div>
    </div>
  );
}

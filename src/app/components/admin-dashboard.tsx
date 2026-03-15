import { useEffect, useState, useRef } from "react";
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
  Bot,
  Github,
  Settings,
  Plus,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  Send,
  Database,
  Activity,
  Building2,
  UserCheck,
  ChevronDown,
  X,
  Rocket,
  MessageCircle,
  Monitor,
} from "lucide-react";

type TabType = "dashboard" | "users" | "events" | "donations" | "organizations" | "ai" | "github" | "system";

interface AdminStats {
  totalUsers: number;
  totalDonations: number;
  totalEvents: number;
  totalOrganizations: number;
  recentUsers: number;
  totalDonationAmount: number;
  activeVolunteers: number;
  pendingTeamLeaders: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // AI State
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string; source?: string }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatRef = useRef<HTMLDivElement>(null);

  // GitHub State
  const [githubStatus, setGithubStatus] = useState<any>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  // Modal States
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<{ userId: string; name: string; currentRole: string } | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "", description: "", category: "SOSYAL", date: "", time: "", location: "", maxParticipants: ""
  });

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      navigate("/home");
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, usersData, eventsData, donationsData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAllUsers().catch(() => []),
        api.getAllEvents().catch(() => []),
        api.getAllDonations().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      else {
        // Fallback stats calculation
        const totalDonationAmount = donationsData.reduce((sum: number, d: any) => sum + d.amount, 0);
        setStats({
          totalUsers: usersData.length,
          totalDonations: donationsData.length,
          totalEvents: eventsData.length,
          totalOrganizations: 0,
          recentUsers: usersData.filter((u: any) => {
            const created = new Date(u.createdAt);
            return created > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          }).length,
          totalDonationAmount,
          activeVolunteers: usersData.filter((u: any) => u.role === 'VOLUNTEER').length,
          pendingTeamLeaders: 0,
        });
      }
      setUsers(usersData);
      setEvents(eventsData);
      setDonations(donationsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Veri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      setShowRoleModal(null);
    } catch (err: any) {
      alert("Rol güncellenemedi: " + (err.message || "Hata"));
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert("Kullanıcı silinemedi: " + (err.message || "Hata"));
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEvent = await api.createEvent({
        ...eventForm,
        maxParticipants: eventForm.maxParticipants ? parseInt(eventForm.maxParticipants) : undefined,
      });
      setEvents(prev => [newEvent, ...prev]);
      setShowEventModal(false);
      setEventForm({ title: "", description: "", category: "SOSYAL", date: "", time: "", location: "", maxParticipants: "" });
    } catch (err: any) {
      alert("Etkinlik oluşturulamadı: " + (err.message || "Hata"));
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`"${title}" etkinliğini silmek istediğinize emin misiniz?`)) return;
    try {
      await api.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err: any) {
      alert("Etkinlik silinemedi: " + (err.message || "Hata"));
    }
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setAiInput("");
    setAiLoading(true);

    try {
      const result = await api.sendAiMessage(userMsg, { stats, userCount: users.length });
      setAiMessages(prev => [...prev, { role: "assistant", content: result.response, source: result.source }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, { role: "assistant", content: "❌ AI yanıt veremedi: " + (err.message || "Bağlantı hatası") }]);
    } finally {
      setAiLoading(false);
      setTimeout(() => aiChatRef.current?.scrollTo({ top: aiChatRef.current.scrollHeight, behavior: "smooth" }), 100);
    }
  };

  const loadGithubStatus = async () => {
    try {
      const status = await api.getGithubStatus();
      setGithubStatus(status);
    } catch { setGithubStatus({ connected: false, message: "Bağlantı hatası" }); }
  };

  const loadSystemInfo = async () => {
    try {
      const info = await api.getSystemInfo();
      setSystemInfo(info);
    } catch { setSystemInfo(null); }
  };

  const handleDeploy = async () => {
    if (!confirm("Deploy başlatılsın mı? Bu, GitHub Actions workflow'unu tetikleyecek.")) return;
    try {
      const result = await api.triggerDeploy();
      alert("✅ " + result.message);
    } catch (err: any) {
      alert("❌ Deploy hatası: " + (err.message || "Hata"));
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Admin paneli yükleniyor...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "users", label: "Kullanıcılar", icon: Users },
    { id: "events", label: "Etkinlikler", icon: Calendar },
    { id: "donations", label: "Bağışlar", icon: Heart },
    { id: "organizations", label: "Kuruluşlar", icon: Building2 },
    { id: "ai", label: "AI Asistan", icon: Bot },
    { id: "github", label: "GitHub", icon: Github },
    { id: "system", label: "Sistem", icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold">Mutluet Admin</h1>
              <p className="text-indigo-100 text-xs">Bir Tebessüm Bin Mutluluk</p>
            </div>
          </div>
          <button onClick={loadDashboardData} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "github") loadGithubStatus();
                if (tab.id === "system") loadSystemInfo();
              }}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}

      <div className="p-4">
        {/* ========== DASHBOARD TAB ========== */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Toplam Kullanıcı", value: stats.totalUsers, icon: Users, color: "blue", sub: `+${stats.recentUsers} bu ay` },
                { label: "Aktif Gönüllü", value: stats.activeVolunteers, icon: UserCheck, color: "green" },
                { label: "Toplam Bağış", value: `₺${stats.totalDonationAmount.toLocaleString("tr-TR")}`, icon: Heart, color: "red", sub: `${stats.totalDonations} bağış` },
                { label: "Etkinlik", value: stats.totalEvents, icon: Calendar, color: "purple" },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs">{card.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                      {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
                    </div>
                    <div className={`bg-${card.color}-100 p-2.5 rounded-lg`}>
                      <card.icon className={`w-5 h-5 text-${card.color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Son Kayıtlar</h3>
                <button onClick={() => setActiveTab("users")} className="text-xs text-indigo-600">Tümünü Gör →</button>
              </div>
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                    u.role === "VOLUNTEER" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{u.role}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveTab("ai")} className="bg-gradient-to-r from-violet-500 to-purple-500 p-4 rounded-xl text-white text-left">
                <Bot className="w-6 h-6 mb-2" />
                <p className="font-medium text-sm">AI Asistan</p>
                <p className="text-xs text-white/70">Akıllı yardım al</p>
              </button>
              <button onClick={() => { setActiveTab("github"); loadGithubStatus(); }} className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 rounded-xl text-white text-left">
                <Github className="w-6 h-6 mb-2" />
                <p className="font-medium text-sm">GitHub</p>
                <p className="text-xs text-white/70">Deploy & Durum</p>
              </button>
              <button onClick={() => setShowEventModal(true)} className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-xl text-white text-left">
                <Plus className="w-6 h-6 mb-2" />
                <p className="font-medium text-sm">Yeni Etkinlik</p>
                <p className="text-xs text-white/70">Hemen oluştur</p>
              </button>
              <button onClick={() => { setActiveTab("system"); loadSystemInfo(); }} className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl text-white text-left">
                <Monitor className="w-6 h-6 mb-2" />
                <p className="font-medium text-sm">Sistem</p>
                <p className="text-xs text-white/70">Sağlık kontrolü</p>
              </button>
            </div>
          </div>
        )}

        {/* ========== USERS TAB ========== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="">Tüm Roller</option>
                <option value="USER">Kullanıcı</option>
                <option value="VOLUNTEER">Gönüllü</option>
                <option value="ADMIN">Admin</option>
                <option value="ORGANIZATION">Kuruluş</option>
              </select>
            </div>

            <p className="text-xs text-gray-500">{filteredUsers.length} kullanıcı</p>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {filteredUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-500">💰 ₺{u.totalDonations}</span>
                        <span className="text-xs text-gray-500">⏰ {u.volunteerHours}s</span>
                        <span className="text-xs text-gray-500">📅 {u.eventsAttended}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowRoleModal({ userId: u.id, name: u.name, currentRole: u.role })}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                        u.role === "VOLUNTEER" ? "bg-green-100 text-green-700" :
                        u.role === "ORGANIZATION" ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role} <ChevronDown className="w-3 h-3 inline" />
                    </button>
                    {u.id !== user?.id && (
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== EVENTS TAB ========== */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Etkinlikler ({events.length})</h2>
              <button onClick={() => setShowEventModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Yeni Etkinlik
              </button>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Henüz etkinlik yok</p>
                <button onClick={() => setShowEventModal(true)} className="mt-3 text-indigo-600 text-sm font-medium">+ İlk etkinliği oluştur</button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            event.category === "EGITIM" ? "bg-blue-100 text-blue-700" :
                            event.category === "SAGLIK" ? "bg-green-100 text-green-700" :
                            event.category === "SOSYAL" ? "bg-purple-100 text-purple-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>{event.category}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                          <span>📅 {new Date(event.date).toLocaleDateString("tr-TR")}</span>
                          <span>🕐 {event.time}</span>
                          <span>📍 {event.location}</span>
                          <span>👥 {event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEvent(event.id, event.title)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== DONATIONS TAB ========== */}
        {activeTab === "donations" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Bağışlar ({donations.length})</h2>
            {donations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Henüz bağış yok</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {donations.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{d.type} Bağışı</p>
                      <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString("tr-TR")}</p>
                      {d.description && <p className="text-xs text-gray-500 mt-1">{d.description}</p>}
                    </div>
                    <p className="font-bold text-green-600">₺{d.amount.toLocaleString("tr-TR")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== ORGANIZATIONS TAB ========== */}
        {activeTab === "organizations" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Kuruluşlar</h2>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Kuruluş yönetimi yakında aktif olacak</p>
              <p className="text-xs text-gray-400 mt-1">Backend API'si hazır. Kuruluş ekleme formu eklenecek.</p>
            </div>
          </div>
        )}

        {/* ========== AI ASSISTANT TAB ========== */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-5 h-5" />
                <h2 className="font-semibold">Mutluet AI Asistan</h2>
              </div>
              <p className="text-xs text-white/70">Platform yönetimi, kod değişiklikleri, veritabanı sorguları ve hata tespiti için AI asistanınız</p>
            </div>

            {/* Chat Messages */}
            <div ref={aiChatRef} className="bg-white rounded-xl shadow-sm h-80 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">Merhaba! Size nasıl yardımcı olabilirim?</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {["Kullanıcı istatistikleri", "Etkinlik oluştur", "Deploy nasıl yapılır?", "Hata var mı?"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setAiInput(q); }}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.source && <p className="text-xs mt-1 opacity-50">Kaynak: {msg.source}</p>}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAiSend()}
                placeholder="AI'ya soru sorun..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={aiLoading}
              />
              <button
                onClick={handleAiSend}
                disabled={aiLoading || !aiInput.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Quick DB Query */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">🗄️ Hızlı DB Sorguları</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Kullanıcı sayısı", query: "SELECT COUNT(*) as count FROM \"User\"" },
                  { label: "Son 5 kullanıcı", query: "SELECT name, email, role, \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 5" },
                  { label: "Bağış toplamı", query: "SELECT SUM(amount) as total FROM \"Donation\"" },
                  { label: "Etkinlikler", query: "SELECT title, category, date FROM \"Event\" ORDER BY date DESC LIMIT 5" },
                ].map(q => (
                  <button
                    key={q.label}
                    onClick={async () => {
                      try {
                        const result = await api.runDbQuery(q.query);
                        setAiMessages(prev => [...prev,
                          { role: "user", content: `🗄️ SQL: ${q.query}` },
                          { role: "assistant", content: `📊 Sonuç (${result.rowCount} satır):\n\`\`\`json\n${JSON.stringify(result.result, null, 2)}\n\`\`\``, source: "db-query" }
                        ]);
                      } catch (err: any) {
                        setAiMessages(prev => [...prev,
                          { role: "user", content: `🗄️ SQL: ${q.query}` },
                          { role: "assistant", content: `❌ Sorgu hatası: ${err.message}` }
                        ]);
                      }
                    }}
                    className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 text-gray-600"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== GITHUB TAB ========== */}
        {activeTab === "github" && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Github className="w-5 h-5" />
                <h2 className="font-semibold">GitHub Entegrasyonu</h2>
              </div>
              {githubStatus ? (
                githubStatus.connected ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Bağlı</span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>📦 {githubStatus.repo?.name}</p>
                      <p>🌿 Branch: {githubStatus.repo?.defaultBranch}</p>
                      <p>⭐ {githubStatus.repo?.stars} star</p>
                      <p>🔗 <a href={githubStatus.repo?.url} target="_blank" className="text-blue-400 underline">{githubStatus.repo?.url}</a></p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">Bağlı Değil</span>
                    </div>
                    <p className="text-xs text-gray-400">{githubStatus.message}</p>
                    <div className="mt-3 bg-gray-800 rounded-lg p-3 text-xs text-gray-300">
                      <p className="font-medium mb-1">🔑 Bağlantı için:</p>
                      <p>1. github.com → Settings → Developer settings</p>
                      <p>2. Personal access tokens → Tokens (classic)</p>
                      <p>3. Generate new token (repo, workflow izinleri)</p>
                      <p>4. backend/.env'ye GITHUB_TOKEN= ekle</p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs text-gray-400">Yükleniyor...</p>
              )}
            </div>

            {/* Recent Commits */}
            {githubStatus?.recentCommits && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-medium text-sm text-gray-900">Son Commit'ler</h3>
                </div>
                {githubStatus.recentCommits.map((c: any, i: number) => (
                  <div key={i} className="p-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-start gap-2">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex-shrink-0">{c.sha}</code>
                      <div>
                        <p className="text-sm text-gray-800">{c.message}</p>
                        <p className="text-xs text-gray-400">{c.author} • {new Date(c.date).toLocaleDateString("tr-TR")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              <Rocket className="w-5 h-5" />
              Deploy Başlat
            </button>
          </div>
        )}

        {/* ========== SYSTEM TAB ========== */}
        {activeTab === "system" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Sistem Bilgisi</h2>
            {systemInfo ? (
              <div className="space-y-3">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${systemInfo.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium text-sm">{systemInfo.status === 'healthy' ? 'Sağlıklı' : 'Sorunlu'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Çalışma Süresi</p>
                      <p className="font-medium">{systemInfo.uptimeFormatted}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Node.js</p>
                      <p className="font-medium">{systemInfo.nodeVersion}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Bellek (Heap)</p>
                      <p className="font-medium">{systemInfo.memory?.heapUsed}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Ortam</p>
                      <p className="font-medium">{systemInfo.environment}</p>
                    </div>
                  </div>
                </div>

                {/* API Keys Status */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-medium text-sm text-gray-900 mb-3">🔑 API Anahtarları Durumu</h3>
                  <div className="space-y-2">
                    {[
                      { name: "DATABASE_URL", label: "Supabase DB", critical: true },
                      { name: "JWT_SECRET", label: "JWT Token", critical: true },
                      { name: "GOOGLE_CLIENT_ID", label: "Google OAuth", critical: false },
                      { name: "STRIPE_SECRET_KEY", label: "Stripe Ödeme", critical: false },
                      { name: "SENDGRID_API_KEY", label: "SendGrid Email", critical: false },
                      { name: "GITHUB_TOKEN", label: "GitHub API", critical: false },
                      { name: "OPENAI_API_KEY", label: "OpenAI (AI Asistan)", critical: false },
                    ].map(key => (
                      <div key={key.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{key.label}</span>
                          {key.critical && <span className="text-xs bg-red-100 text-red-600 px-1.5 rounded">zorunlu</span>}
                        </div>
                        <span className="text-xs text-gray-400">{key.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Useful Links */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-medium text-sm text-gray-900 mb-3">🔗 Yararlı Linkler</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Supabase Dashboard", url: "https://supabase.com/dashboard" },
                      { label: "Vercel Dashboard", url: "https://vercel.com/dashboard" },
                      { label: "GitHub Repo", url: "https://github.com/omerfarukkural/Mutluet" },
                      { label: "Google Cloud Console", url: "https://console.cloud.google.com" },
                      { label: "Stripe Dashboard", url: "https://dashboard.stripe.com" },
                      { label: "SendGrid", url: "https://app.sendgrid.com" },
                    ].map(link => (
                      <a key={link.url} href={link.url} target="_blank" className="flex items-center justify-between py-1 text-sm text-indigo-600 hover:text-indigo-800">
                        {link.label} <span className="text-xs text-gray-400">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Monitor className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Backend'e bağlanılamıyor</p>
                <p className="text-xs text-gray-400 mt-1">Backend sunucusunun çalıştığından emin olun</p>
                <button onClick={loadSystemInfo} className="mt-3 text-indigo-600 text-sm font-medium">Tekrar Dene</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== MODALS ========== */}

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-lg mb-1">Rol Değiştir</h3>
            <p className="text-sm text-gray-500 mb-4">{showRoleModal.name}</p>
            <div className="space-y-2">
              {[
                { role: "USER", label: "👤 Kullanıcı", desc: "Standart kullanıcı" },
                { role: "VOLUNTEER", label: "🙋 Gönüllü", desc: "Etkinliklere katılabilir" },
                { role: "ADMIN", label: "🛡️ Admin", desc: "Tam yetki" },
                { role: "ORGANIZATION", label: "🏢 Kuruluş", desc: "Kuruluş yöneticisi" },
              ].map(r => (
                <button
                  key={r.role}
                  onClick={() => handleUpdateRole(showRoleModal.userId, r.role)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    showRoleModal.currentRole === r.role
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowRoleModal(null)} className="w-full mt-4 py-2 text-gray-500 text-sm">İptal</button>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Yeni Etkinlik</h3>
              <button onClick={() => setShowEventModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Başlık *</label>
                <input type="text" required value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" placeholder="Etkinlik başlığı" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Açıklama *</label>
                <textarea required value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" rows={3} placeholder="Etkinlik açıklaması" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Kategori *</label>
                <select value={eventForm.category} onChange={e => setEventForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1 bg-white">
                  <option value="SOSYAL">Sosyal</option>
                  <option value="EGITIM">Eğitim</option>
                  <option value="SAGLIK">Sağlık</option>
                  <option value="GIDA">Gıda</option>
                  <option value="BARINMA">Barınma</option>
                  <option value="HUKUKI">Hukuki</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium">Tarih *</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium">Saat *</label>
                  <input type="time" required value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Konum *</label>
                <input type="text" required value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" placeholder="Etkinlik yeri" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Max Katılımcı</label>
                <input type="number" value={eventForm.maxParticipants} onChange={e => setEventForm(f => ({ ...f, maxParticipants: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" placeholder="Sınırsız bırakabilirsiniz" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 mt-2">
                Etkinlik Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

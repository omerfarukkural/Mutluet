import { Gamepad2, Trophy, Users, Star, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const games = [
  {
    id: 1,
    name: "Okey",
    players: "2-4 oyuncu",
    duration: "15-30 dk",
    description: "Klasik Türk Okey oyunu. Stratejik düşünce ve sosyal etkileşim",
    icon: "🎴",
    available: true,
    category: "Masa Oyunu",
    popularity: 98,
  },
  {
    id: 2,
    name: "Tavla",
    players: "2 oyuncu",
    duration: "10-20 dk",
    description: "Backgammon - Dünya klasiği, strateji ve şans dengesi",
    icon: "⚫",
    available: true,
    category: "Masa Oyunu",
    popularity: 95,
  },
  {
    id: 3,
    name: "Satranç",
    players: "2 oyuncu",
    duration: "20-40 dk",
    description: "Zihin sporları kralı. Stratejik düşünme ve planlama",
    icon: "♟️",
    available: true,
    category: "Strateji",
    popularity: 92,
  },
  {
    id: 4,
    name: "King",
    players: "2-4 oyuncu",
    duration: "20-30 dk",
    description: "8 farklı el, puanlama sistemi ile heyecan dolu kart oyunu",
    icon: "👑",
    available: true,
    category: "İskambil",
    popularity: 94,
  },
  {
    id: 5,
    name: "Batak",
    players: "4 oyuncu",
    duration: "15-25 dk",
    description: "Eşli oynanan Türk kart oyunu. Takım çalışması ve strateji",
    icon: "🃏",
    available: true,
    category: "İskambil",
    popularity: 91,
  },
  {
    id: 6,
    name: "101 Okey",
    players: "2-4 oyuncu",
    duration: "10-20 dk",
    description: "Hızlı tempolu Okey varyasyonu",
    icon: "💯",
    available: true,
    category: "Masa Oyunu",
    popularity: 88,
  },
  {
    id: 7,
    name: "Kelime Avı",
    players: "2-8 oyuncu",
    duration: "5-10 dk",
    description: "Kelime bulma, hız ve kelime hazinesi oyunu",
    icon: "📝",
    available: true,
    category: "Kelime",
    popularity: 85,
  },
  {
    id: 8,
    name: "Trivia Yarışması",
    players: "2-10 oyuncu",
    duration: "10-15 dk",
    description: "Genel kültür, tarih, bilim, sanat soruları",
    icon: "🧠",
    available: true,
    category: "Quiz",
    popularity: 87,
  },
  {
    id: 9,
    name: "Pisti",
    players: "2-4 oyuncu",
    duration: "10-15 dk",
    description: "Hızlı ve eğlenceli Türk kart oyunu",
    icon: "🎯",
    available: true,
    category: "İskambil",
    popularity: 89,
  },
  {
    id: 10,
    name: "Monopoly",
    players: "2-6 oyuncu",
    duration: "30-60 dk",
    description: "Emlak, strateji ve müzakere oyunu",
    icon: "🏠",
    available: true,
    category: "Strateji",
    popularity: 90,
  },
  {
    id: 11,
    name: "Ludo",
    players: "2-4 oyuncu",
    duration: "15-20 dk",
    description: "Klasik zar oyunu, aile için mükemmel",
    icon: "🎲",
    available: true,
    category: "Masa Oyunu",
    popularity: 83,
  },
  {
    id: 12,
    name: "Dama",
    players: "2 oyuncu",
    duration: "10-20 dk",
    description: "Strateji ve öngörü gerektiren klasik oyun",
    icon: "⚪",
    available: true,
    category: "Strateji",
    popularity: 82,
  },
];

const activeRooms = [
  {
    id: 1,
    game: "Okey",
    host: "Ayşe D.",
    players: 3,
    maxPlayers: 4,
    status: "Bekliyor",
    bet: "Dostluk",
    level: "Orta",
  },
  {
    id: 2,
    game: "King",
    host: "Mehmet K.",
    players: 4,
    maxPlayers: 4,
    status: "Oyunda",
    bet: "Dostluk",
    level: "İleri",
  },
  {
    id: 3,
    game: "Satranç",
    host: "Zeynep A.",
    players: 1,
    maxPlayers: 2,
    status: "Bekliyor",
    bet: "Dostluk",
    level: "Başlangıç",
  },
  {
    id: 4,
    game: "Tavla",
    host: "Can S.",
    players: 1,
    maxPlayers: 2,
    status: "Bekliyor",
    bet: "Dostluk",
    level: "Orta",
  },
  {
    id: 5,
    game: "Trivia Yarışması",
    host: "Elif K.",
    players: 6,
    maxPlayers: 10,
    status: "Bekliyor",
    bet: "Dostluk",
    level: "Tüm Seviyeler",
  },
];

const leaderboard = [
  { rank: 1, name: "Ali Y.", score: 24850, games: 342, avatar: "A", badge: "🏆" },
  { rank: 2, name: "Ayşe D.", score: 21840, games: 298, avatar: "A", badge: "🥈" },
  { rank: 3, name: "Mehmet K.", score: 19620, games: 256, avatar: "M", badge: "🥉" },
  { rank: 4, name: "Zeynep A.", score: 17580, games: 234, avatar: "Z", badge: "⭐" },
  { rank: 5, name: "Can S.", score: 15940, games: 212, avatar: "C", badge: "⭐" },
];

const tournaments = [
  {
    id: 1,
    name: "Okey Turnuvası",
    prize: "Hayır Sertifikası",
    participants: 128,
    maxParticipants: 256,
    startDate: "8 Mart 2026",
    status: "Kayıt Açık",
  },
  {
    id: 2,
    name: "Satranç Şampiyonası",
    prize: "Özel Rozet",
    participants: 64,
    maxParticipants: 128,
    startDate: "12 Mart 2026",
    status: "Kayıt Açık",
  },
];

export function Games() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900">Oyun Merkezi</h1>
        <p className="text-sm text-gray-600 mt-1">
          Arkadaşlarınla sosyalleş, oyna, eğlen
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Quick Play */}
        <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="mb-1 flex items-center gap-2">
                Hızlı Eşleşme
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-sm text-white/80">
                Anında uygun oyuncularla eşleş
              </p>
            </div>
          </div>
          <Link to="/okey-game">
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 h-12">
              Hemen Başla
            </Button>
          </Link>
        </Card>

        {/* Tournaments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              Aktif Turnuvalar
            </h3>
            <button className="text-xs text-gray-600">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                className="p-4 bg-white border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-gray-900 mb-1">{tournament.name}</h4>
                    <p className="text-xs text-gray-600">{tournament.startDate}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {tournament.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {tournament.participants}/{tournament.maxParticipants}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {tournament.prize}
                  </span>
                </div>
                <Button size="sm" className="w-full bg-gray-900 text-white h-9">
                  Turnuvaya Katıl
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* All Games */}
        <div>
          <h3 className="text-sm text-gray-700 mb-3">Tüm Oyunlar</h3>
          <div className="space-y-3">
            {games.map((game) => (
              <Link key={game.id} to="/okey-game">
                <Card className="p-4 bg-white border-gray-200 hover:border-gray-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {game.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-900">{game.name}</h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {game.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {game.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {game.players}
                        </span>
                        <span>•</span>
                        <span>{game.duration}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {game.popularity}%
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gray-900 text-white px-4">
                      Oyna
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Rooms */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Aktif Odalar</h3>
            <button className="text-xs text-gray-600">Yenile</button>
          </div>
          <div className="space-y-2">
            {activeRooms.map((room) => (
              <Card
                key={room.id}
                className="p-4 bg-white border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-gray-900 text-sm mb-1 flex items-center gap-2">
                      {room.game}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {room.level}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-600">
                      Oda Sahibi: {room.host}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      room.status === "Bekliyor"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>
                      {room.players}/{room.maxPlayers} Oyuncu
                    </span>
                    <span>•</span>
                    <span>{room.bet}</span>
                  </div>
                  {room.status === "Bekliyor" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Katıl
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Bu Ay Liderler</h3>
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <Card className="bg-white border-gray-200 divide-y divide-gray-200">
            {leaderboard.map((player) => (
              <div key={player.rank} className="p-3 flex items-center gap-3">
                <div className="text-2xl w-8 text-center">
                  {player.badge}
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-700">
                    {player.avatar}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{player.name}</p>
                  <p className="text-xs text-gray-600">{player.games} oyun</p>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  <span className="text-sm font-medium">{player.score.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
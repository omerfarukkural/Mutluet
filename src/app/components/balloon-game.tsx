import { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, Users, Trophy, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const players = [
  { id: 1, name: "Ayşe D.", avatar: "A", score: 0, online: true, mic: true, camera: false },
  { id: 2, name: "Mehmet K.", avatar: "M", score: 0, online: true, mic: true, camera: true },
  { id: 3, name: "Zeynep A.", avatar: "Z", score: 0, online: true, mic: false, camera: false },
  { id: 4, name: "Sen", avatar: "S", score: 0, online: true, mic: true, camera: true },
];

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  speed: number;
}

export function BalloonGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerStates, setPlayerStates] = useState(players);
  const [myMic, setMyMic] = useState(true);
  const [myCamera, setMyCamera] = useState(true);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (gameStarted) {
      // Generate initial balloons
      const initialBalloons: Balloon[] = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        color: ["bg-red-400", "bg-blue-400", "bg-yellow-400", "bg-green-400", "bg-purple-400"][
          Math.floor(Math.random() * 5)
        ],
        speed: Math.random() * 2 + 1,
      }));
      setBalloons(initialBalloons);

      // Timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  const handleBalloonPop = (balloonId: number) => {
    setBalloons((prev) => prev.filter((b) => b.id !== balloonId));
    setScore((prev) => prev + 10);
    
    // Add new balloon
    const newBalloon: Balloon = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      color: ["bg-red-400", "bg-blue-400", "bg-yellow-400", "bg-green-400", "bg-purple-400"][
        Math.floor(Math.random() * 5)
      ],
      speed: Math.random() * 2 + 1,
    };
    setBalloons((prev) => [...prev, newBalloon]);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[375px] mx-auto flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl text-gray-900">Balon Patlatma Odası</h1>
          <Link to="/games">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Players Grid */}
          <div>
            <h3 className="text-sm text-gray-700 mb-3">
              Oyuncular ({playerStates.length}/4)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {playerStates.map((player) => (
                <Card key={player.id} className="p-4 bg-white border-gray-200">
                  {/* Camera Preview */}
                  <div className="relative aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    {player.camera ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <Video className="w-8 h-8 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xl text-gray-600">
                            {player.avatar}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Mic Status */}
                    <div className="absolute bottom-2 left-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          player.mic ? "bg-gray-900" : "bg-red-500"
                        }`}
                      >
                        {player.mic ? (
                          <Mic className="w-3 h-3 text-white" />
                        ) : (
                          <MicOff className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Online Status */}
                    {player.online && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900">{player.name}</p>
                    <Trophy className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <h3 className="text-sm text-gray-700">Kontroller</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => setMyMic(!myMic)}
                variant={myMic ? "outline" : "destructive"}
                className="flex-1 h-12"
              >
                {myMic ? (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Mikrofon Açık
                  </>
                ) : (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Mikrofon Kapalı
                  </>
                )}
              </Button>
              <Button
                onClick={() => setMyCamera(!myCamera)}
                variant={myCamera ? "outline" : "destructive"}
                className="flex-1 h-12"
              >
                {myCamera ? (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    Kamera Açık
                  </>
                ) : (
                  <>
                    <VideoOff className="w-5 h-5 mr-2" />
                    Kamera Kapalı
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Game Info */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-gray-900 mb-2">Oyun Kuralları</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 60 saniye içinde en çok balonu patlatın</li>
              <li>• Her balon 10 puan değerinde</li>
              <li>• En yüksek puanı alan kazanır</li>
              <li>• Eğlenin!</li>
            </ul>
          </Card>

          {/* Start Button */}
          <Button
            onClick={() => setGameStarted(true)}
            className="w-full h-14 bg-gray-900 text-white hover:bg-gray-800"
          >
            Oyunu Başlat
          </Button>
        </div>
      </div>
    );
  }

  // Game Started
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 max-w-[375px] mx-auto flex flex-col">
      {/* Game Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-600">Süre</div>
              <div className="text-2xl text-gray-900">{timeLeft}s</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <div className="text-sm text-gray-600">Puan</div>
              <div className="text-2xl text-gray-900">{score}</div>
            </div>
          </div>
          <Link to="/games">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
        </div>
      </div>

      {/* Players Mini View */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {playerStates.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full flex-shrink-0"
            >
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs">{player.avatar}</span>
              </div>
              <span className="text-xs text-gray-700">{player.name.split(" ")[0]}</span>
              {player.mic ? (
                <Mic className="w-3 h-3 text-gray-600" />
              ) : (
                <MicOff className="w-3 h-3 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {balloons.map((balloon) => (
          <button
            key={balloon.id}
            onClick={() => handleBalloonPop(balloon.id)}
            className={`absolute w-16 h-20 ${balloon.color} rounded-full transition-all hover:scale-110 shadow-lg`}
            style={{
              left: `${balloon.x}%`,
              top: `${balloon.y}%`,
              animation: `float ${balloon.speed}s ease-in-out infinite`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🎈
            </div>
          </button>
        ))}

        {timeLeft === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Card className="p-8 bg-white border-gray-200 text-center max-w-xs">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl text-gray-900 mb-2">Oyun Bitti!</h2>
              <p className="text-gray-600 mb-6">Toplam Puanınız: {score}</p>
              <Link to="/games" className="block">
                <Button className="w-full bg-gray-900 text-white">
                  Ana Menü
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

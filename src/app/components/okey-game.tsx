import { useState, useEffect } from "react";
import { Mic, MicOff, MessageCircle, Settings, X, Users, Trophy } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Player {
  id: number;
  name: string;
  avatar: string;
  score: number;
  position: "bottom" | "left" | "top" | "right";
  mic: boolean;
  isTurn: boolean;
  tileCount: number;
}

interface Tile {
  id: string;
  color: "red" | "blue" | "black" | "yellow" | "joker";
  number: number | "J";
  isJoker?: boolean;
}

const players: Player[] = [
  { id: 1, name: "Sen", avatar: "S", score: 0, position: "bottom", mic: true, isTurn: true, tileCount: 14 },
  { id: 2, name: "Ayşe D.", avatar: "A", score: 120, position: "left", mic: true, isTurn: false, tileCount: 14 },
  { id: 3, name: "Mehmet K.", avatar: "M", score: 85, position: "top", mic: false, isTurn: false, tileCount: 14 },
  { id: 4, name: "Zeynep A.", avatar: "Z", score: 95, position: "right", mic: true, isTurn: false, tileCount: 14 },
];

const generateTiles = (): Tile[] => {
  const tiles: Tile[] = [];
  const colors: ("red" | "blue" | "black" | "yellow")[] = ["red", "blue", "black", "yellow"];
  
  for (let i = 0; i < 12; i++) {
    colors.forEach(color => {
      for (let num = 1; num <= 13; num++) {
        tiles.push({
          id: `${color}-${num}-${i}`,
          color,
          number: num,
        });
      }
    });
  }
  
  // Add jokers
  tiles.push({ id: "joker-1", color: "joker", number: "J", isJoker: true });
  tiles.push({ id: "joker-2", color: "joker", number: "J", isJoker: true });
  
  return tiles.sort(() => Math.random() - 0.5).slice(0, 14);
};

export function OkeyGame() {
  const [myTiles, setMyTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [myMic, setMyMic] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [centerTile, setCenterTile] = useState<Tile | null>(null);

  useEffect(() => {
    setMyTiles(generateTiles());
    setCenterTile({
      id: "center-1",
      color: "red",
      number: 7,
    });

    const timer = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTileColor = (color: Tile["color"]) => {
    switch (color) {
      case "red": return "text-red-600";
      case "blue": return "text-blue-600";
      case "black": return "text-gray-900";
      case "yellow": return "text-yellow-600";
      case "joker": return "text-purple-600";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sortedTiles = [...myTiles].sort((a, b) => {
    const colorOrder = { red: 0, blue: 1, black: 2, yellow: 3, joker: 4 };
    if (a.color !== b.color) {
      return colorOrder[a.color] - colorOrder[b.color];
    }
    if (typeof a.number === "number" && typeof b.number === "number") {
      return a.number - b.number;
    }
    return 0;
  });

  return (
    <div className="h-screen bg-gradient-to-b from-green-800 to-green-900 max-w-[375px] mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900/80 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/games">
            <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </Link>
          <div className="text-white">
            <div className="text-xs text-white/60">Okey Oyunu</div>
            <div className="text-sm font-medium">{formatTime(gameTime)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Top Player */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-2 rounded-full mb-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">{players[2].avatar}</span>
              </div>
              <div className="text-white">
                <div className="text-xs">{players[2].name}</div>
                <div className="text-xs text-white/60">{players[2].score} puan</div>
              </div>
              {players[2].mic ? (
                <Mic className="w-3 h-3 text-white" />
              ) : (
                <MicOff className="w-3 h-3 text-white/40" />
              )}
            </div>
            {/* Tiles - back view */}
            <div className="flex gap-0.5">
              {Array.from({ length: players[2].tileCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-8 bg-yellow-700 border border-yellow-800 rounded-sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Left Player */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: players[1].tileCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-5 bg-yellow-700 border border-yellow-800 rounded-sm"
                />
              ))}
            </div>
            <div className="bg-gray-900/80 px-2 py-3 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-sm">{players[1].avatar}</span>
              </div>
              <div className="text-white text-xs mb-1 writing-vertical-rl">
                {players[1].name}
              </div>
              <div className="text-white/60 text-xs">{players[1].score}</div>
              {players[1].mic && <Mic className="w-3 h-3 text-white mt-2" />}
            </div>
          </div>
        </div>

        {/* Right Player */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="flex items-start gap-2">
            <div className="bg-gray-900/80 px-2 py-3 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-sm">{players[3].avatar}</span>
              </div>
              <div className="text-white text-xs mb-1 writing-vertical-rl">
                {players[3].name}
              </div>
              <div className="text-white/60 text-xs">{players[3].score}</div>
              {players[3].mic && <Mic className="w-3 h-3 text-white mt-2" />}
            </div>
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: players[3].tileCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-5 bg-yellow-700 border border-yellow-800 rounded-sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center - Discard Pile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center gap-2">
            {/* Gösterge Taş */}
            <div className="bg-yellow-900/50 px-2 py-1 rounded text-white text-xs">
              Gösterge
            </div>
            {centerTile && (
              <div className={`w-12 h-16 bg-yellow-50 border-2 border-yellow-700 rounded flex items-center justify-center text-xl font-bold shadow-lg ${getTileColor(centerTile.color)}`}>
                {centerTile.number}
              </div>
            )}
            <div className="text-white text-xs bg-gray-900/50 px-2 py-1 rounded">
              Orta
            </div>
          </div>
        </div>

        {/* Draw Pile */}
        <div className="absolute bottom-32 right-4">
          <div className="relative">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-16 bg-yellow-700 border border-yellow-800 rounded absolute"
                style={{
                  top: `-${i * 2}px`,
                  left: `-${i * 2}px`,
                }}
              />
            ))}
            <div className="text-white text-xs text-center mt-20 bg-gray-900/50 px-2 py-1 rounded">
              68 taş
            </div>
          </div>
        </div>
      </div>

      {/* My Tiles */}
      <div className="bg-gray-900/90 px-2 py-3">
        {/* Player Info */}
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">{players[0].avatar}</span>
            </div>
            <div className="text-white">
              <div className="text-xs">{players[0].name}</div>
              <div className="text-xs text-white/60">{players[0].score} puan</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMyMic(!myMic)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                myMic ? "bg-gray-700" : "bg-red-500"
              }`}
            >
              {myMic ? (
                <Mic className="w-4 h-4 text-white" />
              ) : (
                <MicOff className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Tiles */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 pb-2 px-1 min-w-max">
            {sortedTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => setSelectedTile(selectedTile === tile.id ? null : tile.id)}
                className={`w-10 h-14 bg-yellow-50 border-2 rounded flex items-center justify-center text-lg font-bold transition-all ${
                  selectedTile === tile.id
                    ? "border-yellow-300 -translate-y-2 shadow-lg"
                    : "border-yellow-700"
                } ${getTileColor(tile.color)}`}
              >
                {tile.isJoker ? "★" : tile.number}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 bg-green-700 text-white border-green-600 hover:bg-green-600"
          >
            Çek
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 bg-red-700 text-white border-red-600 hover:bg-red-600"
            disabled={!selectedTile}
          >
            At
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 bg-blue-700 text-white border-blue-600 hover:bg-blue-600"
          >
            Okey
          </Button>
        </div>
      </div>

      {/* Chat Overlay */}
      {showChat && (
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gray-900/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white">Sohbet</h3>
            <button onClick={() => setShowChat(false)} className="text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 mb-3 overflow-y-auto h-32">
            <div className="text-sm text-white/80">
              <span className="text-blue-400">Ayşe:</span> İyi oyunlar!
            </div>
            <div className="text-sm text-white/80">
              <span className="text-green-400">Sen:</span> Size de!
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mesaj yaz..."
              className="flex-1 h-9 px-3 rounded bg-gray-800 text-white border border-gray-700 text-sm"
            />
            <Button size="sm" className="bg-blue-600 text-white">
              Gönder
            </Button>
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      {currentTurn === 1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            Sıra Sende!
          </div>
        </div>
      )}
    </div>
  );
}

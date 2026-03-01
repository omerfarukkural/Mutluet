import { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Users,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";

const participants = [
  { id: 1, name: "Ayşe D.", avatar: "A", mic: true, camera: true },
  { id: 2, name: "Mehmet K.", avatar: "M", mic: true, camera: false },
  { id: 3, name: "Zeynep A.", avatar: "Z", mic: false, camera: true },
];

export function VideoCall() {
  const [myMic, setMyMic] = useState(true);
  const [myCamera, setMyCamera] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");

  return (
    <div className="h-screen bg-gray-900 max-w-[375px] mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-white text-sm">Grup Görüşmesi</h2>
          <p className="text-gray-400 text-xs">
            {participants.length + 1} katılımcı
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
          >
            <Users className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-2 overflow-y-auto">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-2">
            {/* My Video */}
            <div className="relative aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
              {myCamera ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <Video className="w-12 h-12 text-gray-500" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white">S</span>
                  </div>
                </div>
              )}
              
              {/* Name Label */}
              <div className="absolute bottom-2 left-2 bg-gray-900/80 px-2 py-1 rounded">
                <span className="text-white text-xs">Sen</span>
              </div>

              {/* Mic Status */}
              <div className="absolute bottom-2 right-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    myMic ? "bg-gray-700" : "bg-red-500"
                  }`}
                >
                  {myMic ? (
                    <Mic className="w-3 h-3 text-white" />
                  ) : (
                    <MicOff className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Speaking Indicator */}
              {myMic && (
                <div className="absolute inset-0 border-2 border-green-500 rounded-lg animate-pulse"></div>
              )}
            </div>

            {/* Other Participants */}
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="relative aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden"
              >
                {participant.camera ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <Video className="w-12 h-12 text-gray-500" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-white">
                        {participant.avatar}
                      </span>
                    </div>
                  </div>
                )}

                {/* Name Label */}
                <div className="absolute bottom-2 left-2 bg-gray-900/80 px-2 py-1 rounded">
                  <span className="text-white text-xs">{participant.name}</span>
                </div>

                {/* Mic Status */}
                <div className="absolute bottom-2 right-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      participant.mic ? "bg-gray-700" : "bg-red-500"
                    }`}
                  >
                    {participant.mic ? (
                      <Mic className="w-3 h-3 text-white" />
                    ) : (
                      <MicOff className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Speaker View */
          <div className="space-y-2">
            {/* Main Speaker */}
            <div className="relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-white">A</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-gray-900/80 px-3 py-2 rounded">
                <span className="text-white">Ayşe D.</span>
              </div>
            </div>

            {/* Other Participants - Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto">
              <div className="flex-shrink-0 w-20 h-28 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">S</span>
              </div>
              {participants.slice(1).map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-20 h-28 bg-gray-800 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white text-xl">{p.avatar}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mic Toggle */}
          <button
            onClick={() => setMyMic(!myMic)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              myMic
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {myMic ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setMyCamera(!myCamera)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              myCamera
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {myCamera ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Chat */}
          <Link to="/chat">
            <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </Link>

          {/* End Call */}
          <Link to="/chat">
            <button className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </Link>
        </div>

        {/* Control Labels */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="w-14 text-center text-xs text-gray-400">
            {myMic ? "Mikrofon" : "Kapalı"}
          </span>
          <span className="w-14 text-center text-xs text-gray-400">
            {myCamera ? "Kamera" : "Kapalı"}
          </span>
          <span className="w-14 text-center text-xs text-gray-400">
            Sohbet
          </span>
          <span className="w-14 text-center text-xs text-gray-400">
            Çıkış
          </span>
        </div>
      </div>
    </div>
  );
}

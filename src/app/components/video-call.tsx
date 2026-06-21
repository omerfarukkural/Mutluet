import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Users, MessageCircle, ExternalLink } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { Button } from "./ui/button";

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si";

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: object) => {
      dispose: () => void;
      executeCommand: (cmd: string, ...args: unknown[]) => void;
      addListener: (event: string, handler: (e: unknown) => void) => void;
    };
  }
}

function useJitsiScript() {
  const [loaded, setLoaded] = useState(!!window.JitsiMeetExternalAPI);
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) return;
    const script = document.createElement("script");
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);
  return loaded;
}

interface VideoCallProps {
  roomId?: string;
  displayName?: string;
}

export function VideoCall({ roomId, displayName = "Misafir" }: VideoCallProps) {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const room = roomId ?? paramId ?? searchParams.get("room") ?? "mutluet-genel";

  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof window.JitsiMeetExternalAPI> | null>(null);
  const [inCall, setInCall] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  const jitsiReady = useJitsiScript();

  function startCall() {
    if (!jitsiReady || !containerRef.current) return;

    apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
      roomName: `mutluet-${room}`,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      userInfo: { displayName },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "chat", "participants-pane"],
        SHOW_JITSI_WATERMARK: false,
        MOBILE_APP_PROMO: false,
      },
    });

    apiRef.current.addListener("participantJoined", () => {
      setParticipantCount((n) => n + 1);
    });
    apiRef.current.addListener("participantLeft", () => {
      setParticipantCount((n) => Math.max(1, n - 1));
    });
    apiRef.current.addListener("videoConferenceLeft", endCall);

    setInCall(true);
  }

  function endCall() {
    apiRef.current?.dispose();
    apiRef.current = null;
    setInCall(false);
    setParticipantCount(1);
  }

  useEffect(() => () => { apiRef.current?.dispose(); }, []);

  return (
    <div className="h-screen bg-gray-900 max-w-[375px] mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-white text-sm">Grup Görüşmesi</h2>
          <p className="text-gray-400 text-xs">{participantCount} katılımcı · Oda: {room}</p>
        </div>
        <div className="flex gap-2 items-center">
          <a
            href={`https://${JITSI_DOMAIN}/mutluet-${room}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
            title="Tarayıcıda aç"
          >
            <ExternalLink className="w-4 h-4 text-white" />
          </a>
          <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Jitsi container */}
      <div className="flex-1 relative bg-gray-950">
        {inCall ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
              <Phone className="w-9 h-9 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Görüşmeye Katıl</p>
              <p className="text-gray-400 text-sm mt-1">Oda: <span className="text-gray-200">{room}</span></p>
              <p className="text-gray-500 text-xs mt-1">Jitsi Meet · Ücretsiz & Şifreli</p>
            </div>
            <Button
              onClick={startCall}
              disabled={!jitsiReady}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 mt-2"
            >
              {jitsiReady ? "Görüşmeyi Başlat" : "Yükleniyor..."}
            </Button>
            <a
              href={`https://${JITSI_DOMAIN}/mutluet-${room}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 text-xs underline"
            >
              Tarayıcıda aç
            </a>
          </div>
        )}
      </div>

      {/* Controls */}
      {inCall && (
        <div className="bg-gray-800 px-6 py-5">
          <div className="flex items-center justify-center gap-4">
            <Link to="/chat">
              <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
            </Link>
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="w-14 text-center text-xs text-gray-400">Sohbet</span>
            <span className="w-14 text-center text-xs text-gray-400">Çıkış</span>
          </div>
        </div>
      )}
    </div>
  );
}

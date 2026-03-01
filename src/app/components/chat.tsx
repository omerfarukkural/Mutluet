import { Send, Search, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const conversations = [
  {
    id: 1,
    name: "Ayşe Demir",
    lastMessage: "Etkinliğe katılacak mısın?",
    time: "10:30",
    unread: 2,
    online: true,
    avatar: "A",
  },
  {
    id: 2,
    name: "Mehmet Kaya",
    lastMessage: "Teşekkürler, yardımın için çok sağol",
    time: "Dün",
    unread: 0,
    online: false,
    avatar: "M",
  },
  {
    id: 3,
    name: "Destek Grubu",
    lastMessage: "Yeni etkinlik duyurusu",
    time: "Dün",
    unread: 5,
    online: true,
    avatar: "D",
  },
  {
    id: 4,
    name: "Zeynep Arslan",
    lastMessage: "Görüşmek üzere",
    time: "2 gün önce",
    unread: 0,
    online: true,
    avatar: "Z",
  },
];

export function Chat() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  if (selectedChat) {
    const chat = conversations.find((c) => c.id === selectedChat);
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)}>
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-700">{chat?.avatar}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900">{chat?.name}</h2>
              <p className="text-xs text-gray-600">
                {chat?.online ? "Çevrimiçi" : "Çevrimdışı"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <Link to="/video-call">
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {/* Sample Messages */}
          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2">
              <p className="text-sm text-gray-900">Merhaba! Nasılsın?</p>
              <span className="text-xs text-gray-500 mt-1">09:15</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="max-w-[70%] bg-gray-900 rounded-2xl rounded-tr-none px-4 py-2">
              <p className="text-sm text-white">İyiyim, teşekkürler! Sen nasılsın?</p>
              <span className="text-xs text-gray-400 mt-1">09:16</span>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2">
              <p className="text-sm text-gray-900">{chat?.lastMessage}</p>
              <span className="text-xs text-gray-500 mt-1">{chat?.time}</span>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Mesaj yazın..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 h-10 border-gray-300 rounded-full"
            />
            <Button
              size="icon"
              className="w-10 h-10 bg-gray-900 text-white rounded-full"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900 mb-4">Mesajlar</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Sohbet ara..."
            className="pl-10 h-11 border-gray-300"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => setSelectedChat(conversation.id)}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-100 transition-colors bg-white"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-700">{conversation.avatar}</span>
              </div>
              {conversation.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-gray-900">{conversation.name}</h3>
                <span className="text-xs text-gray-500">{conversation.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </p>
                {conversation.unread > 0 && (
                  <span className="ml-2 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                    {conversation.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

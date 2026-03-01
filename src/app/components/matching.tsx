import { X, Heart, MapPin, Users, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const profiles = [
  {
    id: 1,
    name: "Ayşe D.",
    age: 28,
    interests: ["Eğitim", "Gönüllülük", "Doğa"],
    location: "İstanbul, Kadıköy",
    bio: "Eğitim alanında gönüllü çalışmalar yapmayı seviyorum",
    matchScore: 92,
    avatar: "A",
    volunteeredHours: 45,
  },
  {
    id: 2,
    name: "Mehmet K.",
    age: 32,
    interests: ["Spor", "Toplum Hizmeti", "Teknoloji"],
    location: "İstanbul, Beşiktaş",
    bio: "Topluma faydalı projeler geliştirmeyi hedefliyorum",
    matchScore: 87,
    avatar: "M",
    volunteeredHours: 62,
  },
  {
    id: 3,
    name: "Zeynep A.",
    age: 25,
    interests: ["Sanat", "Eğitim", "Çocuk Gelişimi"],
    location: "İstanbul, Üsküdar",
    bio: "Çocuklara sanat eğitimi vermek istiyorum",
    matchScore: 85,
    avatar: "Z",
    volunteeredHours: 38,
  },
];

export function Matching() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);

  const handleLike = () => {
    setMatches([...matches, profiles[currentIndex].id]);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePass = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentProfile = profiles[currentIndex];

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2">
            Profilleri Tamamladınız!
          </h2>
          <p className="text-gray-600 mb-6">
            {matches.length} eşleşme yaptınız
          </p>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setMatches([]);
            }}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            Baştan Başla
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900">Eşleşme</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ortak ilgi alanlarına sahip gönüllülerle tanışın
        </p>
      </div>

      <div className="px-6 py-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {currentIndex + 1} / {profiles.length}
            </span>
            <span>{matches.length} Eşleşme</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all"
              style={{
                width: `${((currentIndex + 1) / profiles.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Profile Card */}
        <Card className="bg-white border-gray-200 overflow-hidden mb-6">
          {/* Profile Image Placeholder */}
          <div className="h-80 bg-gray-200 flex items-center justify-center relative">
            <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-6xl text-gray-600">
                {currentProfile.avatar}
              </span>
            </div>
            <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 rounded-full text-sm">
              {currentProfile.matchScore}% Uyum
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <h2 className="text-2xl text-gray-900 mb-1">
              {currentProfile.name}, {currentProfile.age}
            </h2>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{currentProfile.location}</span>
            </div>

            <p className="text-gray-700 mb-4">{currentProfile.bio}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentProfile.volunteeredHours} saat gönüllülük</span>
              </div>
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-sm text-gray-700 mb-2">İlgi Alanları</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handlePass}
            size="lg"
            variant="outline"
            className="flex-1 h-14 border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <X className="w-6 h-6 mr-2" />
            Geç
          </Button>
          <Link to="/games" className="flex-1">
            <Button
              onClick={handleLike}
              size="lg"
              className="w-full h-14 bg-gray-900 text-white hover:bg-gray-800"
            >
              <Heart className="w-6 h-6 mr-2" />
              Eşleş
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

import { useState } from "react";
import { ChevronRight, Users, DollarSign, CalendarDays } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";

const slides = [
  {
    icon: Users,
    title: "Hoş Geldiniz",
    description: "Gönüllü olarak topluluğumuza katılın ve fark yaratın",
  },
  {
    icon: DollarSign,
    title: "Bağış Yapın",
    description: "Güvenli ve kolay bağış sistemimizle destek olun",
  },
  {
    icon: CalendarDays,
    title: "Etkinliklere Katılın",
    description: "Yaklaşan etkinlikleri keşfedin ve aramıza katılın",
  },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-[375px] mx-auto px-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Icon Illustration */}
        <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center mb-8">
          <Icon className="w-24 h-24 text-gray-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl mb-4 text-gray-900">
          {currentSlideData.title}
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-12 max-w-sm">
          {currentSlideData.description}
        </p>

        {/* Pagination Dots */}
        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-gray-900"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="w-full pb-8">
        {currentSlide < slides.length - 1 ? (
          <Button
            onClick={handleNext}
            className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12"
          >
            Devam
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        ) : (
          <Link to="/login" className="block w-full">
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12">
              Başlayın
            </Button>
          </Link>
        )}

        <Link to="/login">
          <button className="w-full mt-4 text-gray-600 text-sm">
            Atla
          </button>
        </Link>
      </div>
    </div>
  );
}

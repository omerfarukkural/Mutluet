import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 max-w-[375px] mx-auto text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
      <p className="text-gray-500 text-sm mb-8">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <div className="flex flex-col gap-3 w-full">
        <Link to="/home">
          <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12">
            <Home className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 w-full h-12 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
      </div>
    </div>
  );
}

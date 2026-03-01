import { Mail } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function Login() {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[375px] mx-auto px-6">
      <div className="flex-1 flex flex-col justify-center">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">B</span>
          </div>
          <h1 className="text-2xl text-gray-900">Bitebimuv</h1>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              E-posta
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              className="h-12 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Şifre
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 border-gray-300"
            />
          </div>

          <Link to="/home" className="block">
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12">
              Giriş Yap
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-700"
          >
            <Mail className="mr-2 w-5 h-5" />
            Magic Link ile Giriş
          </Button>

          <div className="text-center">
            <Link to="/home" className="text-gray-600 text-sm hover:text-gray-900">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <p className="text-xs text-gray-500">
          Giriş yaparak{" "}
          <span className="underline">Kullanım Şartlarını</span> kabul
          ediyorsunuz
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "../../lib/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Uses magic link endpoint as password reset mechanism
      await api.magicLink(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[375px] mx-auto px-6">
      <div className="pt-12 pb-6">
        <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">E-posta Gönderildi</h1>
            <p className="text-gray-500 text-sm mb-8">
              <strong>{email}</strong> adresine giriş bağlantısı gönderdik. Birkaç dakika içinde gelmezse spam klasörünü kontrol edin.
            </p>
            <Link to="/login">
              <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12">
                Giriş Sayfasına Dön
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h1>
              <p className="text-sm text-gray-500 mt-2">
                E-posta adresinizi girin, size giriş bağlantısı gönderelim.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className="h-12 border-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12"
                disabled={loading}
              >
                {loading ? "Gönderiliyor..." : "Bağlantı Gönder"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Şifrenizi hatırladınız mı?{" "}
              <Link to="/login" className="text-gray-900 font-medium hover:underline">
                Giriş yapın
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

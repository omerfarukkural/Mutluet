import { useState, useEffect } from "react";
import { ArrowLeft, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "../../lib/api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Geçersiz bağlantı. Lütfen tekrar şifre sıfırlama isteği yapın.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalıdır"); return; }
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return; }
    setLoading(true);
    try {
      await api.resetPassword(token!, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu, bağlantı süresi dolmuş olabilir");
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
        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Şifre Güncellendi</h1>
            <p className="text-gray-500 text-sm mb-8">Yeni şifrenizle giriş yapabilirsiniz. Yönlendiriliyorsunuz...</p>
            <Link to="/login">
              <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12">Giriş Yap</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Şifre</h1>
              <p className="text-sm text-gray-500 mt-2">En az 6 karakterli yeni bir şifre belirleyin.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Yeni Şifre</Label>
                <Input id="password" type="password" placeholder="En az 6 karakter" className="h-12 border-gray-300" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Şifre Tekrar</Label>
                <Input id="confirm" type="password" placeholder="Şifreyi tekrar girin" className="h-12 border-gray-300" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12" disabled={loading || !token}>
                {loading ? "Güncelleniyor..." : "Şifremi Güncelle"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

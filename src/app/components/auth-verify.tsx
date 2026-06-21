import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Geçersiz bağlantı");
      return;
    }

    api.verifyMagicLink(token)
      .then((response) => {
        loginWithToken(response.token, response.user as any);
        setStatus("success");
        setMessage("Giriş başarılı! Yönlendiriliyorsunuz...");
        setTimeout(() => navigate("/home"), 1500);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Bağlantı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Doğrulanıyor...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hoş Geldiniz!</h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Doğrulama Başarısız</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <a href="/login" className="text-gray-900 font-medium underline text-sm">Giriş sayfasına dön</a>
          </>
        )}
      </div>
    </div>
  );
}

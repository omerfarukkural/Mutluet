import { useState } from "react";
import { CreditCard, Wallet, Building2, DollarSign } from "lucide-react";
import { BottomNav } from "./bottom-nav";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const presetAmounts = [50, 100, 250, 500];

const paymentMethods = [
  { id: "card", name: "Kredi Kartı", icon: CreditCard },
  { id: "wallet", name: "Dijital Cüzdan", icon: Wallet },
  { id: "bank", name: "Banka Transferi", icon: Building2 },
];

export function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("card");

  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl text-gray-900">Bağış Yap</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Impact Card */}
        <Card className="p-6 bg-white border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">₺45,780</div>
              <div className="text-sm text-gray-600">Bu ay toplanan</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Katkılarınız sayesinde 150 aileye yardım ulaştırdık
          </p>
        </Card>

        {/* Amount Selector */}
        <div className="space-y-3">
          <Label className="text-gray-700">Bağış Tutarı</Label>
          
          {/* Preset Amounts */}
          <div className="grid grid-cols-2 gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetAmount(amount)}
                className={`h-14 rounded-lg border-2 transition-all ${
                  selectedAmount === amount
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                ₺{amount}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom" className="text-sm text-gray-600">
              veya özel tutar
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₺
              </span>
              <Input
                id="custom"
                type="number"
                placeholder="0"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="pl-8 h-12 border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <Label className="text-gray-700">Ödeme Yöntemi</Label>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full h-14 px-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                    selectedPayment === method.id
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{method.name}</span>
                  <div
                    className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPayment === method.id
                        ? "border-gray-900"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedPayment === method.id && (
                      <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Donate Button */}
        <Button className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800">
          Bağış Yap
        </Button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          Tüm bağışlar güvenli bir şekilde işlenir. Fatura ve makbuz
          e-posta adresinize gönderilecektir.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

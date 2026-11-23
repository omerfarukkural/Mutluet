# 🧹 AZURE TEMİZLİK REHBERİ (CHECKLIST)

Eski WordPress kurulumundan kalan ve şu an ihtiyaç duyulmayan kaynakları silerek maliyetleri düşürebilir ve Azure panelini sadeleştirebilirsiniz.

### ⚠️ Önemli Not
Bu kaynakları silmeden önce içinde önemli bir veriniz (eski WordPress yazıları vb.) olmadığından emin olun. Vercel ve Supabase kullandığımız için bu kaynaklar şu anki sistem için **gereksizdir**.

---

## 🗑️ Silinecek Kaynaklar

Aşağıdaki kaynakları **Azure Portal** üzerinden tek tek veya Resource Group içinden silebilirsiniz:

- [ ] **App Service:** `mutluet-org` (Eski WordPress sitesi)
- [ ] **App Service Plan:** `ASP-mutluetprodrg-bd6c` (Web App'in çalıştığı sunucu planı)
- [ ] **Azure Database for MySQL:** `mutluetorg-e199c11f12-wpdbserver` (WordPress veritabanı)
- [ ] **Managed Identity:** `mutluetorg-e199c11f12-wpidentity` (WordPress kimlik yönetimi)

## 🛠️ Nasıl Silinir?

1. [Azure Portal](https://portal.azure.com)'a giriş yapın.
2. Sol menüden **Resource groups** sekmesine gidin.
3. `mutluet-prod-rg` (veya benzer isimli WordPress grubu) grubunu seçin.
4. Yukarıdaki listedeki kaynakları seçin ve **Delete** butonuna basın.
5. Onay için kaynak adlarını yazmanız istenebilir.

---
*Hazırlayan: Gemini CLI*

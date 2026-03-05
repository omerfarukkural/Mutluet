# 🎯 SENİN YAPMAN GEREKENLER - ÖMER FARUK BEY

## 📋 ÖZET

Backend kodu tamamen hazır! Şimdi Azure Portal'da altyapı kurulumunu yapman ve birkaç ayar yapman gerekiyor.

---

## ✅ TAMAMLANAN İŞLER (Claude Code Tarafından)

1. ✅ **Azure Key Vault Entegrasyonu**
   - `backend/src/config/azure-secrets.ts` - Key Vault client
   - Production'da otomatik secret yükleme

2. ✅ **Application Insights Monitoring**
   - `backend/src/config/monitoring.ts` - Monitoring setup
   - Hata takibi ve performans izleme

3. ✅ **WordPress SSO Backend**
   - `backend/src/routes/wordpress.ts` - SSO endpoints
   - JWT token generation ve verification

4. ✅ **OAuth Entegrasyonları**
   - `backend/src/routes/oauth.ts` - Google, Facebook, TikTok, Azure AD
   - Otomatik kullanıcı oluşturma/güncelleme

5. ✅ **Backend Güncellemeleri**
   - `backend/src/index.ts` - Tüm yeni route'lar eklendi
   - Async başlatma ve monitoring aktif

6. ✅ **GitHub Actions CI/CD**
   - `.github/workflows/backend-deploy.yml` - Backend otomatik deploy
   - `.github/workflows/frontend-deploy.yml` - Frontend otomatik deploy
   - `.github/workflows/tests.yml` - Test ve linting

7. ✅ **Frontend WordPress Butonu**
   - `src/lib/wordpress-sso.ts` - SSO logic
   - `src/app/components/wordpress-button.tsx` - UI bileşeni
   - Profil sayfasına eklendi

8. ✅ **Environment Variables**
   - Backend ve frontend `.env.example` dosyaları güncellendi

---

## 🚀 YAPMAN GEREKEN ADIMLAR

### **AŞAMA 1: Azure Portal Kurulumu** (45-60 dakika)

#### 1. Azure Hesap Kontrolü (5 dakika)
```
1. https://portal.azure.com açılıyor mu?
2. Sol menü > Subscriptions > Subscription aktif mi?
3. Cost Management + Billing > $2000 kredi görünüyor mu?
```

**Sorun yaşarsan:**
- Azure for Students'ı aktifleştir: https://azure.microsoft.com/en-us/free/students/
- GitHub Student Pack üzerinden de aktifleştirebilirsin

---

#### 2. Resource Group Oluştur (2 dakika)
```
Azure Portal > Resource groups > + Create

- Resource group: mutluet-rg
- Region: West Europe (veya Canada Central)
- [Review + Create] > [Create]
```

---

#### 3. Azure Key Vault Oluştur (5 dakika)
```
Azure Portal > Create a resource > "Key Vault" ara

Basics:
- Vault name: mutluet-vault
- Resource group: mutluet-rg
- Region: West Europe
- Pricing tier: Standard

[Review + Create] > [Create]
```

**Sırları Ekle:**
```
Key Vault (mutluet-vault) > Secrets > + Generate/Import

Eklenecek Sırlar:

1. DATABASE-URL
   Value: (Supabase'den al - aşağıda açıklandı)

2. JWT-SECRET
   Value: (Terminal'de oluştur - aşağıda açıklandı)

3. WORDPRESS-JWT-SECRET
   Value: (Terminal'de oluştur - aşağıda açıklandı)

4. GOOGLE-CLIENT-ID (şimdilik boş bırakılabilir)
   Value: your-google-client-id

5. GOOGLE-CLIENT-SECRET (şimdilik boş bırakılabilir)
   Value: your-google-client-secret

6. STRIPE-SECRET-KEY (şimdilik boş bırakılabilir)
   Value: sk_test_...
```

**Secret Oluşturma Komutları (Terminal):**
```bash
# JWT Secret oluştur
openssl rand -hex 32

# WordPress JWT Secret oluştur
openssl rand -hex 32

# Bu komutların çıktılarını Key Vault'a ekle
```

---

#### 4. App Service (Backend) Oluştur (10 dakika)
```
Azure Portal > Create a resource > "Web App" ara

Basics:
- Name: mutluet-backend
- Resource Group: mutluet-rg
- Publish: Code
- Runtime stack: Node 22 LTS
- Operating System: Linux
- Region: West Europe

App Service Plan:
- Name: mutluet-plan
- Pricing: Basic B1 (~$55/month)

[Review + Create] > [Create]
```

**Managed Identity Aktif Et:**
```
App Service (mutluet-backend) > Settings > Identity
- System assigned: On
- [Save]
- Principal ID'yi kopyala (bir yere not et)
```

**Environment Variables Ekle:**
```
App Service > Configuration > Application Settings > + New application setting

Eklenecekler:

1. NODE_ENV = production
2. PORT = 8080
3. AZURE_KEY_VAULT_URL = https://mutluet-vault.vault.azure.net/
4. FRONTEND_URL = (Static Web App'ten sonra eklenecek)
5. WORDPRESS_URL = https://mutluet.org

[Save] > [Continue]
```

---

#### 5. Key Vault Access Policy (5 dakika)
```
Key Vault (mutluet-vault) > Access policies > + Create

Permissions:
- Secret permissions: Get, List seç

Principal:
- Search box'a "mutluet-backend" yaz
- App Service'i seç
- [Select]

[Review + Create] > [Create]
```

---

#### 6. Static Web App (Frontend) Oluştur (10 dakika)
```
Azure Portal > Create a resource > "Static Web App" ara

Basics:
- Name: mutluet-frontend
- Resource group: mutluet-rg
- Region: West Europe

Deployment:
- Source: GitHub
- [Sign in with GitHub]
- Organization: omerfarukkural
- Repository: Mutluet
- Branch: main
- Build Presets: Custom
- App location: /
- Output location: dist

[Review + Create] > [Create]
```

**⚠️ ÖNEMLI:** Deploy tamamlandıktan sonra URL'yi kopyala (örn: https://mutluet-frontend-xxxxx.azurestaticapps.net)

**Environment Variables Ekle:**
```
Static Web App (mutluet-frontend) > Configuration > Application settings

Add:
- VITE_API_URL = https://mutluet-backend.azurewebsites.net/api
- VITE_WORDPRESS_URL = https://mutluet.org

[Save]
```

**Backend'e Frontend URL'sini Ekle:**
```
App Service (mutluet-backend) > Configuration > Application Settings

FRONTEND_URL değerini güncelle:
- FRONTEND_URL = https://mutluet-frontend-xxxxx.azurestaticapps.net

[Save] > [Continue]
```

---

#### 7. Application Insights Oluştur (5 dakika)
```
Azure Portal > Create a resource > "Application Insights" ara

- Name: mutluet-insights
- Resource Group: mutluet-rg
- Region: West Europe

[Review + Create] > [Create]

Oluşturulduktan sonra:
- Overview > Connection String'i kopyala
```

**Backend'e Ekle:**
```
App Service (mutluet-backend) > Configuration > Application Settings

Add:
- APPLICATIONINSIGHTS_CONNECTION_STRING = (kopyaladığın connection string)

[Save] > [Continue]
```

---

### **AŞAMA 2: Supabase Database URL** (2 dakika)

```
1. https://supabase.com/dashboard açılıyor
2. Projen: mutluet (veya mevcut proje adı)
3. Settings > Database
4. Connection String > URI
5. Şu formatta olacak:
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

6. Şifreyi değiştir (kendi şifren)

7. Azure Key Vault'a ekle:
   Key Vault > Secrets > DATABASE-URL
   Value: (kopyaladığın URL)
```

---

### **AŞAMA 3: GitHub Secrets Ekle** (5 dakika)

#### Backend Publish Profile
```
1. Azure Portal > App Service (mutluet-backend)
2. Overview > Get publish profile (Download butonu)
3. İndirilen .PublishSettings dosyasını aç
4. İçeriği kopyala (tüm XML içeriği)

5. GitHub'da:
   https://github.com/omerfarukkural/Mutluet > Settings > Secrets and variables > Actions

6. New repository secret:
   - Name: AZURE_BACKEND_PUBLISH_PROFILE
   - Value: (kopyaladığın publish profile)
   [Add secret]
```

#### Static Web App Token
```
1. Azure Portal > Static Web App (mutluet-frontend)
2. Overview > Manage deployment token
3. Token'ı kopyala

4. GitHub > Settings > Secrets > New repository secret:
   - Name: AZURE_STATIC_WEB_APPS_TOKEN
   - Value: (token)
   [Add secret]
```

---

### **AŞAMA 4: İlk Deployment** (10 dakika)

```bash
# Lokal terminalden
cd ~/Mutluet

# Değişiklikleri commit et
git add .
git commit -m "feat: Add Azure integrations and CI/CD workflows"
git push origin main
```

**GitHub Actions'ı İzle:**
```
1. GitHub'da projeye git
2. Actions sekmesi
3. Backend Deploy ve Frontend Deploy workflow'larını izle
4. Her ikisi de ✓ olmalı (3-5 dakika sürebilir)
```

---

### **AŞAMA 5: Test Et** (5 dakika)

#### Backend Health Check
```
1. Tarayıcıda aç: https://mutluet-backend.azurewebsites.net/health

Beklenen çıktı:
{
  "status": "ok",
  "timestamp": "2026-03-06T..."
}
```

#### Frontend Kontrolü
```
1. Tarayıcıda aç: https://mutluet-frontend-xxxxx.azurestaticapps.net

2. Uygulama açılıyor mu?
3. Login sayfası görünüyor mu?
4. Kayıt ol ve giriş yap dene
```

---

### **AŞAMA 6: Production Database Migration** (5 dakika)

```bash
# Lokal terminalden
cd ~/Mutluet/backend

# Database URL'ini geçici olarak kullan (Key Vault'tan aldığın)
export DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Prisma migration'ları çalıştır
pnpm prisma migrate deploy

# Başarılı olmalı: ✓ Migrations deployed
```

---

### **AŞAMA 7: WordPress Plugin Kurulumu** (Opsiyonel - 30 dakika)

Bu adım şimdilik atlanabilir, WordPress entegrasyonunu sonra kurabilirsin.

Detaylar için: `WORDPRESS_SSO_PLAN.md` dosyasına bak.

---

## 🎉 TAMAMLANDIĞINDA

### Kontrol Listesi
- ✅ Backend çalışıyor: https://mutluet-backend.azurewebsites.net/health
- ✅ Frontend açılıyor: https://mutluet-frontend-xxxxx.azurestaticapps.net
- ✅ Kullanıcı kaydı/girişi çalışıyor
- ✅ GitHub Actions otomatik deploy ediyor
- ✅ Application Insights'ta loglar görünüyor

### Sonraki Adımlar (Opsiyonel)
1. **Custom Domain Bağlama:**
   - Static Web App > Custom domains > mutluet.org
   - App Service > Custom domains > api.mutluet.org

2. **Google OAuth Kurulumu:**
   - Google Cloud Console'da OAuth credentials oluştur
   - Key Vault'a GOOGLE-CLIENT-ID ve GOOGLE-CLIENT-SECRET ekle

3. **WordPress SSO:**
   - `WORDPRESS_SSO_PLAN.md` dosyasındaki adımları takip et

4. **n8n Automation:**
   - `AZURE_ENTEGRASYON_PLANI.md` dosyasında VM kurulum detayları var

---

## 🆘 SORUN YAŞARSAN

### Backend Çalışmıyor
```
1. Azure Portal > App Service > Log stream
   - Hata mesajlarını oku

2. Managed Identity doğru ayarlanmış mı?
   - App Service > Identity > System assigned: On

3. Key Vault access policy doğru mu?
   - Key Vault > Access policies > mutluet-backend var mı?

4. Environment variables doğru mu?
   - App Service > Configuration > Application Settings kontrol et
```

### Frontend Çalışmıyor
```
1. GitHub Actions loglarına bak:
   - GitHub > Actions > Frontend Deploy > Son workflow

2. Static Web App > Environments > Production
   - Build logs kontrol et

3. Environment variables eklenmiş mi?
   - Static Web App > Configuration > VITE_API_URL var mı?
```

### Database Bağlantı Hatası
```
1. Supabase'de project aktif mi?
   - https://supabase.com/dashboard

2. Database URL doğru mu?
   - Key Vault > Secrets > DATABASE-URL'yi kontrol et

3. IP whitelist var mı?
   - Supabase > Settings > Database > Connection pooling
   - "Allow all" seçeneğini aktif et (geliştirme için)
```

---

## 📞 DESTEK

Takıldığında:
1. Azure Portal'da hata loglarına bak
2. GitHub Actions loglarını kontrol et
3. Application Insights'ta exception'ları ara
4. Screenshot al ve bana at

---

## 🎯 ÖZETLESİM

**Toplam Süre:** 1.5-2 saat

**Kritik Adımlar:**
1. Resource Group oluştur
2. Key Vault oluştur ve sırları ekle
3. App Service oluştur (Backend)
4. Static Web App oluştur (Frontend)
5. GitHub Secrets ekle
6. Push ve deploy izle
7. Test et

**Maliyet:** ~$135/ay (15 ay boyunca $2000 kredi ile ücretsiz)

---

**Hazırlayan:** Claude Code
**Tarih:** 6 Mart 2026
**Proje:** Mutluet İyilik Fabrikası

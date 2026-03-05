# 🎯 MUTLUET TAM KURULUM SIRALAMASı - ADIM ADIM

## 📋 Genel Bakış

Bu rehber, mevcut projeyi Azure'da çalışan, WordPress ile entegre, tamamen otomatikleşmiş bir sisteme dönüştürmek için gerekli **TÜM** adımları içerir.

---

## ✅ BENİM YAPABİLECEKLERİM (Claude Code)

### 1. ✅ Proje Kontrolü ve Hazırlık (TAMAMLANDI)
- [x] QUICK_START.sh çalıştırıldı
- [x] Prisma schema kontrol edildi
- [x] Bağımlılıklar kontrol edildi
- [x] AI talimatları dosyası oluşturuldu (`.cursor/rules`)
- [x] WordPress SSO planı hazırlandı
- [x] Azure entegrasyon planı hazırlandı

### 2. Azure Key Vault Backend Entegrasyonu (ŞİMDİ YAPABİLİRİM)

```bash
# Gerekli paketleri yükle
cd backend
pnpm add @azure/keyvault-secrets @azure/identity
```

**Dosyalar oluşturulacak:**
- `backend/src/config/azure-secrets.ts` - Key Vault client
- `backend/src/config/monitoring.ts` - Application Insights

### 3. WordPress SSO Backend Endpoint (ŞİMDİ YAPABİLİRİM)

**Dosyalar oluşturulacak:**
- `backend/src/routes/wordpress.routes.ts` - WordPress token endpoint
- Frontend'e `src/utils/wordpress-sso.ts` - Redirect fonksiyonu

### 4. GitHub Actions Workflow (ŞİMDİ YAPABİLİRİM)

**Dosyalar oluşturulacak:**
- `.github/workflows/backend-deploy.yml`
- `.github/workflows/frontend-deploy.yml`

### 5. Kod Güncellemeleri (ŞİMDİ YAPABİLİRİM)

- `backend/src/index.ts` güncelle (Key Vault + Monitoring)
- `backend/src/middleware/auth.ts` güncelle (Key Vault JWT secret)
- Environment dosyalarına Azure değişkenleri ekle

---

## 🙋 SENİN YAPMAN GEREKENLER (Ömer)

### AŞAMA 1: Azure Portal Kurulumu (45-60 dakika)

#### 1.1. Azure Hesap ve Kredi Kontrolü (5 dk)
- [ ] https://portal.azure.com açılıyor mu?
- [ ] Subscription aktif mi? (Sol menü > Subscriptions)
- [ ] Kredi bakiyesi kontrol et (Cost Management + Billing)
- [ ] **Beklenen:** $2000 kredi görünmeli

#### 1.2. Resource Group Oluştur (2 dk)
```
Azure Portal > Resource groups > Create
- Resource group: mutluet-rg
- Region: West Europe
- [Review + Create] > [Create]
```

#### 1.3. Azure Key Vault Oluştur (5 dk)
```
Azure Portal > Create a resource > Key Vault
- Vault name: mutluet-vault
- Resource group: mutluet-rg
- Region: West Europe
- Pricing tier: Standard
- [Review + Create] > [Create]
```

**Sırları Ekle:**
```
Key Vault > Secrets > Generate/Import

1. DATABASE-URL
   Value: (Supabase connection string'ini kopyala)

2. JWT-SECRET
   Value: mutluet-production-jwt-secret-2026-$(rastgele karakter)

3. WORDPRESS-JWT-SECRET
   Value: wordpress-sso-secret-2026-$(rastgele karakter)

4. STRIPE-SECRET-KEY (şimdilik boş bırakılabilir)
   Value: sk_test_...

5. GOOGLE-CLIENT-ID (şimdilik boş bırakılabilir)
   Value: your-google-client-id
```

#### 1.4. App Service Plan ve Backend Oluştur (10 dk)
```
Azure Portal > Create a resource > Web App

Basic:
- Name: mutluet-backend
- Resource Group: mutluet-rg
- Publish: Code
- Runtime stack: Node 22 LTS
- Operating System: Linux
- Region: West Europe

Pricing:
- Pricing Plan: Basic B1 (~$55/month)

[Review + Create] > [Create]
```

**Managed Identity Aktif Et:**
```
App Service > Settings > Identity
- System assigned: On
- [Save]
- Principal ID'yi kopyala (sonra lazım olacak)
```

**Environment Variables Ekle:**
```
App Service > Configuration > Application Settings

New application setting:
1. NODE_ENV = production
2. PORT = 8080
3. AZURE_KEY_VAULT_URL = https://mutluet-vault.vault.azure.net/
4. FRONTEND_URL = (şimdilik boş, Static Web App'ten sonra eklenecek)
```

#### 1.5. Key Vault Access Policy Ver (5 dk)
```
Key Vault (mutluet-vault) > Access policies > Create

Permissions:
- Secret permissions: Get, List

Principal:
- (App Service'in Principal ID'sini ara: mutluet-backend)
- [Select]

[Review + Create] > [Create]
```

#### 1.6. Static Web App Oluştur (Frontend) (10 dk)
```
Azure Portal > Create a resource > Static Web App

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

**Environment Variables:**
```
Static Web App > Configuration > Application settings

Add:
- VITE_API_URL = https://mutluet-backend.azurewebsites.net/api
```

#### 1.7. Application Insights Oluştur (5 dk)
```
Azure Portal > Create a resource > Application Insights

- Name: mutluet-insights
- Resource Group: mutluet-rg
- Region: West Europe

[Review + Create] > [Create]

Connection string'i kopyala:
- Application Insights > Overview > Connection String
```

**Backend'e Ekle:**
```
App Service (mutluet-backend) > Configuration > Application Settings

Add:
- APPLICATIONINSIGHTS_CONNECTION_STRING = (kopyaladığın connection string)
```

---

### AŞAMA 2: GitHub Secrets Ekle (5 dk)

#### 2.1. Backend Publish Profile
```
1. Azure Portal > App Service (mutluet-backend)
2. Overview > Get publish profile (Download)
3. Dosyayı aç, içeriği kopyala

4. GitHub > Mutluet repository > Settings > Secrets and variables > Actions
5. New repository secret:
   - Name: AZURE_BACKEND_PUBLISH_PROFILE
   - Value: (kopyaladığın publish profile)
```

#### 2.2. Static Web App Token
```
1. Azure Portal > Static Web App (mutluet-frontend)
2. Overview > Manage deployment token
3. Token'ı kopyala

4. GitHub > Settings > Secrets
5. New repository secret:
   - Name: AZURE_STATIC_WEB_APPS_TOKEN
   - Value: (token)
```

---

### AŞAMA 3: Supabase Database URL'sini Al (2 dk)

```
1. https://supabase.com/dashboard açılıyor
2. Projen: mutluet-db (veya mevcut)
3. Settings > Database
4. Connection String > URI
5. Kopyala: postgresql://postgres:[PASSWORD]@db.abc123.supabase.co:5432/postgres

6. Azure Key Vault'a ekle:
   - Key Vault > Secrets > DATABASE-URL
   - Value: (kopyaladığın URL)
```

---

### AŞAMA 4: n8n Otomasyon VM'i (Opsiyonel - 30 dk)

#### 4.1. Ubuntu VM Oluştur
```
Azure Portal > Create a resource > Virtual machine

Basics:
- VM name: mutluet-automation
- Resource group: mutluet-rg
- Region: West Europe
- Image: Ubuntu Server 22.04 LTS
- Size: Standard_B1s (~$30/month)
- Authentication: SSH public key
- Username: azureuser
- (SSH key'i indir)

Networking:
- Public IP: Yes
- Public inbound ports: SSH (22), Custom (5678)

[Review + Create] > [Create]
```

#### 4.2. VM'e Bağlan ve n8n Kur
```bash
# Lokal terminalden
ssh azureuser@<VM_PUBLIC_IP> -i <SSH_KEY_PATH>

# VM içinde:
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker azureuser

# Çıkış yap, tekrar gir
exit
ssh azureuser@<VM_PUBLIC_IP> -i <SSH_KEY_PATH>

# n8n kur
mkdir ~/n8n && cd ~/n8n
cat > docker-compose.yml <<'EOF'
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=mutluet2026
    volumes:
      - ./n8n_data:/home/node/.n8n
EOF

docker-compose up -d

# n8n'e tarayıcıdan ulaş: http://<VM_PUBLIC_IP>:5678
```

---

### AŞAMA 5: WordPress Plugin Kurulumu (30 dk)

#### 5.1. Plugin Dosyası Oluştur

WordPress hosting'inde (mutluet.org):

```bash
# cPanel File Manager veya FTP ile:
wp-content/plugins/mutluet-sso-connector/

Dosyalar:
1. mutluet-sso-connector.php
2. composer.json
```

**mutluet-sso-connector.php içeriği:**
`WORDPRESS_SSO_PLAN.md` dosyasındaki PHP kodunu kopyala.

**composer.json içeriği:**
```json
{
  "require": {
    "firebase/php-jwt": "^6.8"
  }
}
```

#### 5.2. Composer Install

```bash
# WordPress hosting'de terminal varsa:
cd wp-content/plugins/mutluet-sso-connector
composer install

# Terminal yoksa:
# Lokal bilgisayarda composer install yap
# Tüm klasörü (vendor dahil) FTP ile yükle
```

#### 5.3. Plugin'i Aktif Et

```
WordPress Admin Panel > Plugins > Installed Plugins
- "Mutluet SSO Connector" bulun
- [Activate]

Settings > Mutluet SSO
- JWT Secret: (Azure Key Vault'taki WORDPRESS-JWT-SECRET ile aynı)
- [Save]
```

---

### AŞAMA 6: Frontend'e WordPress Butonu Ekle (BENİM YAPABİLECEĞİM)

Claude Code tarafından yapılacak:
- `src/utils/wordpress-sso.ts` oluştur
- `src/components/WordPressButton.tsx` oluştur
- Profil sayfasına ekle

---

### AŞAMA 7: İlk Deployment Test (15 dk)

#### 7.1. Backend Test
```
1. Azure Portal > App Service (mutluet-backend)
2. Overview > URL tıkla
3. URL sonuna ekle: /health
4. ✅ Beklenen: { "status": "ok" }
```

#### 7.2. Frontend Test
```
1. Azure Portal > Static Web App (mutluet-frontend)
2. Overview > URL tıkla
3. ✅ Beklenen: React app açılmalı
```

#### 7.3. GitHub Actions Kontrol
```
GitHub > Mutluet > Actions
- Son workflow'lar başarılı mı?
- Backend deploy ✓
- Frontend deploy ✓
```

---

### AŞAMA 8: Production Database Migration (5 dk)

```bash
# Lokal terminalden
cd ~/Mutluet/backend

# Supabase URL'ini geçici olarak kullan
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.abc123.supabase.co:5432/postgres" pnpm prisma migrate deploy
```

---

### AŞAMA 9: Admin Kullanıcı Oluştur (5 dk)

```bash
# Lokal terminalden
cd ~/Mutluet/backend

# Production database'e bağlan
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.abc123.supabase.co:5432/postgres" pnpm prisma studio

# Tarayıcıda açılır: http://localhost:5555
# User tablosuna git
# Add Record:
# - email: admin@mutluet.org
# - name: Admin
# - role: ADMIN
# - authProvider: EMAIL
# - password: (bcrypt hash - aşağıdaki komutla oluştur)

# Password hash oluştur:
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(console.log);"
# Çıktıyı kopyala ve password alanına yapıştır
```

---

### AŞAMA 10: Domain Bağlama (Opsiyonel - 15 dk)

#### 10.1. Frontend (mutluet.org)

```
Azure Portal > Static Web App > Custom domains

Add custom domain:
- Domain name: mutluet.org
- CNAME kaydını gösterecek

DNS Sağlayıcında (NameCheap/Turhost/etc):
- Type: CNAME
- Host: @
- Value: (Azure'dan verilen CNAME)
- TTL: Automatic

10-20 dakika bekle
```

#### 10.2. Backend (api.mutluet.org)

```
Azure Portal > App Service > Custom domains

Add custom domain:
- Domain name: api.mutluet.org
- CNAME kaydını gösterecek

DNS Sağlayıcında:
- Type: CNAME
- Host: api
- Value: mutluet-backend.azurewebsites.net
- TTL: Automatic
```

**SSL/TLS Sertifikası:**
```
App Service > TLS/SSL settings
- Private Key Certificates > Add Certificate
- Create App Service Managed Certificate
- Domain: api.mutluet.org
- [Create]

- Custom domains > api.mutluet.org
- TLS/SSL binding: SNI SSL
- Certificate: (yeni oluşturduğun)
```

---

### AŞAMA 11: Google Ads Grant (Opsiyonel - 1 saat)

#### 11.1. Google for Nonprofits Başvurusu
```
1. https://www.google.com/nonprofits
2. [Get Started]
3. Kuruluş bilgileri:
   - İsim: Mutluet
   - Ülke: Türkiye
   - Vergi muafiyeti belgesi yükle
4. Onay bekle (2-3 gün)
```

#### 11.2. Google Ads Hesabı
```
1. https://ads.google.com
2. [Create Account]
3. Google for Nonprofits hesabıyla bağla
4. Ad Grants Program başvurusu:
   - https://www.google.com/grants
   - [Apply]
   - $10,000/ay grant için başvur
```

---

## 📊 ÖZET: SIRA İLE YAPILACAKLAR

### BENİM YAPACAKLARIM (Claude Code):
1. ✅ Proje analizi ve hazırlık (TAMAMLANDI)
2. Azure Key Vault entegrasyon kodu yazma
3. WordPress SSO backend endpoint yazma
4. GitHub Actions workflow dosyaları oluşturma
5. Frontend'e WordPress butonu ekleme
6. Dokümantasyon güncellemeleri

### SENİN YAPACAKLARIN (Ömer):

**Zorunlu Adımlar (1.5-2 saat):**
1. Azure Portal'da Resource Group oluştur
2. Key Vault oluştur ve sırları ekle
3. App Service oluştur (Backend)
4. Static Web App oluştur (Frontend)
5. Managed Identity ve Access Policy ayarla
6. GitHub Secrets ekle
7. Supabase URL'sini Key Vault'a ekle
8. Production'a deploy et
9. Admin kullanıcı oluştur

**Opsiyonel Adımlar (2-3 saat):**
10. n8n VM kurulumu
11. WordPress plugin kurulumu
12. Domain bağlama
13. Google Ads Grant başvurusu

---

## 🎯 İLK HEDEF: Minimum Viable Product (MVP)

**Sadece zorunlu adımları yap:**
- Azure'da çalışan uygulama
- Kullanıcı kaydı ve girişi
- Database bağlantısı
- Admin paneli erişimi

**Toplam Süre:** ~2 saat

**Sonra Eklenebilir:**
- WordPress entegrasyonu
- n8n otomasyonu
- Custom domain
- Google Ads

---

## 💡 SIRADA NE VAR?

Şu an elimizdeki durumu özetlersem:

### ✅ HAZIR OLANLAR:
- Kod tabanı tamamen hazır (GitHub'da)
- Prisma schema ve migrations hazır
- Supabase database çalışıyor
- Lokal geliştirme ortamı çalışıyor
- Tüm dokümantasyon hazır
- AI talimatları hazır (`.cursor/rules`)

### ⏳ BEKLİYOR:
- Azure altyapı kurulumu (senin yapman gereken)
- GitHub Secrets ekleme
- İlk production deployment
- WordPress plugin kurulumu

### 🚀 SONRAKİ ADIMLAR:
- n8n otomasyonları kurma
- Sosyal medya entegrasyonları
- Google Ads kampanya başlatma
- Domain bağlama

---

## 📞 YARDIM

**Bir adımda takılırsan:**
1. İlgili detaylı dokümana bak:
   - `WORDPRESS_SSO_PLAN.md`
   - `AZURE_ENTEGRASYON_PLANI.md`
   - `SENİN_YAPMAN_GEREKENLER.md`

2. Azure Portal'da hata alırsan:
   - Subscription aktif mi kontrol et
   - Region'ları kontrol et (hepsi West Europe olmalı)
   - Resource group isimlerini kontrol et

3. Deployment hataları:
   - GitHub Actions loglarına bak
   - Azure Portal > App Service > Log stream
   - Application Insights > Failures

---

**Hazırlayan:** Claude Code
**Tarih:** 4 Mart 2026
**Proje:** Mutluet İyilik Fabrikası
**Versiyon:** 1.0

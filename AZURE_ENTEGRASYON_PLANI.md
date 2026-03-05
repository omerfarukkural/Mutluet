# Azure Tam Entegrasyon Planı - Mutluet İyilik Fabrikası

## Genel Bakış

Azure $2000 kredini kullanarak profesyonel, ölçeklenebilir ve güvenli bir altyapı kuruyoruz.

## Azure Servisleri ve Maliyetler

| Servis | Amaç | Aylık Maliyet | Yıllık Toplam |
|--------|------|---------------|---------------|
| Azure Static Web Apps | Frontend hosting | $0-10 | $120 |
| Azure App Service (B1) | Backend API | $55 | $660 |
| Azure Key Vault | Sır yönetimi | $5 | $60 |
| Azure VM (B1s) | n8n automation | $30 | $360 |
| Azure Monitor | Logging & monitoring | $20 | $240 |
| Azure CDN | Statik içerik | $15 | $180 |
| **TOPLAM** | | **$135/ay** | **$1620/yıl** |

**Sonuç:** $2000 kredi ile ~14-15 ay kullanım

---

## 1. Azure Key Vault Entegrasyonu

### A) Key Vault Oluşturma

```bash
# Azure CLI ile
az login

# Resource Group oluştur
az group create \
  --name mutluet-rg \
  --location westeurope

# Key Vault oluştur
az keyvault create \
  --name mutluet-vault \
  --resource-group mutluet-rg \
  --location westeurope
```

### B) Sırları Ekle

```bash
# Database URL
az keyvault secret set \
  --vault-name mutluet-vault \
  --name DATABASE-URL \
  --value "postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres"

# JWT Secret
az keyvault secret set \
  --vault-name mutluet-vault \
  --name JWT-SECRET \
  --value "production-jwt-secret-$(openssl rand -hex 32)"

# Stripe Keys
az keyvault secret set \
  --vault-name mutluet-vault \
  --name STRIPE-SECRET-KEY \
  --value "sk_live_..."

az keyvault secret set \
  --vault-name mutluet-vault \
  --name STRIPE-PUBLISHABLE-KEY \
  --value "pk_live_..."

# Google OAuth
az keyvault secret set \
  --vault-name mutluet-vault \
  --name GOOGLE-CLIENT-ID \
  --value "your-google-client-id"

az keyvault secret set \
  --vault-name mutluet-vault \
  --name GOOGLE-CLIENT-SECRET \
  --value "your-google-client-secret"

# WordPress SSO
az keyvault secret set \
  --vault-name mutluet-vault \
  --name WORDPRESS-JWT-SECRET \
  --value "wordpress-sso-secret-$(openssl rand -hex 32)"
```

### C) Backend'de Key Vault Entegrasyonu

**1. Gerekli Paketleri Yükle:**

```bash
cd backend
pnpm add @azure/keyvault-secrets @azure/identity
```

**2. Config Dosyası Oluştur:**

```typescript
// backend/src/config/azure-secrets.ts
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

const vaultUrl = process.env.AZURE_KEY_VAULT_URL || 'https://mutluet-vault.vault.azure.net/';

let client: SecretClient | null = null;
const secretCache: Record<string, string> = {};

function getClient(): SecretClient {
  if (!client) {
    const credential = new DefaultAzureCredential();
    client = new SecretClient(vaultUrl, credential);
  }
  return client;
}

export async function getSecret(secretName: string): Promise<string> {
  // Cache'den kontrol et
  if (secretCache[secretName]) {
    return secretCache[secretName];
  }

  try {
    const client = getClient();
    const secret = await client.getSecret(secretName);

    if (!secret.value) {
      throw new Error(`Secret ${secretName} bulunamadı`);
    }

    // Cache'e kaydet
    secretCache[secretName] = secret.value;
    return secret.value;
  } catch (error) {
    console.error(`Secret alınamadı (${secretName}):`, error);
    // Fallback: Environment variable
    const envValue = process.env[secretName.replace(/-/g, '_')];
    if (envValue) {
      return envValue;
    }
    throw error;
  }
}

// Tüm sırları başlangıçta yükle
export async function loadSecrets() {
  try {
    const secrets = [
      'DATABASE-URL',
      'JWT-SECRET',
      'STRIPE-SECRET-KEY',
      'GOOGLE-CLIENT-ID',
      'GOOGLE-CLIENT-SECRET',
      'WORDPRESS-JWT-SECRET'
    ];

    await Promise.all(secrets.map(name => getSecret(name)));
    console.log('✅ Tüm sırlar Key Vault\'tan yüklendi');
  } catch (error) {
    console.warn('⚠️ Bazı sırlar yüklenemedi, env variables kullanılacak');
  }
}
```

**3. index.ts'de Kullan:**

```typescript
// backend/src/index.ts
import { loadSecrets, getSecret } from './config/azure-secrets';

async function startServer() {
  try {
    // Production'da Key Vault kullan
    if (process.env.NODE_ENV === 'production') {
      await loadSecrets();
    }

    const app = express();
    // ... middleware'ler

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Backend çalışıyor: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server başlatılamadı:', error);
    process.exit(1);
  }
}

startServer();
```

**4. JWT Middleware'i Güncelle:**

```typescript
// backend/src/middleware/auth.ts
import { getSecret } from '../config/azure-secrets';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    // Production'da Key Vault'tan al
    const jwtSecret = process.env.NODE_ENV === 'production'
      ? await getSecret('JWT-SECRET')
      : process.env.JWT_SECRET;

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
}
```

---

## 2. Azure App Service (Backend) Deployment

### A) App Service Oluştur

```bash
# App Service Plan oluştur (B1 tier - uygun maliyetli)
az appservice plan create \
  --name mutluet-plan \
  --resource-group mutluet-rg \
  --sku B1 \
  --is-linux

# Web App oluştur (Node.js 22)
az webapp create \
  --name mutluet-backend \
  --resource-group mutluet-rg \
  --plan mutluet-plan \
  --runtime "NODE:22-lts"
```

### B) Managed Identity Aktif Et

```bash
az webapp identity assign \
  --name mutluet-backend \
  --resource-group mutluet-rg
```

**Identity ID'yi al:**
```bash
az webapp identity show \
  --name mutluet-backend \
  --resource-group mutluet-rg \
  --query principalId -o tsv
```

### C) Key Vault Access Policy Ekle

```bash
# App Service'e Key Vault okuma izni ver
az keyvault set-policy \
  --name mutluet-vault \
  --object-id <PRINCIPAL_ID> \
  --secret-permissions get list
```

### D) Environment Variables Ekle

```bash
# Azure Portal'da:
# App Service > Configuration > Application Settings

# VEYA CLI ile:
az webapp config appsettings set \
  --name mutluet-backend \
  --resource-group mutluet-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    AZURE_KEY_VAULT_URL=https://mutluet-vault.vault.azure.net/ \
    FRONTEND_URL=https://mutluet.azurestaticapps.net
```

### E) GitHub Actions ile Auto Deploy

**.github/workflows/backend-deploy.yml:**

```yaml
name: Backend Deploy to Azure

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd backend
          pnpm install

      - name: Build
        run: |
          cd backend
          pnpm build

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: mutluet-backend
          publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
          package: ./backend
```

**Publish Profile'ı GitHub'a ekle:**
```bash
# Azure Portal'da:
# App Service > Deployment Center > Manage publish profile > Download

# GitHub'da:
# Settings > Secrets > New repository secret
# Name: AZURE_BACKEND_PUBLISH_PROFILE
# Value: (indirdiğin dosyanın içeriği)
```

---

## 3. Azure Static Web Apps (Frontend)

### A) Static Web App Oluştur

```bash
az staticwebapp create \
  --name mutluet-frontend \
  --resource-group mutluet-rg \
  --source https://github.com/omerfarukkural/Mutluet \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

### B) Environment Variables

Azure Portal'da:
- Static Web Apps > Configuration > Environment variables

```
VITE_API_URL=https://mutluet-backend.azurewebsites.net/api
```

### C) Custom Domain (Opsiyonel)

```bash
# Azure Portal'da:
# Static Web Apps > Custom domains > Add

# mutluet.org DNS'e ekle:
# Type: CNAME
# Name: @
# Value: mutluet-frontend.azurestaticapps.net
```

---

## 4. Azure VM + n8n (Otomasyon)

### A) Ubuntu VM Oluştur

```bash
az vm create \
  --resource-group mutluet-rg \
  --name mutluet-automation \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard
```

### B) VM'e Bağlan ve Docker Kur

```bash
# SSH ile bağlan
ssh azureuser@<VM_PUBLIC_IP>

# Docker kurulumu
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker azureuser
```

### C) n8n Kurulumu

```bash
# n8n docker-compose.yml
mkdir ~/n8n
cd ~/n8n

cat > docker-compose.yml <<EOF
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
      - N8N_HOST=0.0.0.0
      - WEBHOOK_URL=https://<VM_PUBLIC_IP>:5678/
    volumes:
      - ./n8n_data:/home/node/.n8n
EOF

# Başlat
docker-compose up -d
```

### D) n8n İş Akışları

**Workflow 1: WordPress → Sosyal Medya Otomasyonu**

```
1. Webhook Trigger (WordPress'ten yeni içerik)
   ↓
2. Gemini API (İçerik analizi ve alt metin üretimi)
   ↓
3. CapCut/Adobe API (Video düzenleme)
   ↓
4. Multi-Post:
   - Instagram API
   - TikTok API
   - YouTube Shorts API
   - LinkedIn API
```

**Workflow 2: Kullanıcı Sorularına Otomatik Yanıt**

```
1. Webhook (Sohbet mesajı geldiğinde)
   ↓
2. HTTP Request (KULLANIM_REHBERI.md'yi al)
   ↓
3. Gemini API (Bağlam + Soru → Yanıt)
   ↓
4. HTTP Request (Backend'e yanıt gönder)
```

---

## 5. Azure Monitor & Application Insights

### A) Application Insights Oluştur

```bash
az monitor app-insights component create \
  --app mutluet-insights \
  --location westeurope \
  --resource-group mutluet-rg
```

### B) Backend'e Entegre Et

```bash
cd backend
pnpm add applicationinsights
```

```typescript
// backend/src/config/monitoring.ts
import appInsights from 'applicationinsights';

export function setupMonitoring() {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup()
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .start();

    console.log('✅ Application Insights aktif');
  }
}
```

```typescript
// backend/src/index.ts
import { setupMonitoring } from './config/monitoring';

setupMonitoring();
// ... rest of the code
```

### C) Azure Portal'da Monitoring

```
Application Insights > Performance
- API response times
- Slow queries
- Failed requests

Application Insights > Failures
- Exception tracking
- Error rates
```

---

## 6. GitHub Actions CI/CD Pipeline

**.github/workflows/full-deployment.yml:**

```yaml
name: Full Stack Deployment

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install pnpm
        run: npm install -g pnpm
      - name: Install & Build Backend
        run: |
          cd backend
          pnpm install
          pnpm build
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: mutluet-backend
          publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
          package: ./backend

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install pnpm
        run: npm install -g pnpm
      - name: Install & Build Frontend
        run: |
          pnpm install
          pnpm build
        env:
          VITE_API_URL: https://mutluet-backend.azurewebsites.net/api
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
```

---

## 7. Maliyet Optimizasyonu

### A) Auto-Scaling Kur

```bash
# Backend için auto-scale rule
az monitor autoscale create \
  --resource-group mutluet-rg \
  --resource mutluet-backend \
  --resource-type Microsoft.Web/serverFarms \
  --name mutluet-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1

# CPU > %70 olduğunda scale up
az monitor autoscale rule create \
  --resource-group mutluet-rg \
  --autoscale-name mutluet-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1
```

### B) Azure Cost Management

```bash
# Günlük maliyet raporu al
az consumption usage list \
  --start-date 2026-03-01 \
  --end-date 2026-03-31 \
  --output table
```

### C) Bütçe Alarmı Kur

Azure Portal:
- Cost Management + Billing
- Budgets > Create
- Budget: $150/month
- Alert: %80 kullanıldığında email gönder

---

## 8. Deployment Checklist

### Hazırlık (Lokal)
- [ ] Backend'e Azure SDK paketlerini ekle
- [ ] `azure-secrets.ts` config dosyasını oluştur
- [ ] GitHub Actions workflow dosyalarını ekle
- [ ] `.env.production` dosyasını hazırla

### Azure Portal
- [ ] Resource Group oluştur (`mutluet-rg`)
- [ ] Key Vault oluştur ve sırları ekle
- [ ] App Service oluştur (Backend)
- [ ] Static Web App oluştur (Frontend)
- [ ] VM oluştur (n8n için)
- [ ] Application Insights aktif et
- [ ] Managed Identity ayarla
- [ ] Key Vault access policy ver

### GitHub
- [ ] AZURE_BACKEND_PUBLISH_PROFILE secret'ı ekle
- [ ] AZURE_STATIC_WEB_APPS_TOKEN secret'ı ekle
- [ ] Actions'ı aktif et

### Production Test
- [ ] Backend health check (`/health`)
- [ ] Frontend açılıyor mu
- [ ] Login çalışıyor mu
- [ ] Database bağlantısı OK
- [ ] Key Vault erişimi OK
- [ ] Monitoring aktif mi

### Optimizasyon
- [ ] CDN aktif et
- [ ] Auto-scaling kur
- [ ] Maliyet alarmı ayarla
- [ ] Backup stratejisi belirle

---

## 9. Yedekleme Stratejisi

### Database (Supabase)
- Otomatik günlük backup
- Point-in-time recovery (7 gün)
- Manuel snapshot: Settings > Database > Backups

### Code (GitHub)
- Otomatik version control
- Protected branches (main)
- Pull request reviews

### Secrets (Key Vault)
```bash
# Manual backup
az keyvault secret list \
  --vault-name mutluet-vault \
  --query "[].{name:name}" \
  --output json > secrets-backup.json
```

---

## Sonuç

**Toplam Kurulum Süresi:** 6-8 saat

**Adım Sırası:**
1. Azure hesabı ve kredi kontrolü (15 dk)
2. Key Vault kurulumu (30 dk)
3. Backend Azure entegrasyonu (2 saat)
4. App Service deployment (1 saat)
5. Static Web App deployment (1 saat)
6. n8n VM kurulumu (1.5 saat)
7. Monitoring & CI/CD (1 saat)
8. Test ve optimizasyon (1 saat)

**Aylık Maliyet:** ~$135
**Kredi Ömrü:** 14-15 ay

---

**Hazırlayan:** Claude Code
**Tarih:** 4 Mart 2026
**Proje:** Mutluet İyilik Fabrikası

# Bitebimuv ve Mutluet için Çok Bulutlu, Denetlenebilir AI-Ajan Fabrikası

**Sürüm:** 1.0  
**Tarih:** Nisan 2026  
**Durum:** Aktif Mimari Belgesi

---

## İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Referans Mimari](#2-referans-mimari)
3. [GitOps ile Dağıtım](#3-gitops-ile-dağıtım)
4. [Kubernetes Güvenlik Standartları](#4-kubernetes-güvenlik-standartları)
5. [Politika Motoru](#5-politika-motoru)
6. [Gizli Anahtar Yönetimi](#6-gizli-anahtar-yönetimi)
7. [Veri Katmanı](#7-veri-katmanı)
8. [WordPress Entegrasyonu](#8-wordpress-entegrasyonu)
9. [macOS Uygulama Paketleme](#9-macos-uygulama-paketleme)
10. [Ajan Fabrikası](#10-ajan-fabrikası)
11. [Spesifikasyon Sözleşmesi](#11-spesifikasyon-sözleşmesi)
12. [Denetim Kanıtları](#12-denetim-kanıtları)
13. [MCP ve Ajan Araç Erişimi](#13-mcp-ve-ajan-araç-erişimi)
14. [Uygulama Planı](#14-uygulama-planı)
15. [Kritik Riskler ve Kontrol Listesi](#15-kritik-riskler-ve-kontrol-listesi)

---

## 1. Genel Bakış

Bu mimari, Bitebimuv ve Mutluet projeleri için "tek seferlik uygulama" değil; **sürekli çalışan, ihtiyaçları veriyle keşfeden, doğru ürünleri seçen ve seçtiği ürünleri uçtan uca üretebilen bir ürün fabrikası** tanımlar.

### Fabrikanın Kritik Farkı

Tipik "ajanlar yazsın" yaklaşımının zayıflıklarını sistematik olarak engeller:

| Zayıflık | Çözüm |
|----------|-------|
| Hedef sapması | Spesifikasyon sözleşmeleri + CI compliance check |
| Eksik test | Test ajanı zorunlu geçiş kapısı |
| Güvenlik açıkları | Güvenlik ajanı + policy-as-code |
| Rastgele mimari | Mimari ajan + spec şablonları |
| Gizli anahtar sızıntısı | ESO + Azure Key Vault + secret tarama |
| Denetlenemez dağıtım | SLSA provenance + cosign + GitOps |

### Temel Prensipler

- **Kontrol Katmanı Önceliği:** Uygulama taşınabilirliğinden önce denetim standardı
- **Kanıt Üretmeden Karar Yok:** İhtiyaç motoru her döngüde veri üretir
- **Spec Aykırı Merge Yok:** Spec compliance check CI kapısında
- **İmzasız Image Çalışmaz:** Cluster admission katmanında cosign doğrulama

---

## 2. Referans Mimari

### Kontrol Katmanı / İş Yükü Katmanı Ayrımı

```
┌─────────────────────────────────────────────────────────────────┐
│                     KONTROL KATMANI                             │
│  ajan orkestrasyonu │ CI/CD │ GitOps │ gizli anahtar yönetimi  │
│  audit log          │ gözlemleme │ politika motoru             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                     İŞ YÜKÜ KATMANI                             │
│  Mutluet API  │  Bitebimuv API  │  WordPress Siteleri          │
│  Arka Plan İşler  │  Vektör/Arama  │  Mesajlaşma               │
└─────────────────────────────────────────────────────────────────┘
```

### Çok Bulut Topolojisi

```
┌─────────────────────────────────────────────────────────────────┐
│  AZURE (Birincil)                                               │
│  ├─ AKS Platform Cluster  (kontrol katmanı)                    │
│  ├─ Azure Key Vault        (gizli anahtar yönetimi)            │
│  ├─ Azure Container Registry                                    │
│  └─ AKS Uygulama Cluster  (Mutluet/Bitebimuv iş yükleri)     │
├─────────────────────────────────────────────────────────────────┤
│  GOOGLE CLOUD (İkincil)                                         │
│  ├─ GKE Uygulama Cluster  (yedek/yük dağılımı)                │
│  └─ GCP Secret Manager    (çapraz bulut gizli anahtar yedekleme)│
├─────────────────────────────────────────────────────────────────┤
│  MONGODB ATLAS (Veri)                                           │
│  ├─ Operasyonel Veri + Vector Search                           │
│  └─ Atlas Kubernetes Operator ile yönetim                      │
└─────────────────────────────────────────────────────────────────┘
```

### Yerel Geliştirme Ortamı

MacBook'ta tam yığın simülasyonu için:

```bash
# kind ile yerel Kubernetes cluster
kind create cluster --name mutluet-local

# Argo CD kurulumu
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# External Secrets Operator
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace
```

---

## 3. GitOps ile Dağıtım

### Argo CD Yaklaşımı

Cluster ve uygulama manifestleri Git'te "tek gerçek kaynak" olur. Cluster bu Git'i deklaratif biçimde uygular.

```
git push → Argo CD sync → Kubernetes cluster
```

**Repo Yapısı:**

```
infra/
├── gitops/
│   ├── apps/                    # Argo CD Application manifestleri
│   │   ├── mutluet-api.yaml
│   │   ├── bitebimuv-api.yaml
│   │   └── platform-tools.yaml
│   ├── clusters/
│   │   ├── azure-prod/          # Azure üretim cluster manifestleri
│   │   └── local/               # Yerel geliştirme manifestleri
│   └── bootstrap/               # İlk cluster bootstrap
├── k8s/
│   ├── namespaces.yaml
│   ├── rbac.yaml
│   ├── network-policies.yaml
│   ├── pod-security.yaml
│   └── external-secrets.yaml
└── external-secrets/
    ├── cluster-secret-store.yaml
    ├── mutluet-secrets.yaml
    └── bitebimuv-secrets.yaml
```

### Flux Alternatifi

Daha modüler yaklaşım istiyorsan (her cluster kendi kendini yönetsin):

```bash
flux bootstrap github \
  --owner=omerfarukkural \
  --repository=Mutluet \
  --branch=main \
  --path=infra/gitops/clusters/azure-prod
```

**Tercih:** Tek panelden görünürlük için **Argo CD**, her cluster özerk olsun için **Flux**.

---

## 4. Kubernetes Güvenlik Standartları

### Pod Security Standards

Üç profil kademeli olarak devreye alınır:

| Profil | Açıklama | Kullanım |
|--------|----------|----------|
| `privileged` | Tüm ayrıcalıklara izin | Yalnızca sistem araçları |
| `baseline` | Bilinen yetki yükseltme yollarını engeller | Uygulama namespace'leri (audit modu) |
| `restricted` | Pod hardening best-practice | Üretim uygulama namespace'leri |

**Kademeli devreye alma:**

```yaml
# Önce audit modu ile izle
apiVersion: v1
kind: Namespace
metadata:
  name: mutluet-prod
  labels:
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
# Hazır olunca enforce'a geç:
#   pod-security.kubernetes.io/enforce: restricted
```

### RBAC Tasarımı

Ajanlar ve CI sistemleri yalnızca gereken kapsama erişir:

```yaml
# Ajan servisleri için minimum yetki
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch"]  # Sadece okuma
```

**Prensip:** Her servis hesabı için "en az yetki" (`least-privilege`).

### NetworkPolicy

"Policy yoksa her şey açık" prensibini önlemek için varsayılan reddetme:

```yaml
# Tüm giriş ve çıkış trafiği varsayılan olarak reddedilir
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

---

## 5. Politika Motoru

### Kyverno (Önerilen)

Kubernetes-native, YAML ile politika yazma. Admission controller olarak çalışır.

**Yetenekler:**
- `validate` — manifest kabul kriterlerini kontrol et
- `mutate` — eksik alanları otomatik ekle (örn. güvenlik bağlamı)
- `generate` — namespace oluşturulduğunda otomatik NetworkPolicy ekle
- `verify-images` — cosign imzalı image doğrulama

**Örnek Kural:**

```yaml
# İmzasız container image'ları reddet
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signatures
spec:
  validationFailureAction: Enforce
  rules:
  - name: check-image-signature
    match:
      resources:
        kinds: [Pod]
    verifyImages:
    - imageReferences: ["ghcr.io/omerfarukkural/*"]
      attestors:
      - entries:
        - keyless:
            subject: "https://github.com/omerfarukkural/Mutluet/.github/workflows/*"
            issuer: "https://token.actions.githubusercontent.com"
```

### Gatekeeper (Alternatif)

OPA/Rego ekosisteminde deneyim varsa tercih edilebilir.

---

## 6. Gizli Anahtar Yönetimi

### Bootstrap → Runtime Akışı

```
bootstrap .env → Azure Key Vault → External Secrets Operator → Kubernetes Secret → Pod
```

### External Secrets Operator (ESO)

Azure Key Vault provider ile Kubernetes Secret'larını otomatik senkronize eder:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mutluet-api-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-key-vault-store
    kind: ClusterSecretStore
  target:
    name: mutluet-api-secrets
  data:
  - secretKey: DATABASE_URL
    remoteRef:
      key: DATABASE-URL
  - secretKey: JWT_SECRET
    remoteRef:
      key: JWT-SECRET
```

### Workload Identity (Azure)

AAD Pod Identity yerine Workload Identity kullanılır (önerilen):

```yaml
# Service Account üzerinde Azure Workload Identity annotation'ı
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mutluet-backend
  annotations:
    azure.workload.identity/client-id: "<AZURE_CLIENT_ID>"
```

---

## 7. Veri Katmanı

### Hibrit Veri Stratejisi

| Veri Türü | Depolama | Açıklama |
|-----------|----------|----------|
| Kullanıcı, Bağış, Etkinlik, Mesaj | PostgreSQL | Transactional, ACID uyumlu |
| Esnek dokümanlar, AI/RAG | MongoDB Atlas | Doküman store + Vector Search |
| Vektör embeddings | MongoDB Atlas Vector Search | Semantik ve hibrit arama |

### MongoDB Atlas Kubernetes Operator

CI/CD pipeline'ına Atlas'ı ekle:

```yaml
apiVersion: atlas.mongodb.com/v1
kind: AtlasProject
metadata:
  name: mutluet-atlas-project
spec:
  name: mutluet-prod
  connectionSecretRef:
    name: mongodb-atlas-operator-api-key
```

### pgvector Alternatifi

Eğer PostgreSQL'de kalınmak istenirse `pgvector` uzantısı ile vektör ihtiyacı karşılanabilir. Karar kriteri: veri şekli + sorgu tipi + takım yetkinliği + maliyet.

---

## 8. WordPress Entegrasyonu

### REST API ile İçerik Yönetimi

```bash
# WordPress REST API üzerinden içerik yayınlama
POST https://bitebimuv.org/wp-json/wp/v2/posts
Authorization: Basic <base64(username:app-password)>
Content-Type: application/json

{
  "title": "Yeni İçerik",
  "content": "...",
  "status": "publish"
}
```

### Application Passwords

Üçüncü taraf entegrasyonlar için revoke edilebilir kimlik bilgisi:

1. WordPress Admin → Users → Application Passwords
2. Her entegrasyon için ayrı şifre oluştur (örn. "Factory Bot", "Ajan Otomasyonu")
3. Şifreyi Azure Key Vault'a kaydet → ESO ile pod'a ilet

### "Factory" WP Eklentisi

WordPress admin paneline fabrika kontrol sayfası:

```
WP Admin → Mutluet Factory
├── İhtiyaç analizi başlat
├── Yeni ürün sprint'i aç
├── CI/GitOps durumunu izle
└── Yayın raporu üret
```

---

## 9. macOS Uygulama Paketleme

### Tauri ile .app/.dmg Üretimi

Panel web uygulaması olarak geliştirilir, Tauri ile paketlenir:

```
Web App (React) → Tauri → macOS .app + .dmg
```

### macOS Codesign/Notarization CI/CD

```yaml
# .github/workflows/macos-release.yml
- name: Build and Sign macOS App
  run: pnpm tauri build
  env:
    APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
    APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
    APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}  # App-specific password
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

---

## 10. Ajan Fabrikası

### Ajan Rolleri

"Her işi yapan tek ajan" yerine görev hattı:

```
┌─────────────────────────────────────────────────────────────────┐
│                     AJAN HATTI                                  │
│                                                                 │
│  1. Ürün Keşif Ajanı  → veri topla, kanıt haritası çıkar      │
│         ↓                                                       │
│  2. Ürün Yönetimi Ajanı → skora göre backlog sırala           │
│         ↓                                                       │
│  3. Mimari Ajan → hedef mimari, veri modeli, entegrasyon       │
│         ↓                                                       │
│  4. Kod Üretim Ajanı → monorepo şablonlarından kod üret        │
│         ↓                                                       │
│  5. Test Ajanı → unit/integration/e2e test kapsamı zorla       │
│         ↓                                                       │
│  6. Güvenlik Ajanı → secret tarama, bağımlılık güvenliği      │
│         ↓                                                       │
│  7. Dağıtım Ajanı → GitOps PR aç, Argo/Flux sync izle         │
│         ↓                                                       │
│  8. Gözlemleme Ajanı → SLO/SLI, alarm kur, geri besleme       │
└─────────────────────────────────────────────────────────────────┘
```

### Ajan Zamanlaması (Europe/Istanbul)

| Zaman | Ajan | Görev |
|-------|------|-------|
| 02:00–05:00 | Araştırma Ajanı | Site analitiği, formlar, ticket/backlog, sosyal sinyaller özeti |
| 05:00–06:00 | Ürün Yönetimi Ajanı | Skorlama, "ilk 3 ihtiyaç" shortlist, karar kaydı taslağı |
| 10:00–12:00 | Mimari + Tasarım Ajanı | Spec güncelleme, mimari diyagram, veri modeli |
| 13:00–17:00 | Kod Üretim Ajanı | Şablonlardan modül üretimi |
| 17:00–19:00 | Test + Güvenlik Ajanı | Policy check, RBAC/netpol uyumu, supply chain attestation |
| 20:00+ | Dağıtım Ajanı | GitOps PR açma, Argo CD sync izleme, canary/rollback |

**Kritik Kural:** Ajanlar 7/24 yazabilir, ancak merge/deploy "gates" saatleri sabitlenir.

---

## 11. Spesifikasyon Sözleşmesi

### Spec Dosyası Yapısı

Her ürün için `/specs/<product>/spec.yaml`:

```yaml
# specs/mutluet/spec.yaml
metadata:
  product: mutluet
  version: "1.0"
  owner: omerfarukkural

purpose: >
  Gönüllüler, bağışçılar ve sivil toplum kuruluşlarını birbirine bağlayan
  sosyal etki platformu.

userTypes:
  - type: volunteer
    description: Gönüllü saatleri takip eden, etkinliklere katılan bireyler
  - type: donor
    description: Bağış yapan bireyler ve kurumlar
  - type: organization
    description: STK'lar ve destek merkezleri

outOfScope:
  - E-ticaret
  - Sosyal medya platformu özellikleri (beğeni, takipçi vb.)

functions:
  - id: F-001
    name: Kullanıcı Kimlik Doğrulama
    acceptanceCriteria:
      - Email/şifre ile kayıt ve giriş çalışmalı
      - Google/Facebook OAuth çalışmalı
      - JWT token 24 saat geçerli olmalı
  - id: F-002
    name: Bağış Sistemi
    acceptanceCriteria:
      - Stripe ile ödeme alınabilmeli
      - Bağış geçmişi görüntülenebilmeli

dataClassification:
  pii: [email, phone, fullName, address]
  kvkk: true
  dataRetentionDays: 365

integrations:
  - name: Stripe
    type: payment
    authMethod: api_key
  - name: Azure Communication Services
    type: video
    authMethod: connection_string
  - name: WordPress (bitebimuv.org)
    type: content
    authMethod: application_password

sloTargets:
  availability: 99.9%
  p99Latency: 500ms
  errorRate: 0.1%

costLimit:
  monthly: 150
  currency: USD

releaseCriteria:
  - Tüm F-xxx kabul kriterleri geçmeli
  - Test coverage ≥ %80
  - Güvenlik taraması temiz
  - Spec compliance check geçmeli
  - SLSA provenance mevcut
```

### Spec Compliance CI Kapısı

```yaml
# .github/workflows/spec-compliance.yml
- name: Spec Compliance Check
  run: |
    # Değiştirilen dosyalar spec ile karşılaştırılır
    python scripts/spec_compliance_check.py \
      --spec specs/$PRODUCT/spec.yaml \
      --changed-files "$(git diff --name-only HEAD~1)"
```

**Kural:** Ajanlar kodu değiştirebilir, ancak spec'e aykırı davranamaz. Spec compliance check geçmeden merge yok.

---

## 12. Denetim Kanıtları

### SLSA Provenance

Her container image için provenance attestation üretilir:

```yaml
# .github/workflows/supply-chain-security.yml
- name: Generate SLSA Provenance
  uses: slsa-framework/slsa-github-generator/.github/workflows/generator_container_slsa3.yml@v2
  with:
    image: ghcr.io/omerfarukkural/mutluet-backend
    digest: ${{ steps.build.outputs.digest }}
```

### Cosign ile Image İmzalama

```bash
# Image imzalama (CI'da keyless signing)
cosign sign --yes ghcr.io/omerfarukkural/mutluet-backend@sha256:<digest>

# SBOM oluştur ve ekle
syft ghcr.io/omerfarukkural/mutluet-backend -o spdx-json > sbom.json
cosign attest --yes --predicate sbom.json --type spdxjson \
  ghcr.io/omerfarukkural/mutluet-backend@sha256:<digest>
```

### Kyverno ile Cluster Admission Doğrulama

```yaml
# İmzasız image'ları cluster'a kabul etme
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-signed-images
spec:
  validationFailureAction: Enforce
  rules:
  - name: verify-signature
    match:
      resources:
        kinds: [Pod]
    verifyImages:
    - imageReferences: ["ghcr.io/omerfarukkural/*"]
      attestors:
      - entries:
        - keyless:
            subject: "https://github.com/omerfarukkural/Mutluet/.github/workflows/*"
            issuer: "https://token.actions.githubusercontent.com"
```

---

## 13. MCP ve Ajan Araç Erişimi

### MCP Server Yapılandırması

Anthropic Model Context Protocol ile ajanların araç erişimi standardize edilir:

```json
{
  "mcpServers": {
    "github": {
      "httpUrl": "https://api.githubcopilot.com/mcp/",
      "description": "GitHub Issues, PR, Actions erişimi"
    },
    "supabase": {
      "httpUrl": "https://mcp.supabase.com/mcp",
      "description": "Database schema ve veri sorguları (salt okunur)"
    },
    "vercel": {
      "httpUrl": "https://mcp.vercel.com",
      "description": "Deployment durumu ve yönetimi"
    },
    "microsoftLearn": {
      "httpUrl": "https://learn.microsoft.com/api/mcp",
      "description": "Azure dokümantasyon ve kod örnekleri"
    }
  }
}
```

### MCP Güvenlik Prensipleri

- Her MCP server bağlantısı OAuth bearer token ile kimlik doğrular
- Token'lar Azure Key Vault'ta saklanır, pod'lara ESO ile iletilir
- Tüm MCP araç çağrıları audit log'a yazılır
- Yetki sınırları control plane tarafından yönetilir

---

## 14. Uygulama Planı

### Aşama 1: Bootstrap (Hafta 1)

```bash
# 1. kind cluster kur
kind create cluster --name mutluet-factory

# 2. Argo CD kur
kubectl apply -n argocd -f infra/gitops/bootstrap/argocd-install.yaml

# 3. External Secrets Operator kur
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace

# 4. .env.factory.example → Azure Key Vault
./scripts/bootstrap-secrets.sh .env.factory
```

### Aşama 2: Güvenlik Temeli (Hafta 2)

- Kubernetes RBAC rolleri oluştur (`infra/k8s/rbac.yaml`)
- NetworkPolicy varsayılan reddetme uygula (`infra/k8s/network-policies.yaml`)
- Pod Security Standards enforce et (`infra/k8s/pod-security.yaml`)
- Kyverno kur ve temel politikaları uygula

### Aşama 3: Uygulama Dağıtımı (Hafta 3)

- Mutluet API ve Frontend'i GitOps ile deploy et
- MongoDB Atlas Operator kur
- Gözlemleme yığınını kur (Prometheus + Grafana)

### Aşama 4: Ajan Fabrikası (Hafta 4+)

- SLSA provenance üretim pipeline'ı aktif et
- Spec compliance CI kapısını uygula
- Ajan zamanlamasını yapılandır
- WordPress Factory eklentisini geliştir

### Bootstrap .env Şablonu

Bkz: `.env.factory.example` — Gerçek değerleri doldur, ardından Azure Key Vault'a aktar.

---

## 15. Kritik Riskler ve Kontrol Listesi

### Profesyonel Tamlık Kontrol Listesi

| Kontrol | Durum | Konum |
|---------|-------|-------|
| Spec sözleşmesi var mı? | 📋 Gerekli | `specs/*/spec.yaml` |
| CI test kapısı var mı? | 📋 Gerekli | `.github/workflows/ci.yml` |
| Policy-as-code var mı? | 📋 Gerekli | `infra/k8s/kyverno-policies/` |
| Secret sızıntısı denetimi var mı? | 📋 Gerekli | GitHub Secret Scanning aktif |
| Provenance + imzalı artefact var mı? | 📋 Gerekli | `supply-chain-security.yml` |
| GitOps üzerinden geri alınabilir dağıtım var mı? | 📋 Gerekli | `infra/gitops/` |
| WordPress entegrasyonu revokable kimlikle mi? | 📋 Gerekli | Application Passwords |
| NetworkPolicy default-deny var mı? | 📋 Gerekli | `infra/k8s/network-policies.yaml` |

### Başlıca Riskler

1. **Yetki Genişlemesi:** RBAC yanlış yapılandırıldığında tehlikeli genişleme. Çözüm: namespace bazlı roller, cluster-admin hiçbir servis hesabına verilmez.

2. **Kontrolsüz Otomasyon:** Ajanlar 7/24 yazsa da merge/deploy kapıları saatlerle kısıtlanır.

3. **Supply-Chain Güvenliği:** Ajan kodu yazıp deploy etmesi provenance olmadan denetlenemez. Çözüm: SLSA + Sigstore zorunlu.

4. **macOS Paketleme Bağımlılığı:** Notarization için Apple hesabı ve sertifikası gerekir. Bu bağımlılık planlamaya dahil edilmeli.

---

## Referanslar

- [Argo CD Cluster Management](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-management/)
- [External Secrets Operator](https://external-secrets.io)
- [Kubernetes Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [Kyverno Policy Engine](https://kyverno.io/docs/introduction/)
- [SLSA Provenance](https://slsa.dev/spec/v1.0/provenance)
- [Sigstore Cosign](https://docs.sigstore.dev/cosign/verifying/attestation/)
- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [WordPress Application Passwords](https://developer.wordpress.org/advanced-administration/security/application-passwords/)
- [Tauri macOS Signing](https://tauri.app/distribute/sign/macos/)
- [Anthropic MCP](https://docs.anthropic.com/en/docs/mcp)
- [OpenGitOps](https://opengitops.dev/about)

---

*Bu belge, Bitebimuv ve Mutluet için Çok Bulutlu, Denetlenebilir AI-Ajan Fabrikası PDF'inden türetilmiştir.*

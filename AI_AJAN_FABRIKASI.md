# 🏭 Bitebimuv ve Mutluet — Çok Bulutlu, Denetlenebilir AI-Ajan Fabrikası

> **Kaynak:** [Mimari Rapor PDF](./Bitebimuv%20ve%20Mutluet%20için%20Çok%20Bulutlu%2C%20Denetlenebilir%20AI-Ajan%20Fabrikası.pdf)  
> **Durum:** Tasarım Aşaması — Kademeli Uygulama

---

## 📋 İçindekiler

1. [Vizyon ve Amaç](#1-vizyon-ve-amaç)
2. [Mimari Katmanlar](#2-mimari-katmanlar)
3. [GitOps ile Dağıtım](#3-gitops-ile-dağıtım)
4. [Kubernetes Güvenlik Standartları](#4-kubernetes-güvenlik-standartları)
5. [Politika Motoru](#5-politika-motoru)
6. [Gizli Anahtar Omurgası](#6-gizli-anahtar-omurgası)
7. [Veri Katmanı](#7-veri-katmanı)
8. [WordPress Entegrasyonu](#8-wordpress-entegrasyonu)
9. [Ajan Rolleri ve Hattı](#9-ajan-rolleri-ve-hattı)
10. [Spesifikasyon Sözleşmesi](#10-spesifikasyon-sözleşmesi)
11. [Denetim Kanıtları](#11-denetim-kanıtları)
12. [MCP ve Ajan Araç Erişimi](#12-mcp-ve-ajan-araç-erişimi)
13. [Ajan Zamanlaması](#13-ajan-zamanlaması)
14. [Bootstrap `.env` Şablonu](#14-bootstrap-env-şablonu)
15. [Kritik Riskler ve Kontrol Listesi](#15-kritik-riskler-ve-kontrol-listesi)

---

## 1. Vizyon ve Amaç

Bu fabrikanın amacı "tek seferlik uygulama" üretmek değil; **sürekli çalışan, ihtiyaçları veriyle keşfeden, doğru ürünleri seçen ve uçtan uca üretebilen bir ürün fabrikası** kurmaktır.

Kritik fark: "ajanlar yazsın" yaklaşımının tipik zayıflıklarını (hedef sapması, eksik test, güvenlik açıkları, gizli anahtar sızıntısı vb.) **politikalarla, doğrulamalarla ve denetlenebilir iş akışlarıyla** sistematik olarak engellemek.

### İhtiyaç Motoru

Fabrikanın omurgası **kanıt üretmeden karar vermeyen bir ihtiyaç motoru**dur:

- Site analitiği, destek talepleri, gönüllü/bağış davranışı, sosyal veri
- Her döngüde bir "ürün backlog'u" üretir
- Backlog'u uygulamaya dönüştüren üretim hattı

### Yüksek Olasılıklı İlk Ürün Dalgaları

| # | Küme | Açıklama |
|---|------|----------|
| 1 | Yardım ve kaynak bulunabilirliği | Kurum rehberi, kriz yönlendirme, doğrulanmış hizmet noktaları |
| 2 | Gönüllülük ve bağışın operasyonu | Etkinlik keşfi, gönüllü saatleri, şeffaf raporlama |
| 3 | Güvenli iletişim/bağlantı | Gerçek zamanlı mesajlaşma, görüntülü görüşme |
| 4 | İçerik ve farkındalık yayıncılığı | WordPress REST API + Application Passwords |

---

## 2. Mimari Katmanlar

Mimari iki ana katmana ayrılır:

```
┌─────────────────────────────────────────────────────────┐
│                  KONTROL KATMANI                         │
│  Ajan orkestrasyonu · Politika motorları · CI/CD        │
│  GitOps · Gizli anahtar yönetimi · Audit log            │
│  Gözlemleme (Observability)                              │
└──────────────────────┬──────────────────────────────────┘
                       │ "hangi ajan neyi, hangi yetkiyle,
                       │  hangi kanıtla yaptı?" sorusuna yanıt
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  İŞ YÜKÜ KATMANI                         │
│  Mutluet/Bitebimuv uygulamaları · API'ler               │
│  WordPress siteleri · Arka plan işler                    │
│  Arama/vektör · Mesajlaşma                               │
└─────────────────────────────────────────────────────────┘
```

### Çok Bulut Dağılımı

| Bulut | Rol |
|-------|-----|
| Azure (AKS) | Platform cluster — kontrol katmanı |
| GCP | İkincil uygulama cluster (gelecek aşama) |
| MongoDB Atlas | Operasyonel veri + vektör arama |
| Supabase/PostgreSQL | Transactional veri |

---

## 3. GitOps ile Dağıtım

Cluster ve uygulama manifestleri **Git'te tek gerçek kaynak** olur; cluster o Git'i deklaratif şekilde uygular.

### Araç Seçimi

| Araç | Ne zaman tercih edilir |
|------|----------------------|
| **Argo CD** | Tek panelden çoklu cluster görünürlüğü istiyorsan |
| **Flux** | Her cluster kendi kendini yönetsin (modüler) istiyorsan |

### GitOps Repo Yapısı

```
infra/
├── k8s/
│   ├── bootstrap/          # cluster ilk kurulum
│   ├── apps/               # uygulama manifestleri
│   ├── policies/           # Kyverno politikaları
│   ├── rbac/               # RBAC tanımları
│   └── network/            # NetworkPolicy
├── helm/                   # Helm chart'ları
└── main.bicep              # Azure altyapısı (mevcut)
```

---

## 4. Kubernetes Güvenlik Standartları

### Pod Security Standards

Kubernetes üç profil tanımlar:

| Profil | Koruma Seviyesi |
|--------|-----------------|
| Privileged | Kısıtlama yok (sadece güvenilen iş yükleri) |
| Baseline | Bilinen privilege escalation yollarını engeller |
| **Restricted** | Pod hardening best-practice'lerine yaklaşır ✅ |

```yaml
# Namespace seviyesinde enforce
apiVersion: v1
kind: Namespace
metadata:
  name: mutluet-prod
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### RBAC Prensipleri

- **Namespace içi** roller: `Role` + `RoleBinding`
- **Cluster geneli** roller: `ClusterRole` + `ClusterRoleBinding`
- Ajanlar ve CI sistemleri **yalnızca gereken kapsama** erişmeli
- `cluster-admin` yetki bağışından kaçın

### NetworkPolicy — Default Deny

```yaml
# Tüm namespace'lerde default olarak tüm trafiği kapat
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

---

## 5. Politika Motoru

Kubernetes admission aşamasında manifest kabulünü otomatik denetler.

| Motor | Dil | Ne zaman |
|-------|-----|----------|
| **Kyverno** | YAML + CEL | Kubernetes YAML aşinalığı yüksekse |
| **Gatekeeper** | Rego | Mevcut OPA/Rego ekosistemi varsa |

### Örnek Kyverno Politikası

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-unsigned-images
spec:
  validationFailureAction: Enforce
  rules:
  - name: check-image-signature
    match:
      any:
      - resources:
          kinds: [Pod]
    verifyImages:
    - imageReferences: ["*"]
      attestors:
      - entries:
        - keyless:
            subject: "https://github.com/omerfarukkural/Mutluet/*"
            issuer: "https://token.actions.githubusercontent.com"
```

---

## 6. Gizli Anahtar Omurgası

```
Bootstrap .env
     │
     ▼ (ilk kurulumda bir kez)
Azure Key Vault / GCP Secret Manager
     │
     ▼ (External Secrets Operator)
Kubernetes Secret
     │
     ▼ (mount)
Uygulama Pod'ları
```

### External Secrets Operator (ESO)

ESO, Azure Key Vault / HashiCorp Vault / GCP Secret Manager gibi dış secret kaynaklarını okuyup Kubernetes Secret içine senkronize eder.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mutluet-secrets
  namespace: mutluet-prod
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-key-vault
    kind: ClusterSecretStore
  target:
    name: mutluet-app-secrets
  data:
  - secretKey: DATABASE_URL
    remoteRef:
      key: DATABASE-URL
  - secretKey: JWT_SECRET
    remoteRef:
      key: JWT-SECRET
```

> **Not:** Azure Key Vault provider için `AAD Pod Identity` deprecated; **Workload Identity** kullan.

---

## 7. Veri Katmanı

| Veri Tipi | Teknoloji | Amaç |
|-----------|-----------|------|
| Transactional (kullanıcı, bağış, etkinlik) | PostgreSQL / Supabase | ACID işlemler |
| Esnek doküman + AI RAG | MongoDB Atlas | Vektör arama, hibrit arama |
| Vektör (alternatif) | pgvector (PostgreSQL) | Maliyet odaklı seçenek |

### MongoDB Atlas Kubernetes Operator

Atlas kaynaklarını Kubernetes custom resource'ları üzerinden yönetir ve CI/CD ile Atlas'ı aynı kontrol düzlemine bağlar.

---

## 8. WordPress Entegrasyonu

### Headless/Content Erişimi

WordPress **REST API** ile post/page/media üretimi:

```bash
# Örnek: yeni makale oluştur
curl -X POST https://mutluet.org/wp-json/wp/v2/posts \
  -H "Authorization: Basic $(echo -n 'kullanici:uygulama-sifresi' | base64)" \
  -H "Content-Type: application/json" \
  -d '{"title": "Yeni Kampanya", "status": "publish", "content": "..."}'
```

### Application Passwords (Revokable Kimlik)

- Ana şifreyi paylaşmadan uygulama bazlı credential
- HTTPS üzerinden Basic Auth
- WP Admin → Kullanıcılar → Uygulama Şifreleri menüsünden yönet

### WP Admin Factory Eklentisi

WP admin menüsüne "Factory" sayfası eklenir:
- İhtiyaç analizi başlatma
- "Yeni ürün" işlemi tetikleme
- CI/GitOps durumlarını izleme
- Yayın/dağıtım raporu üretme

---

## 9. Ajan Rolleri ve Hattı

Güvenilirlik için tek süper-ajan yerine **görev hattı** yaklaşımı:

| Ajan | Görev |
|------|-------|
| 🔍 **Ürün Keşif Ajanı** | Veri toplar, kanıt haritası çıkarır, ihtiyacı tanımlar |
| 📋 **Ürün Yönetimi Ajanı** | İhtiyaçları skorlar, "bu sprintte bu ürün" karar taslağı üretir |
| 🏗️ **Mimari Ajan** | Hedef mimari, veri modeli, entegrasyon matrisi çıkarır |
| 💻 **Kod Üretim Ajanı** | Monorepo şablonlarından kod üretir |
| 🧪 **Test Ajanı** | Unit/integration/e2e test kapsamını zorlar |
| 🔐 **Güvenlik Ajanı** | Secret sızıntısı, bağımlılık güvenliği, container hardening |
| 🚀 **Dağıtım Ajanı** | GitOps PR'larını açar, Argo/Flux senkronunu izler |
| 📊 **Gözlemleme Ajanı** | SLO/SLI, log/trace/metric alarmlarını kurar ve geri besleme üretir |

---

## 10. Spesifikasyon Sözleşmesi

Her ürün için **`/specs/<product>/spec.yaml`** tek kaynak-of-truth dosyası:

```yaml
# specs/ornek-urun/spec.yaml
meta:
  product_id: ornek-urun
  version: "1.0"
  status: approved

purpose: "Kullanıcıların yakınlarındaki yardım noktalarını bulmasını sağlar"

user_types:
  - bireysel_kullanici
  - gonullu
  - organizasyon

out_of_scope:
  - ödeme işlemleri (ayrı ürün)
  - video görüşme (ayrı modül)

functions:
  - id: F-001
    name: "Yakın kurum arama"
    acceptance_criteria:
      - "Kullanıcı 5 km yarıçapında kurum listesi görmeli"
      - "Liste yanıt süresi < 2s olmalı"

data_classification:
  contains_pii: true
  kvkk_required: true

integrations:
  - wordpress_rest_api
  - mongodb_atlas

slo:
  availability: "99.5%"
  latency_p99: "2s"

cost_limit_monthly_usd: 50

release_criteria:
  test_coverage_min: 80
  security_scan: passed
  spec_compliance: passed
```

### CI Zorunluluğu

```
PR değişiklikleri
    │
    ▼
spec compliance check (spec'e aykırı mı?)
    │
    ▼
testler + policy check
    │
    ▼
merge izni
```

---

## 11. Denetim Kanıtları

### SLSA Provenance

Her artefact için "nerede/nasıl/ne girdilerle üretildi" bilgisi:

```
GitHub Actions build
    │
    ▼ cosign ile imzala
Container Image + SBOM + Provenance
    │
    ▼ Kyverno/Gatekeeper
"İmzasız image cluster'a giremez"
```

### Sigstore/cosign

```bash
# Image imzalama (CI'da)
cosign sign --key env://COSIGN_PRIVATE_KEY ghcr.io/omerfarukkural/mutluet-backend:v1.0.0

# Attestation doğrulama
cosign verify-attestation \
  --type slsaprovenance \
  --certificate-identity "https://github.com/omerfarukkural/Mutluet/.github/workflows/build.yml@refs/heads/main" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/omerfarukkural/mutluet-backend:v1.0.0
```

---

## 12. MCP ve Ajan Araç Erişimi

Anthropic'in **Model Context Protocol (MCP)**, uygulamaların LLM'lere context ve tool sağlamasını standardize eden açık protokoldür.

### Bağlantı Standardizasyonu

Slack, GitHub, Google Drive, Calendar gibi kaynaklara ajan erişimini tek tek özel entegrasyon yazmak yerine **MCP server'lar ile standardize et**.

### Üretim Gereksinimleri

- ✅ Yetki sınırları kontrol katmanı tarafından yönetilmeli
- ✅ Tüm araç çağrıları audit log'a yazılmalı
- ✅ OAuth bearer token desteği
- ⚠️ MCP server'ın public HTTP olması gerekir (kısıtlama)

---

## 13. Ajan Zamanlaması

Saat dilimi: **Europe/Istanbul**

| Zaman | Ajan | Görev |
|-------|------|-------|
| 02:00–05:00 | Araştırma Ajanı | Site analitiği, formlar, ticket/backlog, sosyal sinyallerden özet |
| 05:00–06:00 | Ürün Yönetimi Ajanı | Skorlar, "ilk 3 ihtiyaç" shortlist, karar kaydı taslağı |
| 10:00–12:00 | Mimari Ajan + Tasarım Ajanı | Spec güncelleme, mimari diyagram, veri modeli |
| 13:00–17:00 | Kod Üretim Ajanı | Şablonlardan modül üretimi |
| 17:00–19:00 | Test + Güvenlik Ajanı | Policy check, RBAC, container hardening, supply chain attestation |
| 20:00+ | Dağıtım Ajanı | GitOps PR açma, Argo CD sync izleme, canary/rollback |

> **Kritik kural:** Ajanlar 7/24 yazabilir ama **merge/deploy "gates" saatlerini sabitle** (operasyonel sürpriz azalır).

---

## 14. Bootstrap `.env` Şablonu

Tüm detaylar için: [`.env.example`](./.env.example)

Bootstrap aşamasında kullanıcının yapması gereken tek şey:
1. `.env.example` dosyasını `.env` olarak kopyala
2. `__FILL__` değerlerini doldur
3. `./scripts/bootstrap.sh` çalıştır (secret'ları vault'a taşır)

---

## 15. Kritik Riskler ve Kontrol Listesi

### En Büyük Risk: Yetki Genişlemesi ve Kontrolsüz Otomasyon

| Kontrol | Durum |
|---------|-------|
| ✅ Spec sözleşmesi var mı? | Her ürün için `specs/<product>/spec.yaml` |
| ✅ Test kapısı var mı? | CI'da `%80 kapsam` zorunlu |
| ✅ Policy-as-code var mı? | Kyverno ClusterPolicy |
| ✅ Secret sızıntısı denetimi var mı? | GitGuardian + ESO |
| ✅ Provenance + imzalı artefact var mı? | SLSA + cosign |
| ✅ GitOps üzerinden geri alınabilir dağıtım var mı? | Argo CD |
| ✅ WordPress entegrasyonu revokable kimlikle mi? | Application Passwords |
| ✅ NetworkPolicy default-deny var mı? | Her namespace'de |
| ✅ Pod Security Restricted profile var mı? | Üretim namespace'leri |

### Platform Referans Linkleri

| Servis | Bağlantı |
|--------|----------|
| Azure Portal | https://portal.azure.com |
| Google Cloud Console | https://console.cloud.google.com |
| MongoDB Atlas | https://cloud.mongodb.com |
| External Secrets Operator | https://external-secrets.io |
| Argo CD | https://argo-cd.readthedocs.io |
| OpenGitOps | https://opengitops.dev/about |
| Kyverno | https://kyverno.io/docs/introduction/ |
| WordPress App Passwords | https://developer.wordpress.org/advanced-administration/security/application-passwords/ |
| Tauri macOS Signing | https://tauri.app/distribute/sign/macos/ |
| Anthropic MCP | https://docs.anthropic.com/en/docs/mcp |
| SLSA Provenance | https://slsa.dev/spec/v1.0-rc1/provenance |
| Sigstore/cosign | https://docs.sigstore.dev/cosign/verifying/attestation/ |

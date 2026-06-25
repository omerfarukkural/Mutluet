# DNS Kurulum Rehberi — n8n Çift Domain

n8n tek VM'de çalışır, iki farklı domain üzerinden erişilir.

## Hedef Yapı

```
n8n.bitebimuv.org  ──┐
                      ├──► 34.141.16.229 (GCP VM) ──► n8n :5678
n8n.mutluet.org   ──┘
```

---

## 1. bitebimuv.org — Turhost DNS

**Panel:** https://panel.turhost.com/domain/manage/526509

Eklenecek kayıt:

| Tür | Host | Değer          | TTL  |
|-----|------|----------------|------|
| A   | n8n  | 34.141.16.229  | 300  |

> `n8n.bitebimuv.org` kaydı zaten mevcutsa güncelle.

---

## 2. mutluet.org — Squarescape DNS

**Squarescape paneline gir → mutluet.org → DNS Yönetimi**

Eklenecek kayıt:

| Tür | Host | Değer          | TTL  |
|-----|------|----------------|------|
| A   | n8n  | 34.141.16.229  | 300  |

---

## 3. DNS Yayılımını Doğrula

```bash
# Her iki domain de 34.141.16.229 döndürmeli
dig n8n.bitebimuv.org  +short
dig n8n.mutluet.org    +short

# Veya online kontrol:
# https://dnschecker.org
```

DNS yayılımı genellikle 5-30 dakika sürer (TTL 300 ise ~5 dk).

---

## 4. Kurulumu Başlat

DNS kayıtları doğrulandıktan sonra:

```bash
# Scripti VM'e kopyala
gcloud compute scp infra/n8n-install.sh admin@n8n-server:/tmp/ \
  --zone=europe-west3-c --project=creator-hub-ai-63948

# VM'de çalıştır
gcloud compute ssh admin@n8n-server \
  --zone=europe-west3-c --project=creator-hub-ai-63948 \
  -- "sudo bash /tmp/n8n-install.sh"
```

Script şunları yapar:
- DNS kontrolü (her iki domain)
- Docker, Nginx, PostgreSQL kurulumu
- **SAN SSL sertifikası** (tek cert, iki domain kapsıyor)
- Her iki domain için ayrı Nginx server block
- Otomatik yenileme (certbot 12 saatte bir kontrol eder)

---

## 5. Kurulum Sonrası Erişim

| URL | Açıklama |
|-----|----------|
| https://n8n.bitebimuv.org | Primary domain |
| https://n8n.mutluet.org   | Secondary domain |

İkisi de **aynı n8n instance**'ına bağlanır.  
Webhook URL'leri `n8n.bitebimuv.org` üzerinden çalışır (primary domain).

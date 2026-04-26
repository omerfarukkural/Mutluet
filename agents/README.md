# 🤖 AI-Ajan Fabrikası — Ajan Dizini

Bu dizin, Mutluet/Bitebimuv AI-Ajan Fabrikası'nın ajan tanımlarını içerir.

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `schedule.yaml` | Tüm ajan rolleri, zamanlama ve konfigürasyonları |

## Ajan Hattı

```
02:00  Araştırma Ajanı     → veri topla, ihtiyaç sinyalleri çıkar
05:00  Ürün Yönetimi Ajanı → ihtiyaçları skorla, shortlist üret
10:00  Mimari Ajan          → spec + mimari diyagram + veri modeli
13:00  Kod Üretim Ajanı     → şablonlardan modül üret
17:00  Test Ajanı           → %80 test kapsamı zorla
17:30  Güvenlik Ajanı       → secret tarama, CVE, policy check, cosign
20:00  Dağıtım Ajanı        → GitOps PR aç, Argo CD sync izle
∞      Gözlemleme Ajanı     → SLO/SLI izleme, geri besleme (15 dak.)
```

## Kurallar

1. **Spec uyumu zorunlu:** Ajanlar `specs/<product>/spec.yaml` dosyasına aykırı davranamaz.
2. **Deploy gate:** Merge/deploy yalnızca 10:00–22:00 saatlerinde gerçekleşir.
3. **Her eylem audit log'a:** `audit_required: true` olan ajanların tüm eylemleri kayıt altına alınır.
4. **Secret'lar vault'tan:** Ajanlar hiçbir zaman kod içine secret yazmaz.
5. **İmzasız image çalışmaz:** Cluster admission'da Kyverno politikası zorunludur.

## Ekleme / Güncelleme

```bash
# Yeni ajan eklemek için schedule.yaml dosyasını düzenle
# ve PR aç — spec compliance check otomatik çalışır
```

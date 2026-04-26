# specs/ — Ürün Spesifikasyon Dizini

Bu dizin, fabrikada üretilen her ürün için **tek kaynak-of-truth** spesifikasyon dosyalarını içerir.

## Dizin Yapısı

```
specs/
├── README.md                  # Bu dosya
├── _template/
│   └── spec.yaml              # Yeni ürün şablonu
└── <product-id>/
    └── spec.yaml              # Ürün spesifikasyonu
```

## Kural

> **"Ajanlar kodu değiştirebilir ama spec'e aykırı davranamaz."**

CI pipeline'ında her PR için otomatik `spec compliance check` çalışır.
Test + policy check + spec compliance check geçmeden merge yapılamaz.

## Yeni Ürün Eklemek

```bash
# 1. Yeni dizin oluştur
mkdir -p specs/<product-id>

# 2. Şablondan kopyala
cp specs/_template/spec.yaml specs/<product-id>/spec.yaml

# 3. Değerleri doldur ve PR aç
```

# Mutluet AI Phone Optimizer — Android

Claude AI destekli, doğal dil komutlarıyla telefonu yöneten akıllı Android uygulaması.

## Özellikler

| Özellik | Açıklama |
|---|---|
| **AI Sohbet** | "Telefonumu optimize et" gibi doğal dil komutları |
| **Fotoğraf Yönetimi** | Benzer fotoğrafları grupla, en iyisini seç, kötüleri çöpe taşı |
| **Depolama Analizi** | Büyük dosyalar, tekrarlar, önbellek temizleme |
| **Süreç Yönetimi** | Batarya/RAM tüketen uygulamaları listele ve durdur |
| **Telefon Optimizasyon** | RAM, CPU, batarya analizi ve öneriler |
| **Geliştirme Ortamı** | Termux ile Android/Node.js/Python geliştirme ortamı kurma |
| **Kullanıcı Onayı** | Her kritik işlem için onay dialogu |

## Mimari

```
User → ChatScreen (Jetpack Compose)
         ↓
  AgentOrchestrator  ←→  ClaudeApiService (HTTP + Tool Use)
    ↓    ↓    ↓    ↓    ↓    ↓
  PhoneOptimizationAgent
  ProcessManagerAgent
  PhotoManagerAgent
  FileOrganizationAgent
  StorageCleanupAgent
  DevEnvironmentAgent
    ↓
  Android APIs (MediaStore, UsageStats, PackageManager, ActivityManager…)
```

## Kurulum

### Gereksinimler
- Android Studio Ladybug (2024.2+) veya sonrası
- Android SDK 26+ (Android 8.0)
- Anthropic Claude API anahtarı ([platform.anthropic.com](https://platform.anthropic.com))

### Adımlar

1. **Projeyi klonla:**
   ```bash
   git clone https://github.com/omerfarukkural/Mutluet.git
   cd Mutluet/android
   ```

2. **Android Studio ile aç:**
   - File > Open > `Mutluet/android` klasörünü seç

3. **`local.properties` düzenle:**
   ```properties
   sdk.dir=/home/kullaniciadiniz/Android/Sdk
   ```

4. **Derle:**
   ```bash
   ./gradlew assembleDebug
   ```
   APK: `app/build/outputs/apk/debug/app-debug.apk`

5. **Telefona yükle:**
   - `adb install app/build/outputs/apk/debug/app-debug.apk`
   - Veya APK'yı telefona kopyalayıp aç (bilinmeyen kaynak izni gerekli)

6. **API Anahtarı Gir:**
   - Uygulamayı aç → Ayarlar → Claude API Anahtarı
   - [platform.anthropic.com](https://platform.anthropic.com) → API Keys

## İzinler

Uygulama şu izinleri kullanır (gerekçesiyle):

| İzin | Neden |
|---|---|
| `PACKAGE_USAGE_STATS` | Uygulama kullanım süresi ve batarya analizi |
| `READ_MEDIA_IMAGES` | Fotoğraf yönetimi |
| `MANAGE_EXTERNAL_STORAGE` | Dosya organizasyonu (Android 11+) |
| `KILL_BACKGROUND_PROCESSES` | Arka plan süreç durdurma |
| `INTERNET` | Claude API çağrıları |

> **Not:** `PACKAGE_USAGE_STATS` ve bazı diğer izinler sistem tarafından korunan izinlerdir.
> İlk kullanımda sizi Ayarlar > Uygulamalar > Özel Uygulama Erişimi sayfasına yönlendirir.

## Teknoloji Yığını

- **Dil:** Kotlin 2.0
- **UI:** Jetpack Compose + Material Design 3
- **DI:** Hilt
- **Ağ:** OkHttp + LaunchDarkly EventSource (SSE)
- **Serialization:** kotlinx.serialization
- **Güvenli Depolama:** EncryptedSharedPreferences (API key)
- **Arka Plan:** WorkManager
- **Image:** Coil
- **AI:** Anthropic Claude API (claude-sonnet-4-6)

## APK Derleme

```bash
# Debug APK (geliştirme / sideload)
./gradlew assembleDebug
# Çıktı: app/build/outputs/apk/debug/app-debug.apk

# Release APK (Play Store / dağıtım)
# 1. Keystore oluştur:
keytool -genkey -v -keystore mutluet-optimizer.jks \
  -alias optimizer -keyalg RSA -keysize 4096 -validity 10000

# 2. Release build:
./gradlew assembleRelease
# Çıktı: app/build/outputs/apk/release/app-release.apk
```

## Desteklenen Android Sürümleri

- Minimum: Android 8.0 (API 26)
- Hedef: Android 15 (API 35)
- Önerilen: Android 11+ (API 30) — tam özellik seti için

## Güvenlik

- API anahtarı `EncryptedSharedPreferences` ile AES256-GCM şifrelemesiyle saklanır
- API anahtarı hiçbir zaman üçüncü tarafa gönderilmez; yalnızca `api.anthropic.com` adresine
- Yedekleme dosyalarından şifreli tercihler hariç tutulur
- Her kritik işlem (silme, durdurma) için kullanıcı onayı zorunludur

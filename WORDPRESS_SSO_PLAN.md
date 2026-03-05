# WordPress Otomatik Giriş Sistemi (SSO) - İyilik Fabrikası

## Hedef
mutluet.org WordPress sitesini açtığınızda, uygulama hesabınızla otomatik olarak giriş yapmış olmanız.

## Mimari

```
[React App] ←→ [Backend API] ←→ [WordPress]
   (JWT)         (Bridge)         (WordPress Auth)
```

## Çözüm Yöntemleri

### Yöntem 1: JWT + WordPress Plugin (ÖNERİLEN)

#### A) Backend'de WordPress Auth Endpoint

```typescript
// backend/src/routes/wordpress.routes.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';

const router = Router();

// WordPress için giriş token'ı oluştur
router.get('/auth/wordpress-token', authenticate, async (req, res) => {
  try {
    const user = req.user; // JWT middleware'den geliyor

    // WordPress için özel token oluştur (kısa ömürlü)
    const wpToken = jwt.sign(
      {
        email: user.email,
        name: user.name,
        user_id: user.id,
        exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 dakika
      },
      process.env.WORDPRESS_JWT_SECRET
    );

    res.json({ success: true, token: wpToken });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Token oluşturulamadı' });
  }
});

export default router;
```

#### B) WordPress Plugin (PHP)

WordPress'e özel plugin yükle: **Mutluet SSO Connector**

```php
<?php
/**
 * Plugin Name: Mutluet SSO Connector
 * Description: React uygulamasından otomatik giriş sağlar
 * Version: 1.0.0
 * Author: Mutluet
 */

// WordPress'e giriş yaptır
add_action('init', 'mutluet_auto_login');

function mutluet_auto_login() {
    // Token'ı query string'den al
    if (isset($_GET['mutluet_token'])) {
        $token = sanitize_text_field($_GET['mutluet_token']);

        // Token'ı doğrula
        $user_data = mutluet_verify_jwt($token);

        if ($user_data) {
            // WordPress kullanıcısını bul veya oluştur
            $user = get_user_by('email', $user_data->email);

            if (!$user) {
                // Kullanıcı yoksa oluştur
                $user_id = wp_create_user(
                    $user_data->email,
                    wp_generate_password(),
                    $user_data->email
                );
                wp_update_user([
                    'ID' => $user_id,
                    'display_name' => $user_data->name,
                    'role' => 'subscriber'
                ]);
                $user = get_user_by('id', $user_id);
            }

            // Otomatik giriş yap
            wp_set_current_user($user->ID);
            wp_set_auth_cookie($user->ID, true);
            do_action('wp_login', $user->user_login, $user);

            // Ana sayfaya yönlendir (token'sız)
            wp_redirect(home_url());
            exit;
        }
    }
}

function mutluet_verify_jwt($token) {
    require_once plugin_dir_path(__FILE__) . 'vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    try {
        $secret = get_option('mutluet_jwt_secret'); // Admin panelden ayarlanan
        $decoded = JWT::decode($token, new Key($secret, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        error_log('JWT doğrulama hatası: ' . $e->getMessage());
        return false;
    }
}

// Admin panelde ayar sayfası
add_action('admin_menu', 'mutluet_settings_page');

function mutluet_settings_page() {
    add_options_page(
        'Mutluet SSO Ayarları',
        'Mutluet SSO',
        'manage_options',
        'mutluet-sso',
        'mutluet_settings_render'
    );
}

function mutluet_settings_render() {
    if (isset($_POST['mutluet_jwt_secret'])) {
        update_option('mutluet_jwt_secret', sanitize_text_field($_POST['mutluet_jwt_secret']));
        echo '<div class="notice notice-success"><p>Ayarlar kaydedildi!</p></div>';
    }

    $secret = get_option('mutluet_jwt_secret', '');
    ?>
    <div class="wrap">
        <h1>Mutluet SSO Ayarları</h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th>JWT Secret</th>
                    <td>
                        <input type="text" name="mutluet_jwt_secret"
                               value="<?php echo esc_attr($secret); ?>"
                               class="regular-text" required>
                        <p class="description">Backend'deki WORDPRESS_JWT_SECRET ile aynı olmalı</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Kaydet'); ?>
        </form>
    </div>
    <?php
}
```

#### C) React Frontend Entegrasyonu

```typescript
// src/utils/wordpress-sso.ts
export async function redirectToWordPress() {
  try {
    // Backend'den WordPress token'ı al
    const response = await fetch('/api/wordpress/auth/wordpress-token', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('WordPress token alınamadı');
    }

    const { token } = await response.json();

    // WordPress'e yönlendir (token ile)
    window.location.href = `https://mutluet.org/?mutluet_token=${token}`;
  } catch (error) {
    console.error('WordPress SSO hatası:', error);
    // Fallback: WordPress'i normal şekilde aç
    window.open('https://mutluet.org', '_blank');
  }
}

// Kullanımı:
// <Button onClick={redirectToWordPress}>
//   WordPress'e Git
// </Button>
```

---

### Yöntem 2: OAuth 2.0 (Daha Profesyonel)

#### WordPress OAuth Server Plugin
- WordPress'e **WP OAuth Server** plugin'i kur
- React App'i OAuth Client olarak kaydet
- Authorization Code Flow kullan

**Avantajlar:**
- Endüstri standardı
- Daha güvenli
- Revoke token özelliği

**Dezavantajlar:**
- Kurulumu daha karmaşık
- Ekstra plugin gerekiyor

---

### Yöntem 3: Shared Session (Cookie)

WordPress ve React App aynı domain'de ise:

```typescript
// Backend: WordPress cookie'sini paylaş
res.cookie('wp_auth', wpSessionId, {
  domain: '.mutluet.org', // hem app.mutluet.org hem mutluet.org için geçerli
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});
```

**Not:** WordPress ayrı bir domain'de olduğu için bu yöntem tavsiye edilmez.

---

## Önerilen Uygulama Adımları

### 1. Backend Kurulumu

```bash
cd backend
```

**Environment Variables Ekle:**
```bash
# backend/.env
WORDPRESS_JWT_SECRET="mutluet-wordpress-sso-secret-2026"
WORDPRESS_URL="https://mutluet.org"
```

**Route'u Kaydet:**
```typescript
// backend/src/index.ts
import wordpressRoutes from './routes/wordpress.routes';

app.use('/api/wordpress', wordpressRoutes);
```

### 2. WordPress Plugin Kurulumu

**A) Plugin Dosyası Oluştur:**
```
wp-content/
  plugins/
    mutluet-sso-connector/
      mutluet-sso-connector.php (yukarıdaki PHP kodu)
      composer.json (JWT library için)
```

**B) composer.json:**
```json
{
  "require": {
    "firebase/php-jwt": "^6.8"
  }
}
```

**C) Composer Install:**
```bash
cd wp-content/plugins/mutluet-sso-connector
composer install
```

**D) WordPress Admin'de Aktif Et:**
1. Plugins > Installed Plugins
2. "Mutluet SSO Connector" → Activate
3. Settings > Mutluet SSO
4. JWT Secret gir (backend'deki ile aynı)
5. Save

### 3. Frontend Kurulumu

**Component Ekle:**
```typescript
// src/components/WordPressButton.tsx
import { Button } from '@/components/ui/button';
import { redirectToWordPress } from '@/utils/wordpress-sso';

export function WordPressButton() {
  return (
    <Button onClick={redirectToWordPress} variant="outline">
      🌐 WordPress Sitesine Git
    </Button>
  );
}
```

**Profil Sayfasına Ekle:**
```typescript
// src/app/profile/page.tsx
import { WordPressButton } from '@/components/WordPressButton';

// ...
<div className="mt-4">
  <WordPressButton />
</div>
```

### 4. Azure'da Ayarlar

**Azure Key Vault:**
```bash
# WordPress JWT Secret'ı ekle
az keyvault secret set \
  --vault-name mutluet-vault \
  --name WORDPRESS-JWT-SECRET \
  --value "mutluet-wordpress-sso-secret-2026"
```

**Azure App Service (Backend):**
- Configuration > Environment Variables
- `WORDPRESS_JWT_SECRET` → Key Vault Reference ekle

---

## Güvenlik Önlemleri

### 1. Token Ömrü
- WordPress token'ları kısa ömürlü olmalı (5-15 dakika)
- Tek kullanımlık (one-time use) tercih edilmeli

### 2. HTTPS Zorunluluğu
- Tüm iletişim HTTPS üzerinden
- Production'da HTTP kabul edilmemeli

### 3. Rate Limiting
```typescript
// backend/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const wpAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // Maksimum 10 istek
  message: 'Çok fazla istek, lütfen bekleyin'
});

// Kullanımı:
router.get('/auth/wordpress-token', wpAuthLimiter, authenticate, ...);
```

### 4. IP Whitelist (Opsiyonel)
```php
// WordPress plugin'de
function mutluet_verify_ip() {
    $allowed_ips = ['52.x.x.x', '13.x.x.x']; // Azure IP'leri
    $client_ip = $_SERVER['REMOTE_ADDR'];

    if (!in_array($client_ip, $allowed_ips)) {
        wp_die('Erişim reddedildi');
    }
}
add_action('init', 'mutluet_verify_ip', 1);
```

---

## Test Senaryosu

### Manuel Test:
1. React App'e giriş yap
2. Profil sayfasına git
3. "WordPress'e Git" butonuna tıkla
4. WordPress'e otomatik giriş yapılmalı
5. WordPress'te giriş yapmış olarak görünmelisin

### Debugging:
```bash
# Backend logs
tail -f backend/logs/app.log

# WordPress logs
tail -f wp-content/debug.log

# Frontend console
# Chrome DevTools > Console
```

---

## Alternatif: n8n ile Otomasyon

Eğer WordPress'e giriş zorunlu değilse:

```yaml
# n8n workflow
trigger: HTTP Webhook (kullanıcı mutluet.org'u açar)
action_1: Backend'den kullanıcı bilgisi al
action_2: WordPress API ile içerik özelleştir
action_3: Kullanıcıya özel sayfa göster
```

---

## Deployment Checklist

- [ ] Backend'de `/api/wordpress/auth/wordpress-token` endpoint'i ekle
- [ ] WordPress plugin'i oluştur ve yükle
- [ ] WordPress'te plugin'i aktif et ve JWT secret ayarla
- [ ] Frontend'de `redirectToWordPress()` fonksiyonunu ekle
- [ ] Azure Key Vault'a `WORDPRESS_JWT_SECRET` ekle
- [ ] Production'da test et
- [ ] Rate limiting aktif et
- [ ] HTTPS sertifikalarını doğrula

---

## Maliyet
- **Ücretsiz:** Tüm adımlar mevcut altyapıda çalışır
- **Ekstra:** Sadece geliştirme zamanı (~4-6 saat)

---

## Sonuç

**En Pratik Çözüm:** JWT + WordPress Plugin (Yöntem 1)

**Sıra:**
1. Backend'de endpoint ekle (30 dakika)
2. WordPress plugin yaz (1 saat)
3. Frontend'de buton ekle (15 dakika)
4. Test et (30 dakika)
5. Production'a deploy et (45 dakika)

**Toplam Süre:** ~3 saat

---

**Hazırlık:** Claude Code
**Tarih:** 4 Mart 2026
**Proje:** Mutluet İyilik Fabrikası

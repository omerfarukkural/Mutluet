/**
 * Secret Management - Environment Variables Based
 * Tüm secretlar .env dosyasından veya platform environment variables'dan okunur.
 */

const secretCache: Record<string, string> = {};

/**
 * Secret'ı environment variable'dan al
 * Secret adı formatı: "JWT-SECRET" → "JWT_SECRET" dönüşümü yapılır
 */
export async function getSecret(secretName: string): Promise<string> {
  // Cache'den kontrol et
  if (secretCache[secretName]) {
    return secretCache[secretName];
  }

  // Environment variable'dan al (tire → alt çizgi dönüşümü)
  const envKey = secretName.replace(/-/g, '_');
  const envValue = process.env[envKey] || process.env[envKey.toUpperCase()];

  if (envValue) {
    secretCache[secretName] = envValue;
    return envValue;
  }

  console.warn(`⚠️ Secret bulunamadı: ${secretName} (env: ${envKey})`);
  throw new Error(`Secret ${secretName} bulunamadı. Lütfen .env dosyasına ${envKey} ekleyin.`);
}

/**
 * Tüm secretları başlangıçta yükle ve doğrula
 */
export async function loadSecrets(): Promise<void> {
  const requiredSecrets = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const optionalSecrets = [
    'STRIPE_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'WORDPRESS_JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SMTP_USER',
    'SMTP_PASS',
    'CLOUDINARY_CLOUD_NAME',
    'SENTRY_DSN',
  ];

  console.log('🔑 Environment secrets kontrol ediliyor...');

  // Zorunlu secretlar
  for (const name of requiredSecrets) {
    if (!process.env[name]) {
      console.error(`❌ Zorunlu secret eksik: ${name}`);
    } else {
      secretCache[name] = process.env[name]!;
      console.log(`  ✅ ${name}`);
    }
  }

  // Opsiyonel secretlar
  for (const name of optionalSecrets) {
    if (process.env[name]) {
      secretCache[name] = process.env[name]!;
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ⚠️ ${name} (opsiyonel, tanımlı değil)`);
    }
  }

  console.log('✅ Secret kontrolü tamamlandı');
}

/**
 * Secret'ı senkron olarak cache veya env'den al
 */
export function getSecretSync(secretName: string): string | undefined {
  // Cache'den kontrol et
  if (secretCache[secretName]) {
    return secretCache[secretName];
  }

  // Environment variable'dan al
  const envKey = secretName.replace(/-/g, '_');
  return process.env[envKey] || process.env[envKey.toUpperCase()];
}

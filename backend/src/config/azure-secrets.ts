import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';

// ═══════════════════════════════════════════════════════════════
// AZURE KEY VAULT MERKEZİ SIR YÖNETİMİ
// ═══════════════════════════════════════════════════════════════
// Bu modül TÜM uygulamaların (backend, frontend proxy, Flutter,
// iOS/macOS) ihtiyaç duyduğu sırları Azure Key Vault'tan çeker.
//
// Vault: https://anahtar.vault.azure.net/
// Kullanım:
//   import { getSecret, getSecretSync, loadSecrets } from './azure-secrets.js';
//   const dbUrl = await getSecret('DATABASE-URL');
//   const cached = getSecretSync('JWT-SECRET');
// ═══════════════════════════════════════════════════════════════

const VAULT_URL = process.env.AZURE_KEY_VAULT_URL || 'https://anahtar.vault.azure.net/';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat

// ─── Secret Cache ────────────────────────────────────────────
interface CachedSecret {
  value: string;
  fetchedAt: number;
}

const secretCache: Map<string, CachedSecret> = new Map();
let client: SecretClient | null = null;

// ─── Key Vault Client ────────────────────────────────────────
function getClient(): SecretClient {
  if (!client) {
    let credential;

    // Service Principal varsa onu kullan (CI/CD ve production)
    if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
      credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );
      console.log('🔐 Key Vault: Service Principal ile bağlanılıyor...');
    } else {
      // Fallback: Azure CLI, Managed Identity, VS Code, vb.
      credential = new DefaultAzureCredential();
      console.log('🔐 Key Vault: DefaultAzureCredential ile bağlanılıyor...');
    }

    client = new SecretClient(VAULT_URL, credential);
  }
  return client;
}

// ─── ENV key → Key Vault key dönüşümü ───────────────────────
export function envToVaultKey(envKey: string): string {
  return envKey.replace(/_/g, '-');
}

export function vaultToEnvKey(vaultKey: string): string {
  return vaultKey.replace(/-/g, '_');
}

// ─── Secret Okuma (async) ────────────────────────────────────
export async function getSecret(secretName: string): Promise<string> {
  const vaultKey = envToVaultKey(secretName);

  // Cache'den kontrol et (TTL dahilinde)
  const cached = secretCache.get(vaultKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    const kvClient = getClient();
    const secret = await kvClient.getSecret(vaultKey);

    if (!secret.value) {
      throw new Error(`Secret '${vaultKey}' Key Vault'ta boş`);
    }

    secretCache.set(vaultKey, { value: secret.value, fetchedAt: Date.now() });
    return secret.value;
  } catch (error: any) {
    // Fallback: Environment variable
    const envKey = vaultToEnvKey(vaultKey);
    const envValue = process.env[envKey] || process.env[secretName];
    if (envValue && !envValue.startsWith('[Eksik')) {
      console.warn(`⚠️  Key Vault fallback → env: ${envKey}`);
      return envValue;
    }
    throw new Error(`Secret '${vaultKey}' bulunamadı (Key Vault + env): ${error.message}`);
  }
}

// ─── Secret Okuma (sync, sadece cache/env) ───────────────────
export function getSecretSync(secretName: string): string | undefined {
  const vaultKey = envToVaultKey(secretName);

  const cached = secretCache.get(vaultKey);
  if (cached) return cached.value;

  const envKey = vaultToEnvKey(vaultKey);
  return process.env[envKey] || process.env[secretName];
}

// ─── Uygulama Bazlı Secret Grupları ─────────────────────────
export const SECRET_GROUPS = {
  backend_core: [
    'JWT-SECRET',
    'POSTGRES-PRISMA-URL',
    'POSTGRES-PASSWORD',
    'SUPABASE-SERVICE-ROLE-KEY',
    'SUPABASE-JWT-SECRET',
  ],
  wordpress: [
    'WORDPRESS-JWT-SECRET',
    'WORDPRESS-URL',
  ],
  ai: [
    'OPENAI-API-KEY',
    'CLAUDE-API-KEY',
    'GEMINI-API-KEY',
    'PERPLEXITY-API-KEY',
  ],
  payment: [
    'STRIPE-SECRET-KEY',
    'STRIPE-WEBHOOK-SECRET',
  ],
  google: [
    'GOOGLE-CLIENT-ID',
    'GOOGLE-CLIENT-SECRET',
    'GOOGLE-MAPS-API-KEY-BACKEND',
  ],
  communication: [
    'SENDGRID-API-KEY',
    'AZURE-COMMUNICATION-CONNECTION-STRING',
  ],
  storage: [
    'AZURE-STORAGE-CONNECTION-STRING',
    'MONGODB-URI',
    'MONGODB-PASSWORD',
  ],
  monitoring: [
    'APPLICATIONINSIGHTS-CONNECTION-STRING',
    'SENTRY-DSN',
  ],
  frontend_public: [
    'NEXT-PUBLIC-SUPABASE-URL',
    'NEXT-PUBLIC-SUPABASE-ANON-KEY',
  ],
} as const;

export const ALL_SECRETS = Object.values(SECRET_GROUPS).flat();

// ─── Toplu Yükleme ──────────────────────────────────────────
export async function loadSecrets(groups?: (keyof typeof SECRET_GROUPS)[]): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('⚠️  Development mode: Key Vault atlanıyor, .env kullanılıyor');
    for (const key of ALL_SECRETS) {
      const envKey = vaultToEnvKey(key);
      const val = process.env[envKey];
      if (val && !val.startsWith('[Eksik')) {
        secretCache.set(key, { value: val, fetchedAt: Date.now() });
      }
    }
    console.log(`✅ ${secretCache.size} secret env'den cache'e alındı`);
    return;
  }

  const secretsToLoad = groups
    ? groups.flatMap(g => SECRET_GROUPS[g])
    : ALL_SECRETS;

  const uniqueSecrets = [...new Set(secretsToLoad)];

  console.log(`🔑 Key Vault'tan ${uniqueSecrets.length} secret yükleniyor...`);
  console.log(`   Vault: ${VAULT_URL}`);

  const results = await Promise.allSettled(
    uniqueSecrets.map(async name => {
      try {
        await getSecret(name);
        return { name, status: 'ok' as const };
      } catch (err: any) {
        return { name, status: 'fail' as const, error: err.message };
      }
    })
  );

  let loaded = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.status === 'ok') {
      loaded++;
    } else {
      failed++;
      const detail = result.status === 'fulfilled' ? result.value : result;
      console.warn(`   ⚠️  ${JSON.stringify(detail)}`);
    }
  }

  console.log(`✅ ${loaded}/${uniqueSecrets.length} secret yüklendi (${failed} başarısız)`);
}

// ─── Cache Temizleme ─────────────────────────────────────────
export function clearSecretCache(): void {
  secretCache.clear();
  console.log('🗑️  Secret cache temizlendi');
}

// ─── Secret Durumu ───────────────────────────────────────────
export function getSecretStatus(): { total: number; cached: number; expired: number; missing: string[] } {
  const now = Date.now();
  let cached = 0;
  let expired = 0;
  const missing: string[] = [];

  for (const key of ALL_SECRETS) {
    const entry = secretCache.get(key);
    if (!entry) {
      missing.push(key);
    } else if (now - entry.fetchedAt > CACHE_TTL_MS) {
      expired++;
    } else {
      cached++;
    }
  }

  return { total: ALL_SECRETS.length, cached, expired, missing };
}

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
      console.log(`Using environment variable for ${secretName}`);
      return envValue;
    }
    throw error;
  }
}

// Tüm sırları başlangıçta yükle
export async function loadSecrets() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('⚠️  Development mode: Skipping Key Vault, using environment variables');
    return;
  }

  try {
    const secrets = [
      'DATABASE-URL',
      'JWT-SECRET',
      'STRIPE-SECRET-KEY',
      'GOOGLE-CLIENT-ID',
      'GOOGLE-CLIENT-SECRET',
      'WORDPRESS-JWT-SECRET'
    ];

    console.log('🔑 Loading secrets from Azure Key Vault...');
    await Promise.all(secrets.map(name => getSecret(name).catch(err => {
      console.warn(`⚠️  Failed to load ${name}:`, err.message);
    })));
    console.log('✅ Secrets loaded from Key Vault');
  } catch (error) {
    console.warn('⚠️ Some secrets failed to load, using environment variables');
  }
}

// Helper function to get secret synchronously from cache or env
export function getSecretSync(secretName: string): string | undefined {
  // Try cache first
  if (secretCache[secretName]) {
    return secretCache[secretName];
  }

  // Fallback to environment variable
  return process.env[secretName.replace(/-/g, '_')];
}

# 🐛 HATA ÖNLEME VE DEBUG REHBERİ

## 📋 İÇİNDEKİLER

1. [Karşılaştığımız Hata ve Çözümü](#karşılaştığımız-hata)
2. [Hataların Anatomisi](#hataların-anatomisi)
3. [Production'da Hata Önleme](#productionda-hata-önleme)
4. [Debugging Teknikleri](#debugging-teknikleri)
5. [Error Boundary Sistemi](#error-boundary)
6. [Linting ve Type Checking](#linting)

---

## 🔴 KARŞILAŞTIĞIMIZ HATA

### Hata Mesajı:
```
[vite] Internal server error: Failed to resolve import "react-router-dom"
from "src/app/components/admin-dashboard.tsx". Does the file exist?

Plugin: vite:import-analysis
File: /Users/omerfarukkural/Mutluet/src/app/components/admin-dashboard.tsx:2:28

  19 |  import { useNavigate } from "react-router-dom";
     |                               ^
```

### Hatanın Sebebi:

**YANLIŞ KOD:**
```typescript
import { useNavigate } from "react-router-dom";  // ❌ HATALI
```

**DOĞRU KOD:**
```typescript
import { useNavigate } from "react-router";  // ✅ DOĞRU
```

### Neden Böyle Oldu?

1. **Projede `react-router` v7 kullanılıyor**
   - `react-router` v7'de paket ismi değişti
   - Eski: `react-router-dom`
   - Yeni: `react-router`

2. **Cache sorunu:**
   - Vite dosyayı cache'ledi
   - Tarayıcıda eski kod gösterildi
   - `node_modules/.vite` klasöründe eski import kaldı

3. **Alışkanlık:**
   - React Router v6'da `react-router-dom` kullanılıyordu
   - Otomatik tamamlama yanlış öneri verdi

### Çözüm:

```bash
# 1. Vite cache'i temizle
rm -rf node_modules/.vite

# 2. Tarayıcıda hard refresh
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# 3. Development server'ı yeniden başlat (gerekirse)
# Ctrl + C ile durdur, pnpm dev ile başlat
```

---

## 🔍 HATALARIN ANATOMİSİ

### Import Hatası Türleri

#### 1. Paket Bulunamadı
```typescript
import { Component } from "non-existent-package";
// ❌ Error: Cannot find module 'non-existent-package'
```

**Çözüm:**
```bash
# Paketi yükle
pnpm install non-existent-package

# Veya TypeScript types'ı ekle
pnpm install -D @types/package-name
```

#### 2. Yanlış Export İsmi
```typescript
import { WrongName } from "lucide-react";
// ❌ Error: 'WrongName' is not exported from 'lucide-react'
```

**Çözüm:**
```typescript
// Paket dökümanını kontrol et
// lucide-react için: https://lucide.dev/icons/
import { Heart } from "lucide-react";  // ✅ Doğru isim
```

#### 3. Yol Hatası
```typescript
import { Component } from "../../wrong/path";
// ❌ Error: Cannot find module '../../wrong/path'
```

**Çözüm:**
```typescript
// Dosya yolunu kontrol et
import { Component } from "../../correct/path";  // ✅
```

### TypeScript Hatası Türleri

#### 1. Type Uyuşmazlığı
```typescript
const age: number = "25";  // ❌ Type 'string' is not assignable to type 'number'
```

**Çözüm:**
```typescript
const age: number = 25;  // ✅
// veya
const age: number = parseInt("25");  // ✅
```

#### 2. Undefined Property
```typescript
user.name.toUpperCase();
// ❌ Object is possibly 'undefined'
```

**Çözüm:**
```typescript
// Optional chaining kullan
user?.name?.toUpperCase();  // ✅

// Veya guard clause
if (user && user.name) {
  user.name.toUpperCase();  // ✅
}
```

#### 3. Missing Type Definition
```typescript
const user = getUser();  // any type
user.email;  // ❌ Property 'email' does not exist on type 'any'
```

**Çözüm:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = getUser();  // ✅
user.email;  // ✅ Type-safe
```

---

## 🛡️ PRODUCTION'DA HATA ÖNLEME

### 1. Error Boundary Component

```tsx
// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Production'da hata logla (Sentry, LogRocket, vb.)
    console.error("Error caught by boundary:", error, errorInfo);

    // Analytics'e gönder
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">😞</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bir Hata Oluştu
              </h1>
              <p className="text-gray-600 mb-6">
                Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenileyin.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Sayfayı Yenile
              </button>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Hata Detayları
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**Kullanım:**
```tsx
// src/main.tsx

import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
```

### 2. API Error Handling

```typescript
// src/lib/api.ts

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        },
      });

      // HTTP hatası varsa
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP Error ${response.status}`,
        }));

        // Production'da kullanıcı dostu mesaj
        throw new ApiError(
          error.error || 'Bir hata oluştu',
          response.status,
          error
        );
      }

      return response.json();
    } catch (error) {
      // Network hatası
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError(
          'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
          0,
          error
        );
      }

      // Diğer hatalar
      throw error;
    }
  }
}

// Custom Error Class
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 3. Validation ile Hata Önleme

```typescript
// src/utils/validation.ts

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalı');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('En az bir büyük harf içermeli');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('En az bir küçük harf içermeli');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('En az bir rakam içermeli');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Form component'te kullan
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Validation
  if (!validateEmail(formData.email)) {
    setError('Geçerli bir email adresi girin');
    return;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    setError(passwordValidation.errors.join(', '));
    return;
  }

  // API call
  login(formData.email, formData.password);
};
```

---

## 🔬 DEBUGGING TEKNİKLERİ

### 1. Console Logging (Akıllıca)

```typescript
// ❌ KÖTÜ
console.log(user);

// ✅ İYİ
console.log('🟢 User loaded:', {
  id: user.id,
  name: user.name,
  timestamp: new Date().toISOString(),
});

// ✅ ÇOK İYİ - Production'da otomatik kapalı
const debug = (label: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${label}:`, data);
  }
};

debug('API Response', response);
```

### 2. React DevTools

**Nasıl Kullanılır:**
1. Chrome Extension: React Developer Tools
2. Browser'da F12 → "Components" tab
3. Component tree'yi incele
4. Props ve State'i gör
5. Profiler ile performance ölç

### 3. Network Tab

**API Hatalarını İncele:**
1. F12 → Network tab
2. "Fetch/XHR" filtresi
3. Başarısız isteklere bak (kırmızı)
4. Headers, Request, Response incele

### 4. Breakpoint Debugging

```typescript
// WebStorm / VSCode'da
function calculateTotal(items: Item[]) {
  debugger;  // ← Buraya gelince durdur

  const total = items.reduce((sum, item) => {
    debugger;  // ← Her item'da durdur
    return sum + item.price;
  }, 0);

  return total;
}
```

### 5. Try-Catch Wrapper

```typescript
// Utility function
const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Bir hata oluştu'
): Promise<[T | null, Error | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    console.error(errorMessage, error);
    return [null, error as Error];
  }
};

// Kullanım
const [data, error] = await tryCatch(
  () => api.getUsers(),
  'Kullanıcılar yüklenirken hata'
);

if (error) {
  setError('Kullanıcılar yüklenemedi');
  return;
}

setUsers(data!);
```

---

## 🧹 LINTING VE TYPE CHECKING

### 1. ESLint Kuralları

```json
// .eslintrc.json

{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    // Import hatalarını yakala
    "import/no-unresolved": "error",

    // Kullanılmayan değişkenleri uyar
    "@typescript-eslint/no-unused-vars": "warn",

    // any type'ı engelle
    "@typescript-eslint/no-explicit-any": "error",

    // Console.log'ları production'da engelle
    "no-console": ["warn", { "allow": ["warn", "error"] }],

    // useEffect dependency uyarıları
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 2. TypeScript Strict Mode

```json
// tsconfig.json

{
  "compilerOptions": {
    "strict": true,  // Tüm strict kontrolleri aç
    "noImplicitAny": true,  // any olmadan tür belirtme zorunlu
    "strictNullChecks": true,  // null/undefined kontrolü
    "strictFunctionTypes": true,  // Fonksiyon tür kontrolü
    "noUnusedLocals": true,  // Kullanılmayan değişkenler hata
    "noUnusedParameters": true,  // Kullanılmayan parametreler hata
    "noImplicitReturns": true,  // Her path return etmeli
    "noFallthroughCasesInSwitch": true  // switch case break kontrolü
  }
}
```

### 3. Pre-commit Hook (Husky)

```bash
# Husky ve lint-staged kur
pnpm install -D husky lint-staged

# Husky init
npx husky init

# .husky/pre-commit dosyası oluştur
echo "pnpm lint-staged" > .husky/pre-commit
```

```json
// package.json

{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",  // Lint hatalarını düzelt
      "prettier --write"  // Formatla
    ]
  },
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 📊 MONITORING VE ANALYTICS

### 1. Sentry (Error Tracking)

```bash
pnpm install @sentry/react
```

```typescript
// src/main.tsx

import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "your-sentry-dsn",
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,  // Performance monitoring
    replaysSessionSampleRate: 0.1,  // Session replay
    replaysOnErrorSampleRate: 1.0,  // Hata olduğunda replay
  });
}
```

### 2. Google Analytics

```typescript
// src/utils/analytics.ts

export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  trackEvent("exception", {
    description: error.message,
    fatal: false,
    ...context,
  });
};

// Kullanım
try {
  await api.createEvent(data);
  trackEvent("event_created", { category: data.category });
} catch (error) {
  trackError(error as Error, { action: "create_event" });
}
```

---

## ✅ PRODUCTION CHECKLIST

Deployment öncesi kontrol listesi:

```bash
# 1. Lint kontrolü
pnpm lint

# 2. Type check
pnpm type-check

# 3. Test (eğer varsa)
pnpm test

# 4. Build test
pnpm build

# 5. Bundle size kontrolü
pnpm build && ls -lh dist

# 6. Environment variables kontrolü
cat .env.production  # Tüm gerekli değerler var mı?

# 7. Console.log temizliği
grep -r "console.log" src/  # Gereksiz log'lar var mı?

# 8. TODO/FIXME kontrolü
grep -r "TODO\|FIXME" src/  # Unfinished work var mı?
```

---

## 🚨 ACİL DURUM PROSEDÜRÜ

Production'da hata olursa:

### 1. Hızlı Rollback
```bash
# Vercel'de
vercel rollback  # Son çalışan versiyona dön

# Git'te
git revert HEAD  # Son commit'i geri al
git push origin main
```

### 2. Hata Analizi
```bash
# Sentry dashboard'a git
# Son hataları incele
# Stack trace'e bak
# Kaç kullanıcı etkilendi?
```

### 3. Hot Fix
```bash
# Acil düzeltme branch'i
git checkout -b hotfix/critical-bug
# Düzelt
git commit -m "hotfix: critical bug fix"
git push origin hotfix/critical-bug
# Direkt production'a deploy et
```

---

## 📝 ÖZET

**En Önemli Kurallar:**
1. ✅ TypeScript strict mode kullan
2. ✅ Her component Error Boundary içinde
3. ✅ Try-catch ile hataları yakala
4. ✅ Validation her yerde
5. ✅ Production'da error tracking (Sentry)
6. ✅ Pre-commit hook ile lint
7. ✅ Deployment öncesi checklist
8. ✅ Rollback planı hazır

**Hatırla:**
> "İyi kod hata vermez değil, hataları iyi yönetir!"

---

**Sonraki Adım:**
`ERROR_BOUNDARY_İMPLEMENTASYONU.md` - Error Boundary'i projeye ekleyelim

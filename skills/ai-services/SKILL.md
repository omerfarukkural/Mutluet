# ai-services

OpenAI, Gemini, Perplexity, Ollama ve Anthropic Claude AI servislerini projeye entegre eder.

TRIGGER: "openai kullan", "gpt-4 ile", "gemini ile yap", "perplexity ara", "ollama çalıştır", "yapay zeka entegrasyon", "llm ile içerik üret", "ai ile analiz et", "claude sdk kullan"

## Görev
AI servislerini API üzerinden kullanır; fallback mekanizması ile kesintisiz hizmet sağlar.

## Gerekli Ortam Değişkenleri
```
OPENAI_API_KEY        # sk-...
ANTHROPIC_API_KEY     # sk-ant-...
GEMINI_API_KEY        # AIza...
PERPLEXITY_API_KEY    # pplx-...
OLLAMA_BASE_URL       # http://localhost:11434 (yerel)
```

## Anthropic Claude (Ana AI)

### claude-api skill'i (Önerilen)
Claude API için `/claude-api` skill'ini kullan. Bu skill tüm Claude SDK özelliklerini kapsar.

### Doğrudan SDK Kullanımı
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Metin üret
const message = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 2048,
  system: 'Sen Mutluet NGO platformunun yardımcısısın. Türkçe yanıt ver.',
  messages: [{ role: 'user', content: '[kullanıcı sorusu]' }]
});
console.log(message.content[0].text);

// Streaming
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: '[soru]' }]
}).on('text', (text) => process.stdout.write(text));
await stream.finalMessage();
```

## OpenAI GPT-4o

### Kurulum
```bash
cd backend && pnpm add openai
```

### Kullanım
```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Sohbet tamamlama
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Mutluet NGO platformu asistanısın.' },
    { role: 'user', content: '[soru]' }
  ],
  temperature: 0.7
});
console.log(completion.choices[0].message.content);

// Görsel analiz
const visionResponse = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Bu görsel ne gösteriyor?' },
      { type: 'image_url', image_url: { url: 'https://...jpg' } }
    ]
  }]
});

// Embedding (semantik arama için)
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-large',
  input: 'gönüllülük etkinliği'
});
```

## Google Gemini

### Kurulum
```bash
cd backend && pnpm add @google/generative-ai
```

### Kullanım
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Metin üret
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
const result = await model.generateContent('[prompt]');
console.log(result.response.text());

// Sohbet
const chat = model.startChat({ history: [] });
const response = await chat.sendMessage('[mesaj]');
console.log(response.response.text());

// Görsel analiz
const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const imageResult = await visionModel.generateContent([
  { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
  'Bu etkinlik görselini Türkçe açıkla.'
]);
```

## Perplexity API (Web Aramalı AI)

### Kullanım
```bash
curl -X POST https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-sonar-large-128k-online",
    "messages": [
      {"role": "system", "content": "Türkçe yanıt ver."},
      {"role": "user", "content": "Türkiye NGO sektöründe en iyi uygulamalar neler?"}
    ],
    "return_citations": true
  }'
```

## Ollama (Yerel LLM — Gizli Veri için)

### Kurulum
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2          # 3B model
ollama pull llama3.1:8b       # 8B model
ollama pull deepseek-r1:7b    # Reasoning model
```

### API
```bash
# Soru sor
curl http://localhost:11434/api/generate \
  -d '{"model": "llama3.2", "prompt": "[soru]", "stream": false}'

# Sohbet
curl http://localhost:11434/api/chat \
  -d '{"model": "llama3.2", "messages": [{"role": "user", "content": "[soru]"}]}'

# Modelleri listele
curl http://localhost:11434/api/tags
```

## AI Fallback Mekanizması
```typescript
type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'ollama';

async function aiYanit(prompt: string, tercihSirasi: AIProvider[] = ['anthropic', 'openai', 'gemini']): Promise<string> {
  for (const provider of tercihSirasi) {
    try {
      switch (provider) {
        case 'anthropic': return await claudeYanit(prompt);
        case 'openai': return await openaiYanit(prompt);
        case 'gemini': return await geminiYanit(prompt);
        case 'ollama': return await ollamaYanit(prompt);
      }
    } catch (err) {
      console.warn(`${provider} hatası, sonraki provider deneniyor...`);
    }
  }
  throw new Error('Tüm AI sağlayıcıları başarısız!');
}
```

## Özellik Bazlı AI Önerileri
| Özellik | Önerilen AI |
|---------|------------|
| Sohbet botu | Claude claude-sonnet-4-6 |
| Hızlı metin üretimi | GPT-4o-mini |
| Web aramalı yanıt | Perplexity |
| Görsel analiz | Gemini 1.5 Flash |
| Gizli veri işleme | Ollama (yerel) |
| Embeddings | text-embedding-3-large |
| Uzun belge analizi | Claude claude-opus-4-6 |

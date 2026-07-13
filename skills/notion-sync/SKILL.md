# notion-sync

Notion API ve MCP üzerinden sayfa ve veritabanı işlemleri yapar.

TRIGGER: "notion'a yaz", "notion sayfası güncelle", "notion veritabanı ekle", "dokümantasyon notion'a sync et", "notion haftalık özet", "notion proje notu"

## Görev
Notion API ve MCP üzerinden sayfa oluşturur, güncellemeler yapar ve veritabanı sorgular.

## Gerekli Ortam Değişkenleri
```
NOTION_API_KEY     # secret_... (Integration Token)
NOTION_DB_ID       # Veritabanı ID (URL'den)
NOTION_PAGE_ID     # Sayfa ID (URL'den)
```

## Integration Token Alma
1. https://www.notion.so/my-integrations → "New integration"
2. Ad: "Mutluet Dev Bot" → Submit
3. "Internal Integration Token" → Kopyala → `NOTION_API_KEY`
4. Hedef sayfaya git → "..." → "Add connections" → "Mutluet Dev Bot"

## MCP ile Notion (Önerilen)
```
mcp__notion__search               # Sayfa ara
mcp__notion__retrieve_page        # Sayfa getir
mcp__notion__create_page          # Sayfa oluştur
mcp__notion__update_page          # Sayfa güncelle
mcp__notion__query_database       # Veritabanı sorgula
mcp__notion__create_database_item # Veritabanı kaydı ekle
mcp__notion__append_block_children # Bloklara içerik ekle
mcp__notion__retrieve_block       # Blok getir
```

## Node.js ile Notion API
```typescript
import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Veritabanı sorgula
const { results } = await notion.databases.query({
  database_id: process.env.NOTION_DB_ID!,
  filter: {
    property: 'Durum',
    select: { equals: 'Tamamlandı' }
  },
  sorts: [{ property: 'Tarih', direction: 'descending' }]
});

// Yeni kayıt oluştur
await notion.pages.create({
  parent: { database_id: process.env.NOTION_DB_ID! },
  properties: {
    'Başlık': { title: [{ text: { content: 'Yeni Geliştirme Notu' } }] },
    'Tarih': { date: { start: new Date().toISOString().split('T')[0] } },
    'Durum': { select: { name: 'Devam Ediyor' } },
    'Kategori': { multi_select: [{ name: 'Backend' }, { name: 'API' }] }
  }
});

// Sayfaya içerik ekle
await notion.blocks.children.append({
  block_id: process.env.NOTION_PAGE_ID!,
  children: [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: 'Geliştirme Günlüğü' } }]
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ text: { content: `Tarih: ${new Date().toLocaleDateString('tr-TR')}` } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ text: { content: 'Değişiklik açıklaması' } }]
      }
    }
  ]
});
```

## Geliştirme Günlüğü Otomasyonu
```typescript
// Her commit sonrası Notion'a kayıt ekle
async function logCommitToNotion(commitMessage: string, branch: string) {
  await notion.pages.create({
    parent: { database_id: process.env.NOTION_DB_ID! },
    properties: {
      'Başlık': { title: [{ text: { content: commitMessage } }] },
      'Tarih': { date: { start: new Date().toISOString() } },
      'Branch': { rich_text: [{ text: { content: branch } }] },
      'Durum': { select: { name: 'Tamamlandı' } }
    }
  });
}
```

## Notion Veritabanı Yapısı (Önerilen)

### Geliştirme Günlüğü DB
| Sütun | Tip |
|-------|-----|
| Başlık | Title |
| Tarih | Date |
| Branch | Text |
| Durum | Select |
| Kategori | Multi-select |
| Bağlantılar | URL |

### Platform API Listesi DB
| Sütun | Tip |
|-------|-----|
| Platform | Title |
| API Key | Text (gizli) |
| Status | Select |
| Son Test | Date |
| Notlar | Text |

## Sayfa Arama
```typescript
const { results } = await notion.search({
  query: 'Azure Entegrasyon',
  filter: { value: 'page', property: 'object' }
});
results.forEach(page => console.log((page as any).url));
```

# monday-tasks

Monday.com API üzerinden görev ve proje yönetimi yapar.

TRIGGER: "monday.com görev", "monday'e ekle", "sprint görevi oluştur", "monday board güncelle", "monday proje durumu", "monday haftalık görevler"

## Görev
Monday.com GraphQL API üzerinden görev oluşturur, günceller ve sorgular.

## Gerekli Ortam Değişkenleri
```
MONDAY_API_KEY    # Settings > Developer > My Access Tokens
MONDAY_BOARD_ID   # Board URL'deki ID
MONDAY_GROUP_ID   # Sprint grubu ID
```

## API Token Alma
1. https://mutluet.monday.com → Profil simgesi → "Developers"
2. "My Access Tokens" → "Show" → Kopyala

## Temel GraphQL Sorguları

### Board ve Grup Listesi
```bash
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: $MONDAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ boards(limit: 10) { id name groups { id title } } }"}'
```

### Görev Oluştur
```bash
TASK_NAME="Kullanıcı profil sayfası düzelt"
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: $MONDAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { create_item(board_id: $MONDAY_BOARD_ID, group_id: \\\"$MONDAY_GROUP_ID\\\", item_name: \\\"$TASK_NAME\\\") { id name } }\"}"
```

### Görev Durumu Güncelle
```bash
ITEM_ID="1234567890"
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: $MONDAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { change_simple_column_value(item_id: $ITEM_ID, board_id: $MONDAY_BOARD_ID, column_id: \\\"status\\\", value: \\\"Done\\\") { id } }\"}"
```

## Node.js ile Monday.com
```typescript
import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();
monday.setToken(process.env.MONDAY_API_KEY!);

// Board'ları listele
const { data } = await monday.api(`
  query {
    boards(limit: 10) {
      id
      name
      items_count
    }
  }
`);

// Yeni görev oluştur
const createItem = await monday.api(`
  mutation {
    create_item(
      board_id: ${process.env.MONDAY_BOARD_ID}
      group_id: "${process.env.MONDAY_GROUP_ID}"
      item_name: "Yeni Görev"
      column_values: "{
        \\"status\\": {\\"label\\": \\"Working on it\\"},
        \\"person\\": {\\"personsAndTeams\\": [{\\"id\\": 12345678, \\"kind\\": \\"person\\"}]},
        \\"date4\\": {\\"date\\": \\"2026-04-01\\"}
      }"
    ) {
      id
      name
      url
    }
  }
`);

// Görevleri listele (sprint)
const sprintItems = await monday.api(`
  query {
    boards(ids: [${process.env.MONDAY_BOARD_ID}]) {
      groups(ids: ["${process.env.MONDAY_GROUP_ID}"]) {
        items_page {
          items {
            id
            name
            column_values(ids: ["status", "person"]) {
              id
              text
            }
          }
        }
      }
    }
  }
`);
```

## Webhook Entegrasyonu
```bash
# Webhook oluştur (görev tamamlandığında)
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: $MONDAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { create_webhook(board_id: BOARD_ID, url: \"https://mutluet-backend.azurewebsites.net/api/monday/webhook\", event: change_status_column_value) { id } }"
  }'
```

## Sütun ID'leri (Özel Board)
| Sütun | ID |
|-------|-----|
| Durum | `status` |
| Kişi | `person` |
| Tarih | `date4` |
| Öncelik | `priority` |
| Notlar | `text` |

## Standart Görev Durumları
- `Working on it` — Devam ediyor
- `Done` — Tamamlandı
- `Stuck` — Takıldı
- `Waiting for review` — İnceleme bekliyor

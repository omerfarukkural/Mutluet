# figma-ops

Figma API üzerinden tasarım assetlerini çeker ve projeye entegre eder.

TRIGGER: "figma'dan al", "figma asset", "figma bileşen export", "figma tasarım", "figma token", "figma'yı güncelle", "tasarım dosyası"

## Görev
Figma dosyalarından bileşen, ikon ve tasarım token'larını çeker; projeye entegre eder.

## Gerekli Ortam Değişkenleri
```
FIGMA_TOKEN        # Figma Personal Access Token
FIGMA_FILE_KEY     # URL'deki /file/XXXXX/ kısmı
FIGMA_TEAM_ID      # Figma Team ID
```

## Token Alma
1. Figma → Account Settings → Personal Access Tokens → "Generate new token"
2. Token adı: "mutluet-dev"
3. Değeri `FIGMA_TOKEN` olarak .env'e kaydet

## Figma REST API

### Dosya Bilgisi
```bash
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FIGMA_FILE_KEY" \
  | python3 -m json.tool | head -50
```

### Bileşen Listesi
```bash
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FIGMA_FILE_KEY/components" \
  | python3 -c "import json,sys; [print(c['name']) for c in json.load(sys.stdin)['meta']['components']]"
```

### SVG Export
```bash
# Node ID'leri al
NODE_IDS="1:2,1:3,1:4"

curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FIGMA_FILE_KEY?ids=$NODE_IDS&format=svg&scale=1" \
  -o figma-exports.json

# URL'leri indirip kaydet
python3 << 'EOF'
import json, urllib.request, os

with open('figma-exports.json') as f:
    data = json.load(f)

os.makedirs('src/assets/icons', exist_ok=True)
for node_id, url in data['images'].items():
    filename = f"src/assets/icons/{node_id.replace(':', '-')}.svg"
    urllib.request.urlretrieve(url, filename)
    print(f"İndirildi: {filename}")
EOF
```

### PNG Export (2x)
```bash
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FIGMA_FILE_KEY?ids=$NODE_IDS&format=png&scale=2" \
  -o figma-png-exports.json
```

## Node.js ile Figma API
```typescript
class FigmaClient {
  private token: string;
  private fileKey: string;

  constructor() {
    this.token = process.env.FIGMA_TOKEN!;
    this.fileKey = process.env.FIGMA_FILE_KEY!;
  }

  async getFile() {
    const res = await fetch(`https://api.figma.com/v1/files/${this.fileKey}`, {
      headers: { 'X-Figma-Token': this.token }
    });
    return res.json();
  }

  async exportImages(nodeIds: string[], format: 'svg' | 'png' = 'svg') {
    const ids = nodeIds.join(',');
    const res = await fetch(
      `https://api.figma.com/v1/images/${this.fileKey}?ids=${ids}&format=${format}`,
      { headers: { 'X-Figma-Token': this.token } }
    );
    return res.json();
  }

  async getDesignTokens() {
    const file = await this.getFile();
    // Renk stillerini çıkar
    const colors: Record<string, string> = {};
    for (const [id, style] of Object.entries(file.styles)) {
      if ((style as any).styleType === 'FILL') {
        colors[(style as any).name] = id;
      }
    }
    return colors;
  }
}
```

## Tasarım Token'larını CSS'e Dönüştür
```bash
# figma-export paketi ile
npm install -g figma-export

# figma.config.js
cat > figma.config.js << 'EOF'
module.exports = {
  token: process.env.FIGMA_TOKEN,
  fileId: process.env.FIGMA_FILE_KEY,
  commands: [['components/as-svg', { output: 'src/assets/figma' }]]
};
EOF

npx figma-export use-config figma.config.js
```

## Figma Plugin Geliştirme (İleride)
```typescript
// Figma Plugin API
figma.ui.postMessage({ type: 'export-selected', nodes: figma.currentPage.selection });
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-done') {
    figma.closePlugin('Export tamamlandı!');
  }
};
```

## Önerilen Figma Kütüphaneleri
- `figma-js` — Figma API için TypeScript client
- `figma-export` — Otomatik asset export
- `style-dictionary` — Tasarım token'larını CSS/JSON'a dönüştür
- `theo` — Salesforce'un token dönüşüm aracı

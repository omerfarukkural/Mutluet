# google-workspace

Google Workspace (Sheets, Drive, Gmail, Calendar, Forms, Maps, AppSheet, Apps Script) işlemlerini yönetir.

TRIGGER: "google sheets", "google drive", "gmail gönder", "google calendar etkinlik", "google forms", "google apps script çalıştır", "google maps konum", "google appsheet", "spreadsheet güncelle"

## Görev
Google Workspace ürünlerini API üzerinden kullanır ve projeye entegre eder.

## Gerekli Ortam Değişkenleri
```
GOOGLE_CLIENT_ID          # OAuth2 Client ID
GOOGLE_CLIENT_SECRET      # OAuth2 Client Secret
GOOGLE_REFRESH_TOKEN      # OAuth2 Refresh Token
GOOGLE_MAPS_API_KEY       # Maps API Key
GOOGLE_SHEETS_ID          # Hedef Spreadsheet ID
GOOGLE_CALENDAR_ID        # Hedef Takvim ID
```

## Google Sheets API

### Node.js ile Veri Okuma/Yazma
```javascript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

// Veri oku
const { data } = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  range: 'Kullanıcılar!A1:F100'
});
console.log('Satırlar:', data.values);

// Veri yaz
await sheets.spreadsheets.values.append({
  spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  range: 'Bağışlar!A:E',
  valueInputOption: 'RAW',
  requestBody: {
    values: [['2026-03-08', 'Kullanıcı Adı', '150', 'TRY', 'Çocuk Vakfı']]
  }
});

// Satır güncelle
await sheets.spreadsheets.values.update({
  spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  range: 'Sheet1!A2',
  valueInputOption: 'RAW',
  requestBody: { values: [['Güncellenmiş Değer']] }
});
```

## Google Drive API

### Dosya Yükleme ve Listeleme
```javascript
const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

// Dosya listele
const { data } = await drive.files.list({
  q: "'folder_id' in parents",
  fields: 'files(id, name, mimeType, createdTime)'
});

// Dosya yükle
const { data: file } = await drive.files.create({
  requestBody: {
    name: 'rapor.pdf',
    parents: ['folder_id']
  },
  media: {
    mimeType: 'application/pdf',
    body: fs.createReadStream('/path/to/rapor.pdf')
  }
});
```

## Gmail API

### E-posta Gönderme
```javascript
const gmail = google.gmail({ version: 'v1', auth: await auth.getClient() });

const emailContent = [
  'To: kullanici@ornek.com',
  'Subject: =?UTF-8?B?' + Buffer.from('Mutluet Bildirimi').toString('base64') + '?=',
  'MIME-Version: 1.0',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<h1>Merhaba!</h1><p>Mutluet platformundan bildirim.</p>'
].join('\r\n');

await gmail.users.messages.send({
  userId: 'me',
  requestBody: {
    raw: Buffer.from(emailContent).toString('base64url')
  }
});
```

## Google Calendar API

### Etkinlik Oluşturma
```javascript
const calendar = google.calendar({ version: 'v3', auth: await auth.getClient() });

await calendar.events.insert({
  calendarId: process.env.GOOGLE_CALENDAR_ID,
  requestBody: {
    summary: 'Gönüllü Etkinliği: Kitap Toplama',
    description: 'Mutluet platformu üzerinden organize edilen etkinlik',
    start: { dateTime: '2026-04-01T10:00:00+03:00', timeZone: 'Europe/Istanbul' },
    end: { dateTime: '2026-04-01T14:00:00+03:00', timeZone: 'Europe/Istanbul' },
    location: 'İstanbul, Türkiye',
    attendees: [{ email: 'gonullu@ornek.com' }]
  }
});
```

## Google Apps Script (Otomatik Görevler)

### apps-script/haftalik-rapor.gs
```javascript
function haftalikRaporGonder() {
  const sheet = SpreadsheetApp.openById('SPREADSHEET_ID');
  const veri = sheet.getSheetByName('Bağışlar').getDataRange().getValues();

  let toplamBagis = 0;
  veri.slice(1).forEach(row => { toplamBagis += Number(row[2]); });

  MailApp.sendEmail({
    to: 'admin@mutluet.org',
    subject: `Haftalık Rapor — ${new Date().toLocaleDateString('tr-TR')}`,
    htmlBody: `<h2>Haftalık Özet</h2><p>Toplam Bağış: ${toplamBagis} TRY</p>`
  });
}

// Her Pazartesi sabah 8'de çalıştır
function zamanlayiciKur() {
  ScriptApp.newTrigger('haftalikRaporGonder')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
}
```

## Google Maps API (MCP ile)
```
mcp__google-maps__search_places    # Yer ara
mcp__google-maps__directions       # Yol tarifi
mcp__google-maps__geocode          # Adres → Koordinat
mcp__google-maps__reverse_geocode  # Koordinat → Adres
mcp__google-maps__distance_matrix  # Mesafe hesapla
```

## Google AppSheet
- Dashboard: https://appsheet.com
- Supabase veya Google Sheets'e bağlı no-code uygulama
- Gönüllü kayıt formları için kullanılabilir

## OAuth2 Kurulum Adımları
1. https://console.cloud.google.com → Proje oluştur: "mutluet"
2. APIs & Services → Library → İstenen API'leri etkinleştir
3. APIs & Services → Credentials → OAuth2 Client ID oluştur
4. Refresh Token almak için OAuth Playground kullan
5. Tüm değerleri .env'e ekle

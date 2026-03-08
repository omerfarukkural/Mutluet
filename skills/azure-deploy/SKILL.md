# azure-deploy

Azure platformuna otomatik deployment yapar.

TRIGGER: "azure'a deploy et", "azure deployment", "azure'a gönder", "azure app service'e yükle", "azure static web apps deploy", "azure'da yayınla"

## Görev
Bu skill tetiklendiğinde aşağıdakileri adım adım gerçekleştir:
1. Ortam değişkenlerini doğrula (AZURE_CREDENTIALS, AZURE_RESOURCE_GROUP)
2. Frontend TypeScript kontrolü: `npx tsc --noEmit`
3. Frontend build: `pnpm build`
4. Azure CLI ile frontend deploy
5. Backend Docker image build
6. Azure Container Registry'ye push
7. Azure App Service'i yeniden başlat
8. Deployment URL'lerini kontrol et ve başarı/hata durumunu raporla
9. Slack ve Telegram'a sonucu bildir

## Gerekli Ortam Değişkenleri
```
AZURE_CREDENTIALS         # az login bilgileri veya Service Principal JSON
AZURE_RESOURCE_GROUP      # Örnek: mutluet-rg
AZURE_STATIC_WEB_APP_NAME # Örnek: mutluet-frontend
AZURE_WEBAPP_NAME         # Örnek: mutluet-backend
AZURE_ACR_NAME            # Container Registry adı
```

## Komutlar
```bash
# Kimlik doğrulama
az login
# veya Service Principal ile:
az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID

# Frontend Build ve Deploy
pnpm build
az staticwebapp deploy \
  --name $AZURE_STATIC_WEB_APP_NAME \
  --resource-group $AZURE_RESOURCE_GROUP \
  --source ./dist \
  --token $AZURE_STATIC_WEB_APPS_API_TOKEN

# Backend Docker Build ve Push
docker build -t mutluet-backend ./backend
az acr login --name $AZURE_ACR_NAME
docker tag mutluet-backend $AZURE_ACR_NAME.azurecr.io/backend:latest
docker push $AZURE_ACR_NAME.azurecr.io/backend:latest

# App Service Güncelle
az webapp config container set \
  --name $AZURE_WEBAPP_NAME \
  --resource-group $AZURE_RESOURCE_GROUP \
  --docker-custom-image-name $AZURE_ACR_NAME.azurecr.io/backend:latest
az webapp restart --name $AZURE_WEBAPP_NAME --resource-group $AZURE_RESOURCE_GROUP

# Deployment Durumu Kontrol
az webapp show --name $AZURE_WEBAPP_NAME --resource-group $AZURE_RESOURCE_GROUP --query "state"
```

## Doğrulama URL'leri
- **Frontend**: `az staticwebapp show --name $AZURE_STATIC_WEB_APP_NAME --query "defaultHostname"`
- **Backend**: `https://$AZURE_WEBAPP_NAME.azurewebsites.net/health`
- **Backend API**: `https://$AZURE_WEBAPP_NAME.azurewebsites.net/api/health`

## Azure Key Vault Entegrasyonu
```bash
# Secret ekle
az keyvault secret set --vault-name mutluet-vault --name "JWT-SECRET" --value "[deger]"

# Secret oku
az keyvault secret show --vault-name mutluet-vault --name "JWT-SECRET" --query "value"
```

## Hata Yönetimi
- Build hatası → TypeScript hatalarını düzelt, tekrar dene
- ACR login hatası → `az acr login --name $AZURE_ACR_NAME` tekrar çalıştır
- App Service başlatma hatası → Logları kontrol et: `az webapp log tail --name $AZURE_WEBAPP_NAME --resource-group $AZURE_RESOURCE_GROUP`
- Quota hatası → Azure portalından quota artışı talep et

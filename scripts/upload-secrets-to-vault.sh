#!/usr/bin/env bash
#############################################
# Azure Key Vault Secret Yükleme Scripti
#
# Bu script .env dosyasındaki TÜM sırları
# Azure Key Vault'a yükler.
#
# Kullanım:
#   chmod +x scripts/upload-secrets-to-vault.sh
#   ./scripts/upload-secrets-to-vault.sh
#
# Ön koşullar:
#   1. Azure CLI yüklü olmalı: brew install azure-cli
#   2. Azure'a giriş yapılmış olmalı: az login
#   3. Key Vault erişim izni olmalı
#############################################

set -euo pipefail

# ═══════════════════════════════════════════
# YAPILANDIRMA
# ═══════════════════════════════════════════
VAULT_NAME="anahtar"
ENV_FILE="${1:-.env}"
SUBSCRIPTION_ID="0760f7f0-03c7-4be6-a6fd-0a7c95039b71"
TENANT_ID="35368578-7308-41ca-9d78-3779e3d395bf"

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔐 Azure Key Vault Secret Yükleme Aracı       ║${NC}"
echo -e "${BLUE}║  Vault: ${VAULT_NAME}.vault.azure.net           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════
# ÖN KOŞUL KONTROLLERİ
# ═══════════════════════════════════════════

# Azure CLI kontrolü
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI bulunamadı!${NC}"
    echo "   Yüklemek için: brew install azure-cli"
    exit 1
fi

# .env dosyası kontrolü
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env dosyası bulunamadı: ${ENV_FILE}${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 .env dosyası: ${ENV_FILE}${NC}"

# Azure oturum kontrolü
echo -e "${YELLOW}🔑 Azure oturum kontrolü yapılıyor...${NC}"
if ! az account show &> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Azure oturumu bulunamadı. Giriş yapılıyor...${NC}"
    az login --tenant "$TENANT_ID"
fi

# Subscription ayarla
az account set --subscription "$SUBSCRIPTION_ID"
echo -e "${GREEN}✅ Azure subscription ayarlandı${NC}"

# Key Vault erişim kontrolü
echo -e "${YELLOW}🏗️  Key Vault erişimi kontrol ediliyor...${NC}"
if ! az keyvault show --name "$VAULT_NAME" &> /dev/null 2>&1; then
    echo -e "${RED}❌ Key Vault '${VAULT_NAME}' bulunamadı veya erişim yok!${NC}"
    echo "   Key Vault oluşturmak için:"
    echo "   az keyvault create --name ${VAULT_NAME} --resource-group mutluet-rg --location westeurope"
    exit 1
fi
echo -e "${GREEN}✅ Key Vault erişimi doğrulandı${NC}"

# ═══════════════════════════════════════════
# SECRET YÜKLEME
# ═══════════════════════════════════════════

SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
FAILED_SECRETS=""

# Yüklenecek değerleri filtrele (boş, eksik ve placeholder değerleri atla)
SKIP_PATTERNS='^\[Eksik|^\[Doldurulacak|^\[Terminalde|^\[MONGODB_PASSWORD\]|xxxxx'

echo ""
echo -e "${BLUE}📤 Secret'lar yükleniyor...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

while IFS= read -r line; do
    # Boş satırları ve yorumları atla
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ ! "$line" =~ = ]] && continue

    # KEY=VALUE parse et
    key=$(echo "$line" | cut -d'=' -f1 | xargs)
    value=$(echo "$line" | cut -d'=' -f2- | sed 's/^"//' | sed 's/"[[:space:]]*#.*//' | sed 's/"$//')

    # Boş key'leri atla
    [[ -z "$key" ]] && continue

    # Placeholder değerleri atla
    if echo "$value" | grep -qE "$SKIP_PATTERNS"; then
        echo -e "  ${YELLOW}⏭️  ATLANDI: ${key} (placeholder/eksik değer)${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    # Boş değerleri atla
    if [[ -z "$value" || "$value" == '""' ]]; then
        echo -e "  ${YELLOW}⏭️  ATLANDI: ${key} (boş değer)${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    # Key Vault isimlendirmesi: _ → - (Key Vault sadece alfanumerik ve tire kabul eder)
    vault_key=$(echo "$key" | sed 's/_/-/g')

    # Secret'ı yükle
    if az keyvault secret set \
        --vault-name "$VAULT_NAME" \
        --name "$vault_key" \
        --value "$value" \
        --tags "source=env" "project=mutluet" "original-key=$key" \
        &> /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ ${key} → ${vault_key}${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "  ${RED}❌ HATA: ${key} → ${vault_key}${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        FAILED_SECRETS="${FAILED_SECRETS}\n    - ${key}"
    fi
done < "$ENV_FILE"

# ═══════════════════════════════════════════
# SONUÇ RAPORU
# ═══════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 SONUÇ RAPORU${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✅ Başarılı : ${SUCCESS_COUNT}${NC}"
echo -e "  ${YELLOW}⏭️  Atlanan  : ${SKIP_COUNT}${NC}"
echo -e "  ${RED}❌ Başarısız: ${FAIL_COUNT}${NC}"

if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Başarısız secret'lar:${FAILED_SECRETS}${NC}"
fi

echo ""
echo -e "${GREEN}🎉 İşlem tamamlandı!${NC}"
echo ""
echo -e "${BLUE}📝 Sonraki adımlar:${NC}"
echo "   1. .env dosyasından gerçek değerleri silin (güvenlik)"
echo "   2. .env dosyasına sadece şu değişkenleri bırakın:"
echo "      AZURE_KEY_VAULT_URL=https://anahtar.vault.azure.net/"
echo "      AZURE_TENANT_ID=${TENANT_ID}"
echo "      AZURE_CLIENT_ID=<service-principal-client-id>"
echo "      NODE_ENV=development"
echo "   3. Backend'i Key Vault modunda çalıştırın"
echo ""


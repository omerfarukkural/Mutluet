#!/bin/bash
# ============================================================
# n8n Tam Kurulum Scripti — GCP Ubuntu 22.04
# Domains: n8n.bitebimuv.org | n8n.mutluet.org → 34.141.16.229
# Tek VM, tek n8n instance, iki domain, SAN SSL sertifikası
# ============================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

# ─── Konfigürasyon ───────────────────────────────────────────
DOMAIN_PRIMARY="n8n.bitebimuv.org"
DOMAIN_SECONDARY="n8n.mutluet.org"
EMAIL="admin@bitebimuv.org"
N8N_DIR="/opt/n8n"
DB_USER="admin"
DB_PASS="571632"
DB_NAME="n8n"
N8N_PORT_HOST="5679"
N8N_PORT_CONT="5678"
TZ="Europe/Istanbul"
SERVER_IP="34.141.16.229"
# ─────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║    n8n Kurulum — Çift Domain, Tek VM                    ║"
echo "║    n8n.bitebimuv.org                                    ║"
echo "║    n8n.mutluet.org                                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Root kontrolü ────────────────────────────────────────
[[ $EUID -ne 0 ]] && err "Bu scripti root veya sudo ile çalıştır: sudo bash $0"

# ─── 2. DNS ön kontrolü ──────────────────────────────────────
info "DNS kayıtları kontrol ediliyor..."
IP1=$(dig +short "$DOMAIN_PRIMARY"   | tail -1)
IP2=$(dig +short "$DOMAIN_SECONDARY" | tail -1)

warn "DNS Durumu:"
warn "  $DOMAIN_PRIMARY  → ${IP1:-'KAYIT YOK'} (beklenen: $SERVER_IP)"
warn "  $DOMAIN_SECONDARY → ${IP2:-'KAYIT YOK'} (beklenen: $SERVER_IP)"
echo ""

if [[ "$IP1" != "$SERVER_IP" || "$IP2" != "$SERVER_IP" ]]; then
  warn "DNS kayıtları henüz doğru değil veya yayılmadı!"
  warn "mutluet.org için Squarescape panelinde:"
  warn "  A kaydı ekle: n8n → $SERVER_IP"
  echo ""
  warn "Devam etmek için Enter'a bas, iptal için Ctrl+C"
  read -r
fi

# ─── 3. Sistem güncellemesi ──────────────────────────────────
info "Sistem güncelleniyor..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git ufw fail2ban dnsutils \
  ca-certificates gnupg lsb-release \
  apt-transport-https software-properties-common \
  openssl net-tools
log "Sistem güncellendi"

# ─── 4. Docker kurulumu ──────────────────────────────────────
if ! command -v docker &>/dev/null; then
  info "Docker kuruluyor..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
  log "Docker kuruldu: $(docker --version)"
else
  log "Docker zaten kurulu: $(docker --version)"
fi

if ! docker compose version &>/dev/null; then
  ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose 2>/dev/null || true
fi

# ─── 5. UFW Firewall ─────────────────────────────────────────
info "Firewall yapılandırılıyor..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  comment "SSH"
ufw allow 80/tcp  comment "HTTP"
ufw allow 443/tcp comment "HTTPS"
ufw --force enable
log "Firewall aktif: SSH(22) HTTP(80) HTTPS(443)"

# ─── 6. fail2ban ─────────────────────────────────────────────
info "fail2ban yapılandırılıyor..."
cat > /etc/fail2ban/jail.local << 'F2B'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = 22
logpath = %(sshd_log)s
backend = %(syslog_backend)s
F2B
systemctl enable --now fail2ban
log "fail2ban aktif"

# ─── 7. Dizin yapısı ─────────────────────────────────────────
info "Dizinler oluşturuluyor: $N8N_DIR"
mkdir -p "$N8N_DIR"/{certbot/{conf,www},n8n_files,backups}
cd "$N8N_DIR"

# ─── 8. Encryption key üret (tek seferlik, sabit) ────────────
if [[ ! -f "$N8N_DIR/.env" ]]; then
  ENCRYPTION_KEY=$(openssl rand -hex 32)
  cat > "$N8N_DIR/.env" << ENV
N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_NAME=${DB_NAME}
N8N_PORT_HOST=${N8N_PORT_HOST}
N8N_PORT_CONT=${N8N_PORT_CONT}
DOMAIN_PRIMARY=${DOMAIN_PRIMARY}
DOMAIN_SECONDARY=${DOMAIN_SECONDARY}
TZ=${TZ}
ENV
  log ".env oluşturuldu (encryption key sabitlendi)"
else
  log ".env zaten mevcut — korundu"
fi

source "$N8N_DIR/.env"

# ─── 9. docker-compose.yml ───────────────────────────────────
info "docker-compose.yml yazılıyor..."
cat > "$N8N_DIR/docker-compose.yml" << COMPOSE
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: n8n_postgres
    restart: always
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASS}
      POSTGRES_DB: \${DB_NAME}
      POSTGRES_INITDB_ARGS: "-c max_connections=200"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - n8n_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "\${N8N_PORT_HOST}:\${N8N_PORT_CONT}"
    environment:
      N8N_HOST: \${DOMAIN_PRIMARY}
      N8N_PORT: \${N8N_PORT_CONT}
      N8N_PROTOCOL: https
      NODE_ENV: production
      WEBHOOK_URL: https://\${DOMAIN_PRIMARY}
      N8N_EDITOR_BASE_URL: https://\${DOMAIN_PRIMARY}
      GENERIC_TIMEZONE: \${TZ}
      TZ: \${TZ}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: \${DB_NAME}
      DB_POSTGRESDB_USER: \${DB_USER}
      DB_POSTGRESDB_PASSWORD: \${DB_PASS}
      N8N_ENCRYPTION_KEY: \${N8N_ENCRYPTION_KEY}
      EXECUTIONS_DATA_PRUNE: "true"
      EXECUTIONS_DATA_MAX_AGE: 336
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n_files:/files
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - n8n_net
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:\${N8N_PORT_CONT}/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  nginx:
    image: nginx:alpine
    container_name: n8n_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - n8n
    networks:
      - n8n_net

  certbot:
    image: certbot/certbot:latest
    container_name: n8n_certbot
    restart: unless-stopped
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: >
      /bin/sh -c "trap exit TERM;
      while :; do
        certbot renew --webroot -w /var/www/certbot --quiet;
        sleep 12h & wait \$\$\${!};
      done"
    networks:
      - n8n_net

volumes:
  n8n_data:
    driver: local
  postgres_data:
    driver: local

networks:
  n8n_net:
    driver: bridge
COMPOSE
log "docker-compose.yml oluşturuldu"

# ─── 10. nginx.conf — HTTP modu (SSL öncesi) ─────────────────
info "nginx.conf (HTTP modu) yazılıyor..."
cat > "$N8N_DIR/nginx.conf" << NGINX_HTTP
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    client_max_body_size 100M;

    server {
        listen 80;
        server_name ${DOMAIN_PRIMARY} ${DOMAIN_SECONDARY};

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 "n8n kurulum bekleniyor — SSL aliniyor...";
            add_header Content-Type text/plain;
        }
    }
}
NGINX_HTTP
log "nginx.conf (HTTP) oluşturuldu"

# ─── 11. Stack başlat (HTTP modu) ────────────────────────────
info "Docker servisleri başlatılıyor (HTTP modu)..."
docker compose -f "$N8N_DIR/docker-compose.yml" up -d nginx certbot postgres

info "PostgreSQL hazır olana kadar bekleniyor (30s)..."
sleep 30

# ─── 12. SAN SSL Sertifikası (her iki domain) ────────────────
info "Let's Encrypt SAN sertifikası alınıyor (iki domain)..."
echo ""
warn "Her iki DNS kaydı da $SERVER_IP adresine işaret etmeli!"
warn "Devam için Enter, iptal için Ctrl+C"
read -r

docker compose -f "$N8N_DIR/docker-compose.yml" run --rm certbot \
  certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN_PRIMARY" \
  -d "$DOMAIN_SECONDARY" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal || {
    warn "Prod cert alınamadı! Staging ile test ediliyor..."
    docker compose -f "$N8N_DIR/docker-compose.yml" run --rm certbot \
      certonly \
      --webroot -w /var/www/certbot \
      -d "$DOMAIN_PRIMARY" \
      -d "$DOMAIN_SECONDARY" \
      --email "$EMAIL" \
      --agree-tos \
      --no-eff-email \
      --staging || err "SSL alınamadı. Her iki DNS kaydını kontrol et."
}

log "SAN SSL sertifikası alındı: $DOMAIN_PRIMARY + $DOMAIN_SECONDARY"

# ─── 13. nginx.conf — HTTPS modu (her iki domain) ────────────
info "nginx.conf (HTTPS + çift domain) yazılıyor..."
cat > "$N8N_DIR/nginx.conf" << NGINX_SSL
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" "\$http_user_agent"';

    access_log /var/log/nginx/access.log main;
    sendfile on; tcp_nopush on; tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 100M;

    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml image/svg+xml;

    limit_req_zone \$binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=api:10m     rate=50r/s;

    upstream n8n_backend {
        server n8n:${N8N_PORT_CONT};
        keepalive 32;
    }

    # ── HTTP → HTTPS yönlendirme (her iki domain) ──
    server {
        listen 80;
        server_name ${DOMAIN_PRIMARY} ${DOMAIN_SECONDARY};

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    # ── HTTPS — n8n.bitebimuv.org ──
    server {
        listen 443 ssl http2;
        server_name ${DOMAIN_PRIMARY};

        ssl_certificate     /etc/letsencrypt/live/${DOMAIN_PRIMARY}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_PRIMARY}/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers   HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache   shared:SSL:10m;
        ssl_session_timeout 10m;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        access_log /var/log/nginx/bitebimuv_access.log main;
        error_log  /var/log/nginx/bitebimuv_error.log  warn;

        limit_req zone=general burst=20 nodelay;

        location / {
            proxy_pass         http://n8n_backend;
            proxy_http_version 1.1;
            proxy_set_header   Host              \$host;
            proxy_set_header   X-Real-IP         \$remote_addr;
            proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto \$scheme;
            proxy_set_header   Upgrade           \$http_upgrade;
            proxy_set_header   Connection        "upgrade";
            proxy_connect_timeout 600s;
            proxy_send_timeout    600s;
            proxy_read_timeout    600s;
            proxy_buffering off;
        }

        location /webhook {
            limit_req zone=api burst=100 nodelay;
            proxy_pass         http://n8n_backend;
            proxy_http_version 1.1;
            proxy_set_header   Host              \$host;
            proxy_set_header   X-Real-IP         \$remote_addr;
            proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto \$scheme;
        }

        location /healthz {
            access_log off;
            proxy_pass http://n8n_backend;
        }
    }

    # ── HTTPS — n8n.mutluet.org ──
    # Aynı SAN sertifikası, aynı n8n backend
    server {
        listen 443 ssl http2;
        server_name ${DOMAIN_SECONDARY};

        ssl_certificate     /etc/letsencrypt/live/${DOMAIN_PRIMARY}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_PRIMARY}/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers   HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache   shared:SSL:10m;
        ssl_session_timeout 10m;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        access_log /var/log/nginx/mutluet_access.log main;
        error_log  /var/log/nginx/mutluet_error.log  warn;

        limit_req zone=general burst=20 nodelay;

        location / {
            proxy_pass         http://n8n_backend;
            proxy_http_version 1.1;
            proxy_set_header   Host              \$host;
            proxy_set_header   X-Real-IP         \$remote_addr;
            proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto \$scheme;
            proxy_set_header   Upgrade           \$http_upgrade;
            proxy_set_header   Connection        "upgrade";
            proxy_connect_timeout 600s;
            proxy_send_timeout    600s;
            proxy_read_timeout    600s;
            proxy_buffering off;
        }

        location /webhook {
            limit_req zone=api burst=100 nodelay;
            proxy_pass         http://n8n_backend;
            proxy_http_version 1.1;
            proxy_set_header   Host              \$host;
            proxy_set_header   X-Real-IP         \$remote_addr;
            proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto \$scheme;
        }

        location /healthz {
            access_log off;
            proxy_pass http://n8n_backend;
        }
    }
}
NGINX_SSL
log "nginx.conf (HTTPS çift domain) oluşturuldu"

# ─── 14. Tüm stack başlat ────────────────────────────────────
info "Tüm servisler başlatılıyor..."
docker compose -f "$N8N_DIR/docker-compose.yml" up -d
sleep 10
docker compose -f "$N8N_DIR/docker-compose.yml" restart nginx
log "Tüm servisler çalışıyor"

# ─── 15. Otomatik yedekleme cron ─────────────────────────────
info "Otomatik yedekleme cron kurulumu..."
CRON_JOB="0 3 * * 0 docker exec n8n_postgres pg_dump -U ${DB_USER} ${DB_NAME} | gzip > ${N8N_DIR}/backups/n8n_\$(date +\%Y\%m\%d).sql.gz 2>/dev/null"
(crontab -l 2>/dev/null | grep -v "n8n.*pg_dump"; echo "$CRON_JOB") | crontab -
log "Haftalık yedek: Her Pazar 03:00"

# ─── 16. Systemd servis ──────────────────────────────────────
info "Systemd servis oluşturuluyor..."
cat > /etc/systemd/system/n8n-docker.service << SYSTEMD
[Unit]
Description=n8n Docker Compose Stack
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${N8N_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
SYSTEMD
systemctl daemon-reload
systemctl enable n8n-docker.service
log "Systemd servisi aktif (reboot-safe)"

# ─── 17. Durum kontrolü ──────────────────────────────────────
sleep 5
echo ""
docker compose -f "$N8N_DIR/docker-compose.yml" ps
echo ""

# ─── 18. Sonuç ───────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              ✅  KURULUM TAMAMLANDI                          ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  🌐  URL 1 : https://n8n.bitebimuv.org                      ║"
echo "║  🌐  URL 2 : https://n8n.mutluet.org                        ║"
echo "║  🔒  SSL   : SAN cert (her iki domain) — auto-renew ✓       ║"
echo "║  🐘  DB    : postgres (Docker internal)                      ║"
echo "║  📁  Dizin : /opt/n8n                                        ║"
echo "║  💾  Yedek : Her Pazar 03:00 → /opt/n8n/backups/            ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  DNS KONTROL:                                                 ║"
echo "║  dig n8n.bitebimuv.org +short   → 34.141.16.229             ║"
echo "║  dig n8n.mutluet.org   +short   → 34.141.16.229             ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  YÖNETIM:                                                     ║"
echo "║  docker compose -f /opt/n8n/docker-compose.yml ps            ║"
echo "║  docker compose -f /opt/n8n/docker-compose.yml logs -f       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── Stage 1: Builder ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Prisma client üret + TypeScript derle
RUN pnpm exec prisma generate && pnpm build

# ── Stage 2: Production ───────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Sadece çalışma zamanı araçları
RUN apk add --no-cache dumb-init && npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Derlenmiş kaynak + Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY prisma ./prisma

EXPOSE 3001

# dumb-init: zombie process önleme, graceful shutdown
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]

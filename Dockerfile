# ── Deps stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# BACKEND_URL is read by next.config.ts at build time for server-side rewrites
ARG BACKEND_URL=http://reporthole-be:8080
ENV BACKEND_URL=${BACKEND_URL}
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system reporthole && adduser --system --ingroup reporthole reporthole

COPY --from=builder /app/public ./public
COPY --from=builder --chown=reporthole:reporthole /app/.next/standalone ./
COPY --from=builder --chown=reporthole:reporthole /app/.next/static ./.next/static

USER reporthole

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

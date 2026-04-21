# ── Build stage ──────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# ── Production stage ─────────────────────────────────────────
FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Cloud Run injects PORT automatically; default to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server.js"]

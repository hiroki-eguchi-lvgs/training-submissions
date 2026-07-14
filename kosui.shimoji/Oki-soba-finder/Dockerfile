# ===== 段1：ビルド用　tscでdistを作成=====
FROM node:20-slim AS builder
WORKDIR /app

# 依存だけ先にコピー→install（キャッシュを効かせる）
COPY package*.json ./
RUN npm ci

# ソースをコピーしてビルド
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== 段2：実行用====
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# 本番依存だけinstall（devDeps=tsc等は入れない）
COPY package*.json ./
RUN npm ci --omit=dev

# 段1のビルド結果(dist)と、静的フロント(public)をコピー
COPY --from=builder /app/dist ./dist
COPY public ./public

EXPOSE 3000
CMD ["node", "dist/server.js"]

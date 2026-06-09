# syntax=docker/dockerfile:1.7

# ── Dependencies stage ──
FROM node:20-slim AS deps

RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=back-pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile \
  && pnpm rebuild @prisma/client @prisma/engines

# ── Build stage ──
FROM node:20-slim AS build

RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build
RUN CI=true pnpm prune --prod

# ── Production stage ──
FROM node:20-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3003
ENV HOST=0.0.0.0

EXPOSE 3003

CMD ["node", "dist/index.js"]

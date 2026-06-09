# ── Dependencies stage ──
FROM node:20 AS deps

RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Build stage ──
FROM node:20 AS build

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ── Production stage ──
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

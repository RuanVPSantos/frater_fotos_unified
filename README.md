# Frater Fotos - Unified Repo

Mono-repo unificado com **back** (Fastify + Prisma) e **front** (React + Vite) para deploy via Docker + Traefik.

## Estrutura

```
.
├── back/                      # API Fastify
│   ├── Dockerfile             # Multi-stage otimizado
│   ├── package.json
│   ├── prisma/
│   └── src/
├── front/                     # React SPA
│   ├── Dockerfile             # Multi-stage com nginx
│   ├── nginx.conf
│   ├── package.json
│   └── src/
├── docker-compose.production.yml
├── .env.production
├── deploy-gitlab.sh
└── .gitignore
```

## Deploy

### 1. Variáveis de ambiente

Copie `.env.production` para `.env` na VPS e ajuste os segredos:

```bash
scp .env.production Back-Geral:projetos/frater_fotos/.env
```

### 2. GitLab Container Registry

As imagens são publicadas em:
- `registry.gitlab.com/cxtech/frater_fotos/api:prod`
- `registry.gitlab.com/cxtech/frater_fotos/front:prod`

### 3. Rodar deploy

```bash
./deploy-gitlab.sh
```

O script detecta mudanças e faz deploy automático de `app`, `front` ou ambos.

## Desenvolvimento local

```bash
# Back
cd back
pnpm install
pnpm dev

# Front
cd front
pnpm install
pnpm dev
```

## URLs

- Front: https://frater-fotos.cx-tech.net
- API:  https://api-frater.cx-tech.net

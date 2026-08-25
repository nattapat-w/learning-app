# Learning App Monorepo

pnpm workspace with Next.js (`apps/web`) and NestJS (`apps/api`).

**Full setup guide:** [docs/monorepo-setup.md](docs/monorepo-setup.md)

## Structure

```
learning-app/
├── apps/
│   ├── web/     # Next.js frontend (port 3000)
│   └── api/     # NestJS backend (port 3001)
├── package.json
└── pnpm-workspace.yaml
```

## Getting Started

```bash
pnpm install
pnpm dev          # both apps in parallel
pnpm dev:web      # Next only → http://localhost:3000
pnpm dev:api      # Nest only → http://localhost:3001
```

## API Proxy

In dev, Next rewrites `/api/*` to the Nest server (see `API_URL` in `apps/web/.env.example`):

- `http://localhost:3000/api/health` → `http://localhost:3001/health`

SSR server components call `API_URL` directly; the browser uses `/api/*` rewrites.

## Deploy (Vercel + Render)

See [docs/deploy-vercel-render.md](docs/deploy-vercel-render.md).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run web + api in parallel |
| `pnpm dev:web` | Next dev server |
| `pnpm dev:api` | Nest watch mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |

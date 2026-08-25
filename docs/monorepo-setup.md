# Monorepo Setup Guide (Next.js + NestJS)

This document explains how the `learning-app` monorepo is structured, what each piece does, and how to recreate or extend it yourself.

## What This Repo Is

A **pnpm workspace monorepo** with two applications:

| App | Path | Framework | Dev port | Package name |
|-----|------|-----------|----------|--------------|
| Frontend | `apps/web` | Next.js 16 + React 19 + Tailwind 4 | `3000` | `web` |
| Backend | `apps/api` | NestJS 11 | `3001` | `api` |

The root `package.json` does not contain app dependencies. It only orchestrates scripts across workspace packages using pnpm filters.

## Directory Structure

```
learning-app/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router (layout, page, globals.css)
│   │   ├── public/             # Static assets
│   │   ├── next.config.ts      # Next config + API proxy rewrites
│   │   ├── postcss.config.mjs  # Tailwind PostCSS
│   │   ├── eslint.config.mjs   # ESLint (Next presets)
│   │   ├── tsconfig.json       # TypeScript for Next
│   │   └── package.json        # name: "web"
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── main.ts         # Bootstrap, listens on 3001
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   └── app.service.ts
│       ├── nest-cli.json       # Nest CLI config
│       ├── tsconfig.json       # TypeScript for Nest
│       ├── tsconfig.build.json # Build-only TS config
│       └── package.json        # name: "api"
├── docs/                       # Project documentation (this file)
├── package.json                # Root scripts only
├── pnpm-workspace.yaml         # Workspace definition
├── pnpm-lock.yaml              # Single lockfile for entire repo
├── .gitignore
├── AGENTS.md
└── README.md
```

`node_modules` lives at the **repo root** (pnpm hoists and links workspace packages).

---

## Core Concepts

### 1. pnpm Workspaces

`pnpm-workspace.yaml` tells pnpm which folders are packages:

```yaml
packages:
  - "apps/*"
  - "packages/*"

allowBuilds:
  sharp: false
  unrs-resolver: false
```

- `apps/*` — each app is its own package (`web`, `api`).
- `packages/*` — reserved for shared libraries (not created yet, but the glob is ready).
- `allowBuilds` — pnpm security policy for native build scripts (kept from the original Next scaffold).

After `pnpm install`, dependencies are resolved once at the root and linked into each app.

### 2. Package Names and Filters

Each app's `package.json` has a **name** field used by pnpm filters:

- `apps/web/package.json` → `"name": "web"`
- `apps/api/package.json` → `"name": "api"`

Run commands against a single app:

```bash
pnpm --filter web dev
pnpm --filter api build
```

Run across all packages:

```bash
pnpm -r dev          # recursive: every package with a "dev" script
pnpm -r --parallel dev   # run them at the same time
```

### 3. Root Scripts

Root `package.json` is a convenience layer:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "pnpm -r build",
    "start": "pnpm -r --parallel start",
    "lint": "pnpm -r lint"
  }
}
```

| Script | What it does |
|--------|--------------|
| `pnpm dev` | Starts Next (`:3000`) and Nest (`:3001`) in parallel |
| `pnpm dev:web` | Next only |
| `pnpm dev:api` | Nest watch mode only |
| `pnpm build` | Builds all apps |
| `pnpm start` | Runs production servers (both must be built first) |
| `pnpm lint` | Lints all apps |

---

## How the API Proxy Works

Next and Nest both default to port `3000`. To avoid a conflict, Nest runs on **3001**.

In `apps/web/next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://localhost:3001/:path*",
    },
  ];
}
```

**What this means in dev:**

| Browser request | Actually handled by |
|-----------------|---------------------|
| `http://localhost:3000/` | Next.js |
| `http://localhost:3000/api/health` | Proxied to `http://localhost:3001/health` |
| `http://localhost:3001/health` | Nest directly (no proxy) |

The `/api` prefix is stripped when forwarding. Nest controllers use paths like `/health`, not `/api/health`.

**Frontend example:**

```ts
const res = await fetch("/api/health");
const data = await res.json(); // { status: "ok" }
```

**Important:** Rewrites are a **dev convenience**. In production you typically:

- Deploy Next and Nest separately, and point the frontend at the real API URL via env vars, or
- Use a reverse proxy (nginx, Cloudflare, etc.) instead of Next rewrites.

---

## Nest API (apps/api)

### Entry point

`apps/api/src/main.ts` boots Nest on port `3001`:

```ts
await app.listen(3001);
```

### Default endpoints

| Route | Handler | Response |
|-------|---------|----------|
| `GET /` | `AppController.getHello()` | `"Hello from Nest API!"` |
| `GET /health` | `AppController.getHealth()` | `{ "status": "ok" }` |

### Key config files

| File | Purpose |
|------|---------|
| `nest-cli.json` | Nest CLI: source root, build options |
| `tsconfig.json` | TypeScript with decorators (`emitDecoratorMetadata`, `experimentalDecorators`) |
| `tsconfig.build.json` | Extends `tsconfig.json`, excludes tests — used by `nest build` |

### Scripts

| Command | Effect |
|---------|--------|
| `pnpm dev` (in api) | `nest start --watch` — hot reload |
| `pnpm build` | Compiles to `apps/api/dist/` |
| `pnpm start` | `node dist/main` |

---

## Next Web (apps/web)

Moved from the repo root into `apps/web/`. Everything that was at root (`app/`, `public/`, configs) now lives here.

### Key config files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next settings + API rewrites |
| `tsconfig.json` | `@/*` path alias maps to `./*` inside web |
| `postcss.config.mjs` | Tailwind 4 via `@tailwindcss/postcss` |
| `eslint.config.mjs` | ESLint with `eslint-config-next` |

### Scripts

| Command | Effect |
|---------|--------|
| `pnpm dev` (in web) | `next dev` on `:3000` |
| `pnpm build` | Production build → `.next/` |
| `pnpm start` | `next start` (requires build first) |

---

## How to Set This Up From Scratch

Follow these steps if you want to convert a flat Next.js project into this layout on a new repo.

### Step 1 — Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable` then `corepack prepare pnpm@latest --activate`)

### Step 2 — Create workspace config

At repo root, create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Step 3 — Move Next into apps/web

```bash
mkdir -p apps/web
mv app public next.config.ts postcss.config.mjs eslint.config.mjs tsconfig.json apps/web/
```

Create `apps/web/package.json` with `"name": "web"` and move all Next/React/Tailwind dependencies from the root `package.json` into it.

### Step 4 — Slim down root package.json

Root should only have orchestration scripts and `packageManager`. Remove app dependencies from root.

### Step 5 — Create Nest in apps/api

Option A — Nest CLI:

```bash
cd apps
npx @nestjs/cli new api --package-manager pnpm --skip-git
```

Option B — Manual scaffold (what this repo uses): create `apps/api/` with `package.json` (`"name": "api"`), `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json`, and `src/` with `main.ts`, `app.module.ts`, `app.controller.ts`, `app.service.ts`.

**Change the port** in `main.ts` to `3001` so it does not clash with Next.

### Step 6 — Add API proxy to Next

In `apps/web/next.config.ts`, add the `rewrites()` block (see above).

### Step 7 — Update .gitignore

Use repo-wide patterns (no leading `/`) so build output is ignored in any app:

```
node_modules
.next
out
dist
build
.env*
```

### Step 8 — Install and verify

```bash
pnpm install
pnpm build          # both apps should build
pnpm dev            # both should start
```

Test:

- `http://localhost:3000` — Next homepage
- `http://localhost:3001/health` — Nest direct
- `http://localhost:3000/api/health` — Nest via proxy

---

## Adding a Shared Package (Optional)

When you need shared types, constants, or utilities between web and api:

### 1. Create the package

```
packages/shared/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

`packages/shared/package.json`:

```json
{
  "name": "@learning-app/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

### 2. Link into apps

```bash
pnpm --filter web add @learning-app/shared@workspace:*
pnpm --filter api add @learning-app/shared@workspace:*
```

### 3. Import

```ts
import { someType } from "@learning-app/shared";
```

The `packages/*` glob in `pnpm-workspace.yaml` already includes this folder — no workspace config change needed.

---

## Adding Another App

Example: add `apps/admin` (another Next app):

1. Create `apps/admin/` with its own `package.json` (`"name": "admin"`).
2. `pnpm-workspace.yaml` already covers `apps/*` — no change needed.
3. Add a root script: `"dev:admin": "pnpm --filter admin dev"`.
4. Pick a unique dev port in the admin app's dev script: `"dev": "next dev -p 3002"`.

---

## Deployment Notes

| App | Typical host | Notes |
|-----|--------------|-------|
| `web` | Vercel, Netlify | Set root directory to `apps/web` in platform settings |
| `api` | Railway, Fly.io, Docker | Build: `pnpm --filter api build`, Start: `node dist/main` |

For production, replace Next rewrites with:

- An env var like `NEXT_PUBLIC_API_URL` for direct API calls from the browser, or
- A platform-level reverse proxy rule.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Port 3000 already in use | Another Next/dev server running | Kill the process or change port |
| `/api/health` returns 404 | Nest not running | Start api: `pnpm dev:api` |
| `pnpm --filter web` not found | Wrong package name | Check `"name"` in `apps/web/package.json` |
| Nest build fails on decorators | Missing TS decorator options | Ensure `emitDecoratorMetadata` and `experimentalDecorators` in api `tsconfig.json` |
| Dependencies not linking | Forgot `pnpm install` at root | Run `pnpm install` from repo root, not inside an app |
| Sharp/build script blocked | pnpm `allowBuilds` policy | Add the package to `allowBuilds` in `pnpm-workspace.yaml` if needed |

---

## Quick Reference

```bash
# First time
pnpm install

# Development
pnpm dev              # both apps
pnpm dev:web          # Next only (:3000)
pnpm dev:api          # Nest only (:3001)

# Production build
pnpm build

# Run one app
pnpm --filter web build
pnpm --filter api build

# Add a dependency to a specific app
pnpm --filter web add axios
pnpm --filter api add @nestjs/config
```

---

## What Changed From the Original Scaffold

Before monorepo conversion, this was a **flat Next.js app at repo root** with:

- `app/`, `public/`, configs at root
- `pnpm-workspace.yaml` existed but only had `allowBuilds` (not a real workspace)
- All dependencies in root `package.json`

After conversion:

- Next moved to `apps/web/`
- Nest created at `apps/api/`
- Root `package.json` = scripts only
- `pnpm-workspace.yaml` = real workspace with `packages` globs
- Single `pnpm-lock.yaml` at root
- `.gitignore` updated for monorepo paths

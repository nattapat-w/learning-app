# Deploy on Vercel + Render

Split deploy: **Next.js on Vercel**, **NestJS + Postgres on Render**.

```
Browser → Vercel (apps/web)
              ├─ SSR fetches → Render API (API_URL)
              └─ /api/* rewrites → Render API (same URL)
```

## Prerequisites

- Git repo pushed to GitHub/GitLab
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account

---

## 1. Render — API + database

### Option A: Blueprint

1. Render Dashboard → **New → Blueprint**
2. Connect repo → select `render.yaml` at repo root
3. Set **WEB_URL** when prompted (your Vercel URL, set after step 2 if needed)
4. After deploy, copy the API URL (e.g. `https://learning-app-api.onrender.com`)

### Option B: Manual

**PostgreSQL**

1. New → **PostgreSQL** (free tier)
2. Copy **Internal Database URL**

**Web Service**

| Setting | Value |
|---------|--------|
| Root Directory | `apps/api` |
| Build Command | `cd ../.. && corepack enable && pnpm install && pnpm --filter api build` |
| Pre-deploy | `npx prisma migrate deploy` |
| Start Command | `node dist/main.js` |
| Health check | `/health` |

**Environment variables**

```env
NODE_ENV=production
DATABASE_URL=<Render Postgres internal URL>
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
WEB_URL=https://your-app.vercel.app
GOOGLE_CALLBACK_URL=https://your-api.onrender.com/auth/google/callback
```

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`

**Seed (optional, one-time shell on Render or locally against prod DB):**

```bash
pnpm db:seed
```

---

## 2. Vercel — Web

1. Import repo → **Root Directory:** `apps/web`
2. Framework: Next.js (auto)
3. `vercel.json` installs **only** `web` (`pnpm install --filter web...`) — skips API/Prisma postinstall

**Environment variables**

```env
API_URL=https://your-api.onrender.com
```

No trailing slash on `API_URL`.

4. Deploy → copy production URL (e.g. `https://your-app.vercel.app`)

---

## 3. Wire URLs together

Back on **Render API** service, set:

```env
WEB_URL=https://your-app.vercel.app
GOOGLE_CALLBACK_URL=https://your-api.onrender.com/auth/google/callback
```

If you use **Vercel preview URLs** for auth testing, add to Render:

```env
CORS_ORIGINS=https://your-app-git-branch.vercel.app
```

Redeploy API after env changes.

**Google OAuth console:** authorized redirect URI = `GOOGLE_CALLBACK_URL`.

---

## 4. Verify

| Check | URL |
|-------|-----|
| API health | `https://your-api.onrender.com/health` → `status: ok` |
| Home page | Vercel URL loads feed |
| Login | Register/login → header shows user |
| SSR auth | Refresh while logged in → still logged in |

---

## How auth works in production

- Browser calls `https://your-app.vercel.app/api/auth/login`
- Vercel **rewrites** to Render API
- JWT cookie is set on the **Vercel domain** (no cross-site cookie issues)
- SSR reads cookie and forwards it to Render via `API_URL`

---

## Image uploads on Render

Uploaded files live in `apps/api/uploads/` on ephemeral disk — **lost on redeploy**.

For production image posts, move to S3 / Cloudinary / R2 before relying on uploads.

---

## Local dev (unchanged)

```bash
docker compose up -d
pnpm db:migrate
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Copy `apps/web/.env.example` → `.env.local` and `apps/api/.env.example` → `.env`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `fetch failed` / empty feed | Postgres down or API crashed — check Render logs |
| Login works but SSR logged out | Check `API_URL` on Vercel; cookie must reach server components |
| Google OAuth fails | `GOOGLE_CALLBACK_URL` must match Google console + Render URL |
| Render cold start slow | Free tier sleeps after idle — first request wakes service |
| Images disappear | Expected on Render without object storage |

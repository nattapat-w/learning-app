# Reddit Clone — Architecture Plan

Learning-focused Reddit clone with core features only: **subreddits, posts, comments, profiles, auth, and authors**.

This plan assumes the existing monorepo (`apps/web` Next.js + `apps/api` NestJS). No rewrite of the stack — extend what you already have.

---

## 1. Goals and Non-Goals

### In scope (MVP)

| Feature | What users can do |
|---------|-------------------|
| **Auth** | Register, login, logout, session persists |
| **Profile** | View user page (`/u/username`), edit bio/avatar (owner only) |
| **Subreddit** | Create community, browse `/r/name`, list posts |
| **Post** | Create text post in a subreddit, view single post thread |
| **Comment** | Reply on post, nested replies (1 level deep minimum, tree ideally) |
| **Author** | Every post/comment shows author; author links to profile |

### Explicitly out of scope (later)

- Media uploads (images/video)
- Awards, coins, chat
- Mod tools (ban, remove, lock — only basic `moderator` role flag for future)
- Search (full-text can be phase 2)
- Notifications, DMs
- Reddit-style "hot" ranking algorithm (start with `new`; add `hot` later)
- Mobile apps

---

## 2. Recommended Stack

### Keep (already in repo)

| Layer | Choice | Why |
|-------|--------|-----|
| **Monorepo** | pnpm workspaces | One lockfile, shared types later, `pnpm dev` runs both apps |
| **Frontend** | Next.js 16 App Router + React 19 | SSR/SEO for public posts and subreddits; `/api` proxy to Nest in dev |
| **Backend** | NestJS 11 | Module-per-domain (`AuthModule`, `PostsModule`…), guards, DI, scales with features |
| **Styling** | Tailwind 4 | Fast UI without a heavy component library for MVP |
| **Language** | TypeScript everywhere | Shared mental model between web and api |

### Add

| Layer | Choice | Why | Alternatives considered |
|-------|--------|-----|-------------------------|
| **Database** | **PostgreSQL 16** | Relational model fits users ↔ posts ↔ comments; ACID votes; `UNIQUE` constraints stop double-voting | MongoDB — flexible but vote integrity and comment trees are harder; SQLite — fine for solo dev but Postgres matches production path |
| **ORM** | **Prisma** | Schema-first, migrations, type-safe client, Nest integration is straightforward | Drizzle — lighter, also good; TypeORM — more boilerplate |
| **Auth** | **JWT in httpOnly cookie** + Nest Passport | API owns auth; web stores token in cookie (not localStorage); Nest `JwtAuthGuard` on protected routes | NextAuth only on web — splits auth logic; session table — more moving parts for MVP |
| **Validation** | `class-validator` + `class-transformer` | Nest standard for DTOs | Zod in shared package — good later when `packages/shared` exists |
| **API docs** | Swagger (`@nestjs/swagger`) | Learning + Postman sync | Skip if you prefer Postman-only |

### Optional (phase 2, not MVP)

| Layer | When |
|-------|------|
| **Redis** | Cache hot feeds, rate limiting |
| **packages/shared** | Shared Zod schemas / DTO types between web and api |
| **BullMQ** | Background jobs (email, score recompute) |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │     apps/web (Next.js)      │
              │  :3000                      │
              │  • Pages: /, /r/[slug],     │
              │    /r/[slug]/post/[id],     │
              │    /u/[username], /login    │
              │  • SSR: fetch public data   │
              │  • Client: vote, comment    │
              │  • Dev proxy: /api → :3001  │
              └──────────────┬──────────────┘
                             │ HTTP (JSON)
              ┌──────────────┴──────────────┐
              │     apps/api (NestJS)       │
              │  :3001                      │
              │  • REST API                 │
              │  • Auth (JWT)               │
              │  • Domain modules           │
              └──────────────┬──────────────┘
                             │
              ┌──────────────┴──────────────┐
              │     PostgreSQL              │
              │  • users, communities,      │
              │    posts, comments, votes   │
              └─────────────────────────────┘
```

### Request flow examples

**Public read (SSR)**

1. User opens `/r/javascript/post/abc123`
2. Next server component calls `GET /posts/abc123` (via internal API URL or `/api` proxy)
3. Nest loads post + comments tree from Postgres
4. HTML rendered with data — good for learning SSR patterns

**Authenticated write**

1. User submits comment (client component)
2. `POST /api/comments` with cookie JWT
3. Nest `JwtAuthGuard` validates token → `CommentsService.create()`
4. Response returns new comment; UI updates

### Why API-first (Nest) instead of Next-only

- **Separation**: Reddit domain logic stays in Nest modules — easier to test and reason about than mixing everything in Next route handlers
- **Future**: Same API can serve mobile or public API later
- **Learning**: Two real production patterns (BFF vs dedicated API) — you already chose dedicated API

### Why not put DB in Next directly

- Duplicates data access in two places
- Nest already owns business rules (votes, permissions)
- One seam: **web = presentation, api = domain + persistence**

---

## 4. Domain Model

### Ubiquitous language

| Term | Meaning | Not |
|------|---------|-----|
| **User** | Account that can log in | "Author" is a *role* on content, not a separate entity |
| **Author** | The `user` who created a post or comment | Not a separate `authors` table |
| **Community** | A subreddit (`r/name`) | Code can use `Community` entity, URL stays `/r/...` |
| **Post** | Top-level submission in a community | Not "thread" (thread = post + comments) |
| **Comment** | Reply on a post; may have `parentId` for nesting | Not a separate "reply" entity |
| **Vote** | +1 or −1 on a post or comment by one user | One vote per user per target |

### Entity relationships

```
User 1───* Post
User 1───* Comment
User 1───* Vote
User *───* Community (via CommunityMember)

Community 1───* Post
Post 1───* Comment
Comment 1───* Comment (parent → children, self-reference)

Post 1───* Vote (polymorphic)
Comment 1───* Vote (polymorphic)
```

### Permissions (MVP)

| Action | Rule |
|--------|------|
| Create community | Any authenticated user |
| Create post | Authenticated + community exists |
| Create comment | Authenticated + post not locked (no lock in MVP) |
| Edit profile | Owner only |
| Delete post/comment | Owner only (soft delete optional) |

---

## 5. Database Schema (Prisma-oriented)

### Core tables

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  displayName  String?
  bio          String?
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  posts              Post[]
  comments           Comment[]
  votes              Vote[]
  memberships        CommunityMember[]
  communitiesCreated Community[]       @relation("CommunityCreator")
}

model Community {
  id          String   @id @default(cuid())
  name        String   @unique   // URL slug: "javascript"
  title       String             // display: "JavaScript"
  description String?
  creatorId   String
  creator     User     @relation("CommunityCreator", fields: [creatorId], references: [id])
  createdAt   DateTime @default(now())

  posts       Post[]
  members     CommunityMember[]
}

model CommunityMember {
  id          String   @id @default(cuid())
  userId      String
  communityId String
  role        MemberRole @default(MEMBER)
  joinedAt    DateTime   @default(now())

  user      User      @relation(fields: [userId], references: [id])
  community Community @relation(fields: [communityId], references: [id])

  @@unique([userId, communityId])
}

enum MemberRole {
  MEMBER
  MODERATOR
}

model Post {
  id          String   @id @default(cuid())
  title       String
  body        String?
  authorId    String
  communityId String
  score       Int      @default(0)  // denormalized; updated on vote
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author    User      @relation(fields: [authorId], references: [id])
  community Community @relation(fields: [communityId], references: [id])
  comments  Comment[]

  @@index([communityId, createdAt])
}

model Comment {
  id        String   @id @default(cuid())
  body      String
  authorId  String
  postId    String
  parentId  String?  // null = top-level on post
  score     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author   User     @relation(fields: [authorId], references: [id])
  post     Post     @relation(fields: [postId], references: [id])
  parent   Comment? @relation("CommentTree", fields: [parentId], references: [id])
  children Comment[] @relation("CommentTree")

  @@index([postId, createdAt])
}

model Vote {
  id         String     @id @default(cuid())
  userId     String
  targetType VoteTarget
  targetId   String
  value      Int        // +1 or -1

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId])
  @@index([targetType, targetId])
}

enum VoteTarget {
  POST
  COMMENT
}
```

### Schema decisions and reasoning

| Decision | Reason |
|----------|--------|
| **Denormalized `score` on Post/Comment** | Fast sort by score without `COUNT` on every list query; update in same transaction as vote |
| **Polymorphic `Vote` table** | One place for vote rules (`UNIQUE user+target`); alternative is two tables — more duplication |
| **Adjacency list (`parentId`) for comments** | Simplest MVP; load tree in app layer or 2 queries (top-level + children) |
| **`cuid` IDs** | URL-safe, no sequential leak; good for public `/post/[id]` routes |
| **Username separate from displayName** | Reddit pattern: stable URL `/u/spez` vs display name |

### Comment tree loading (MVP approach)

1. Fetch all comments for `postId` ordered by `createdAt`
2. Build tree in memory (map `id → node`, attach to `parentId`)
3. Fine for hundreds of comments per post; paginate later if needed

**Later upgrade**: closure table or `path` column if threads get huge.

---

## 6. NestJS Module Layout

```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── guards/jwt-auth.guard.ts
│   ├── decorators/current-user.decorator.ts
│   └── prisma/prisma.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # POST /auth/register, /auth/login, /auth/logout
│   ├── auth.service.ts
│   └── strategies/jwt.strategy.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts     # GET /users/:username, PATCH /users/me
│   └── users.service.ts
├── communities/
│   ├── communities.module.ts
│   ├── communities.controller.ts  # CRUD + GET /communities/:name/posts
│   └── communities.service.ts
├── posts/
│   ├── posts.module.ts
│   ├── posts.controller.ts     # GET/POST /posts, GET /posts/:id
│   └── posts.service.ts
├── comments/
│   ├── comments.module.ts
│   ├── comments.controller.ts  # POST /comments, GET /posts/:id/comments
│   └── comments.service.ts
└── votes/
    ├── votes.module.ts
    ├── votes.controller.ts     # POST /votes (upsert), DELETE /votes
    └── votes.service.ts
```

Each module = **deep module** (small controller surface, logic in service, Prisma in service or thin repository).

---

## 7. API Surface (REST MVP)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create user |
| POST | `/auth/login` | — | Set httpOnly cookie |
| POST | `/auth/logout` | — | Clear cookie |
| GET | `/auth/me` | JWT | Current user |
| GET | `/users/:username` | — | Public profile + recent posts |
| PATCH | `/users/me` | JWT | Update bio, displayName, avatarUrl |
| GET | `/communities` | — | List communities |
| POST | `/communities` | JWT | Create community |
| GET | `/communities/:name` | — | Community detail |
| GET | `/communities/:name/posts` | — | Posts in community (`?sort=new`) |
| POST | `/posts` | JWT | Create post |
| GET | `/posts/:id` | — | Post + author + community |
| DELETE | `/posts/:id` | JWT | Owner only |
| GET | `/posts/:id/comments` | — | Comment tree |
| POST | `/comments` | JWT | Create comment |
| DELETE | `/comments/:id` | JWT | Owner only |
| PUT | `/votes` | JWT | Upsert vote `{ targetType, targetId, value }` |
| DELETE | `/votes` | JWT | Remove vote |

**Sort query (MVP)**: `new` = `ORDER BY createdAt DESC`. Add `top` = `ORDER BY score DESC` in phase 2.

---

## 8. Next.js Route Map

| Route | Type | Data source |
|-------|------|-------------|
| `/` | Server | Home: recent posts from all or subscribed communities |
| `/login`, `/register` | Client | Auth forms → API |
| `/r/[name]` | Server | Community + post list |
| `/r/[name]/submit` | Client | Create post form |
| `/r/[name]/post/[id]` | Server + Client | SSR post/thread; client for vote/comment |
| `/u/[username]` | Server | Profile + user's posts/comments |
| `/settings/profile` | Client | Edit own profile |

Use **Server Components** for reads; **Client Components** only for forms, voting, optimistic UI.

---

## 9. Auth Flow Detail

```
Register/Login
  → Nest validates credentials (bcrypt password)
  → Nest signs JWT { sub: userId, username }
  → Nest sets Set-Cookie: access_token=...; HttpOnly; Secure (prod); SameSite=Lax
  → Web never stores token in localStorage

Protected request
  → Browser sends cookie automatically
  → Nest JwtStrategy extracts from cookie OR Authorization header
  → @CurrentUser() decorator injects user into handler
```

**Why httpOnly cookie**

- XSS cannot steal token from `localStorage`
- Fits SSR: server can forward cookie to API on server-side fetches

**Web server fetch pattern**

```ts
// apps/web/lib/api.ts — pass cookies on server
import { cookies } from "next/headers";

export async function apiFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  return fetch(`${process.env.API_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: cookieStore.toString(),
    },
  });
}
```

---

## 10. Implementation Phases

### Phase 0 — Foundation (1–2 days)

- [ ] Docker Compose: Postgres locally
- [ ] Prisma in `apps/api`, initial migration
- [ ] `PrismaService` global in Nest
- [ ] Health check includes DB connectivity

### Phase 1 — Auth + Users (2–3 days)

- [ ] Register / login / logout / me
- [ ] JWT cookie strategy
- [ ] Profile page read + edit
- [ ] Web: login/register forms, auth context or cookie-only checks

### Phase 2 — Communities + Posts (2–3 days)

- [ ] Create community, list, detail
- [ ] Create post, list by community, single post view
- [ ] Web: `/r/[name]`, submit post, home feed

### Phase 3 — Comments (2 days)

- [ ] Nested comments API + tree builder
- [ ] Web: comment thread UI on post page

### Phase 4 — Votes (1–2 days)

- [ ] Vote upsert with score denormalization (transaction)
- [ ] Web: upvote/downvote buttons, optimistic UI

### Phase 5 — Polish (ongoing)

- [ ] Pagination (cursor-based on `createdAt` + `id`)
- [ ] Error handling, loading states
- [ ] Basic seed script for demo data
- [ ] Swagger docs

---

## 11. Local Dev Setup (to add)

```yaml
# docker-compose.yml (project root)
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: reddit
      POSTGRES_PASSWORD: reddit
      POSTGRES_DB: reddit
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```env
# apps/api/.env
DATABASE_URL="postgresql://reddit:reddit@localhost:5433/reddit"
JWT_SECRET="dev-only-change-in-production"
JWT_EXPIRES_IN="7d"
```

```env
# apps/web/.env.local
API_URL="http://localhost:3001"
```

---

## 12. Trade-offs Summary

| Choice | Win | Cost |
|--------|-----|------|
| Postgres + Prisma | Correctness, relations, migrations | Ops: need Postgres running |
| Nest separate API | Clear modules, testable domain | Two deployables, CORS/cookie config |
| JWT cookie | Simple, works with SSR | No instant revoke without blocklist (OK for learning) |
| Denormalized score | Fast lists | Must update on every vote in transaction |
| Adjacency list comments | Simple schema | Deep threads need careful loading at scale |
| No `packages/shared` yet | Less setup | Some DTO duplication until shared package added |

---

## 13. What to Build First

Recommended order matches learning value:

1. **Prisma + User model** — see data layer
2. **Auth** — guards and protected routes everywhere else depend on this
3. **Community + Post** — core read paths and SSR
4. **Comments** — tree logic
5. **Votes** — transactions and denormalization

Skip home feed aggregation until single-community flows work.

---

## 14. Related Docs

- [Monorepo Setup](./monorepo-setup.md) — pnpm, dev proxy, ports
- `CONTEXT.md` (root) — domain glossary (User, Community, Author-as-role)

---

## 15. ADR Candidates (write when implementing)

| ADR | Trigger |
|-----|---------|
| Postgres over Mongo | When you first add Prisma |
| JWT cookie auth | When implementing login |
| Denormalized vote scores | When implementing votes |
| Adjacency list for comments | When implementing comment tree |

Use `docs/adr/0001-*.md` format when the decision is locked in code.

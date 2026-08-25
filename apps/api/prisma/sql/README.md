# Database SQL scripts

Run on **empty** Render Postgres (or local).

| File | Purpose |
|------|---------|
| `00-init-schema.sql` | All tables + Prisma migration markers |
| `01-seed-minimal.sql` | Optional: demo user, community, post |

## Render Postgres dashboard

1. Open your Postgres service → **Connect** → **PSQL Command** or **External connection**
2. Paste contents of `00-init-schema.sql` → run
3. (Optional) Paste `01-seed-minimal.sql` → run

## psql (local)

```bash
psql "postgresql://user:pass@host:5432/dbname" -f apps/api/prisma/sql/00-init-schema.sql
psql "postgresql://user:pass@host:5432/dbname" -f apps/api/prisma/sql/01-seed-minimal.sql
```

Against Render from your machine, use the **External** Database URL (not internal).

## Full seed (22 users, 12 communities, many posts)

SQL seed for full dataset is too large — use Prisma:

```bash
# set DATABASE_URL to your Render external URL
pnpm db:deploy   # only if you did NOT run 00-init-schema.sql
pnpm db:seed
```

## Minimal demo login

After `01-seed-minimal.sql`:

- Email: `demo@example.test`
- Password: `password123`

## Verify

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) FROM "User";
```

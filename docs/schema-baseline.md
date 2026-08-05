# Schema baseline

## Why this exists

For most of this project's life the database could not be rebuilt from the
repository. `supabase/migrations/` contained 35 files, but there was no
`CREATE TABLE` for `profiles`, `posts`, `comments`, `carbon_projects`,
`carbon_credits`, `bans`, `warnings`, `notifications` or a dozen others. Every
migration only `ALTER`ed tables that had been created by hand in the hosted
project.

The consequences were:

- no local development against a real schema
- no CI that could run migrations
- no way to stand up a staging environment
- no recovery path if the hosted project were lost
- schema drift with no way to detect it

Two generated migrations now close that gap:

| File | Contents |
| --- | --- |
| `20260101000000_schema_baseline_tables.sql` | The 20 previously uncaptured tables. Timestamped before every other migration, because they `ALTER` these tables. |
| `20260805000001_schema_baseline_constraints.sql` | Unique constraints and 27 foreign keys. Timestamped after every other migration, because some keys reference tables that later migrations create (`challenges`, for example). |

## How they were produced

`scripts/generate-schema-baseline.cjs` derives them from `src/types/supabase.ts`,
which is generated from the live schema. Regenerate with:

```bash
node scripts/generate-schema-baseline.cjs           # rewrite both migrations
node scripts/generate-schema-baseline.cjs --out x.sql   # preview only
```

### What is accurate

Read directly from generated metadata:

- table names
- column names
- nullability
- which columns are foreign keys, and what they reference

### What is inferred, and must be reconciled

The generated TypeScript types do not carry these, so they are **guessed or
absent**:

- exact scalar types (`BIGINT` vs `INTEGER`, `TEXT` vs `VARCHAR(n)`, numeric
  precision)
- `DEFAULT` expressions
- `CHECK` constraints and enum domains
- `ON DELETE` / `ON UPDATE` behaviour — `CASCADE` is assumed everywhere
- unique constraints and **all** indexes
- RLS policies
- triggers and trigger functions, including the `auth.users` → `profiles`
  signup trigger this schema depends on

> [!IMPORTANT]
> The baseline is a working starting point, not the canonical schema. On a
> machine with database credentials, run
> `supabase db dump --schema public > dump.sql`, diff it against these two
> files, and commit the corrections. Until then, treat a rebuilt environment as
> approximate.

### RLS is deny-by-default

Every baselined table gets `ENABLE ROW LEVEL SECURITY` with **no policies**.
Deny-by-default is the safe failure mode: a rebuilt environment returns nothing
rather than leaking rows. It also means a rebuilt environment is not functional
for authenticated reads until the real policies are recovered from the live
project and committed.

## Verifying a rebuild

`scripts/verify-migrations.cjs` replays the entire directory, in filename order,
against an empty in-memory Postgres:

```bash
npm install --no-save @electric-sql/pglite
node scripts/verify-migrations.cjs
```

Current result: **37 applied, 0 failed, 2 skipped**. The two skips
(`setup_cron`, `schedule_ingest_carbonmark`) need `pg_cron`, which PGlite does
not provide; they only schedule jobs.

This check is worth running before any migration lands. It already caught a real
pre-existing bug: `carbon_stakeholders` was created without `volume_2026` or
`delta_num`, yet a later migration inserts into both and a view selects
`SUM(volume_2026)`. Those columns had been added by hand in production, so
replaying the repository failed partway through. Fixed by
`20260310015000_carbon_stakeholders_missing_columns.sql`.

## Excluded tables

`fotos`, `musicas` and `presentes` exist in the same hosted Supabase project but
belong to a different application (a gift/music app) and are unused by this
codebase. They are excluded via `FOREIGN_TABLES` in the generator so this
baseline describes only this project's schema.

Several baselined tables are also currently unused by application code:
`api_keys`, `audit_log`, `organizations`, `saved_searches`,
`karma_transactions`, `user_achievements`. They are included because they exist
in the live database, but they are candidates for review.

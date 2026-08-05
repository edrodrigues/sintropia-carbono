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

### Both generated files are strict no-ops on an existing database

Migrations run against the **live** database as well as a fresh one, so both
generated files are written to change nothing that already exists:

- **Tables.** Each `CREATE TABLE` sits inside a `to_regclass(...) IS NULL`
  guard, and `ENABLE ROW LEVEL SECURITY` runs **inside that same guard**.
- **Constraints.** Each foreign key and unique constraint is created only when
  no constraint already exists on that column.

> [!WARNING]
> Two changes to these files would cause real damage, and both look harmless:
>
> 1. **Never rewrite the constraints as `DROP CONSTRAINT ... ADD CONSTRAINT ...
>    ON DELETE CASCADE`.** The `CASCADE` here is an assumption for a
>    from-scratch rebuild; the real referential actions exist only in the
>    database and are not recoverable from the generated types. Dropping and
>    re-adding would replace them with `CASCADE`, so if `posts.author_id` is
>    really `ON DELETE SET NULL`, deleting a profile would begin deleting that
>    user's posts.
> 2. **Never hoist `ENABLE ROW LEVEL SECURITY` out of the table guards.**
>    Enabling RLS on a live table that deliberately has it off, with no policies
>    present, denies every non-service-role read and takes the site down.

`scripts/verify-constraints-safe.cjs` enforces both, in both directions. It
pre-creates **all 27** foreign keys with `ON DELETE SET NULL` (deliberately not
the assumed `CASCADE`) and RLS switched off, applies both migrations, then
asserts:

- the schema is **byte-identical** afterwards (columns, RLS flags, constraints)
- **no** foreign key anywhere was converted to `CASCADE`
- RLS was not switched on for any existing table
- deleting a parent row does not cascade to its children
- re-applying a second time still changes nothing
- and, on an empty database, the tables *are* created with RLS on and the
  foreign keys *are* added

### RLS is deny-by-default

Every baselined table gets `ENABLE ROW LEVEL SECURITY` with **no policies**.
Deny-by-default is the safe failure mode: a rebuilt environment returns nothing
rather than leaking rows. It also means a rebuilt environment is not functional
for authenticated reads until the real policies are recovered from the live
project and committed.

## Verifying a rebuild

Three checks run in sequence, against a schema built from nothing but this
directory in an in-process Postgres:

```bash
npm install --no-save @electric-sql/pglite   # dev-only, not a saved dependency
npm run db:verify
```

| Script | Question it answers |
| --- | --- |
| `verify-migrations.cjs` | Does every migration apply, from empty, in filename order? |
| `verify-schema-contract.cjs` | Does the result contain every table and column the application's type contract requires? |
| `verify-app-queries.cjs` | Do the queries the app actually issues run against it — including views, filters, ORDER BY columns, join keys and RPCs? |
| `verify-constraints-safe.cjs` | Are both generated files genuine no-ops against an existing database, preserving its real ON DELETE actions and RLS flags? |

Current result: **37 migrations applied, 0 failed, 2 skipped**; **43/43 app
tables with no missing columns**; **24/24 representative app queries run**; and
both generated migrations proven byte-identical no-ops on an existing database. The
two skips (`setup_cron`, `schedule_ingest_carbonmark`) only schedule jobs and
need `pg_cron`, which PGlite does not provide.

The layering matters. "Migrations apply" is weaker than it sounds: a migration
set can apply cleanly and still produce a schema the application cannot use. The
second and third checks are what actually establish that a rebuilt environment
is usable.

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

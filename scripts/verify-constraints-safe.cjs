// Prove the baseline constraints migration is production-safe.
//
// It runs against the LIVE database too, where these constraints already exist
// with their real ON DELETE behaviour. The earlier version used
// DROP CONSTRAINT IF EXISTS + ADD ... ON DELETE CASCADE, which would have
// silently replaced e.g. ON DELETE SET NULL with cascading deletes -- deleting a
// profile could then delete that user's posts.
//
// This simulates that situation: build a database whose FK deliberately uses
// SET NULL, apply the migration, and assert the action is untouched and that
// dependent rows survive a delete.
const fs = require("fs");
const path = require("path");

const CONSTRAINTS = path.join("supabase", "migrations", "20260805000001_schema_baseline_constraints.sql");

(async () => {
  let PGlite;
  try {
    ({ PGlite } = await import("@electric-sql/pglite"));
  } catch {
    console.error("Needs: npm install --no-save @electric-sql/pglite");
    process.exit(2);
  }

  const db = await PGlite.create();
  let pass = true;
  const check = (label, cond, detail) => {
    console.log((cond ? "  PASS  " : "  FAIL  ") + label + (detail ? "   " + detail : ""));
    if (!cond) pass = false;
  };

  // A stand-in for production: profiles + posts, where posts.author_id is
  // ON DELETE SET NULL, NOT the CASCADE the baseline would assume.
  await db.exec(`
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY,
      username TEXT NOT NULL
    );
    CREATE TABLE public.posts (
      id UUID PRIMARY KEY,
      author_id UUID,
      title TEXT,
      CONSTRAINT posts_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES public.profiles(id)
        ON DELETE SET NULL
    );
  `);

  const actionOf = async () => {
    const r = await db.query(`
      SELECT con.confdeltype
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'posts' AND con.contype = 'f'
    `);
    return r.rows.map(x => x.confdeltype);
  };

  const before = await actionOf();
  // 'n' = SET NULL, 'c' = CASCADE, 'a' = NO ACTION, 'r' = RESTRICT
  check("precondition: live FK is SET NULL", before.length === 1 && before[0] === "n",
    "confdeltype=" + JSON.stringify(before));

  // Apply only the posts.author_id guard from the real migration file, so the
  // shipped SQL is what gets tested.
  const sql = fs.readFileSync(CONSTRAINTS, "utf8");
  const blocks = sql.split("DO $$").filter(b => b.includes("posts_author_id_fkey"));
  check("migration contains a posts.author_id guard", blocks.length === 1,
    "found " + blocks.length);

  if (blocks.length === 1) {
    await db.exec("DO $$" + blocks[0].slice(0, blocks[0].indexOf("END $$;") + 7));
  }

  const after = await actionOf();
  check("FK count unchanged (no duplicate added)", after.length === 1, "count=" + after.length);
  check("ON DELETE SET NULL was NOT rewritten to CASCADE",
    after.length === 1 && after[0] === "n",
    "confdeltype=" + JSON.stringify(after));

  // Behavioural proof: the dependent row must survive.
  await db.exec(`
    INSERT INTO public.profiles (id, username)
      VALUES ('11111111-1111-1111-1111-111111111111', 'alice');
    INSERT INTO public.posts (id, author_id, title)
      VALUES ('22222222-2222-2222-2222-222222222222',
              '11111111-1111-1111-1111-111111111111', 'hello');
    DELETE FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';
  `);
  const survivors = await db.query("SELECT id, author_id FROM public.posts");
  check("deleting a profile does NOT delete their post",
    survivors.rows.length === 1 && survivors.rows[0].author_id === null,
    JSON.stringify(survivors.rows));

  // And on a fresh database the guard must actually create the constraint.
  const fresh = await PGlite.create();
  await fresh.exec(`
    CREATE TABLE public.profiles (id UUID PRIMARY KEY, username TEXT NOT NULL);
    CREATE TABLE public.posts (id UUID PRIMARY KEY, author_id UUID, title TEXT);
  `);
  if (blocks.length === 1) {
    await fresh.exec("DO $$" + blocks[0].slice(0, blocks[0].indexOf("END $$;") + 7));
  }
  const created = await fresh.query(`
    SELECT con.conname FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'posts' AND con.contype = 'f'
  `);
  check("on a fresh database the FK IS created", created.rows.length === 1,
    JSON.stringify(created.rows.map(r => r.conname)));

  await db.close();
  await fresh.close();
  console.log("\n" + (pass ? "MIGRATION IS PRODUCTION-SAFE" : "MIGRATION IS NOT SAFE"));
  process.exit(pass ? 0 : 1);
})();

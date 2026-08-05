// Confirm the rate-limit migration introduces genuinely NEW objects, so its
// CREATE OR REPLACE cannot clobber an existing production function, and its
// GRANTs do not widen access to anything pre-existing.
const fs = require("fs");

// The generated types reflect the LIVE schema. I added consume_rate_limit /
// prune_rate_limits to that file by hand, so presence there proves nothing.
// Check git HEAD~ instead: what the types looked like BEFORE my change.
const { execSync } = require("child_process");

function typesAt(rev) {
  try {
    return execSync("git show " + rev + ":src/types/supabase.ts", { encoding: "utf8", maxBuffer: 40 * 1024 * 1024 });
  } catch {
    return null;
  }
}

let pass = true;
const check = (label, cond, detail) => {
  console.log((cond ? "  PASS  " : "  FAIL  ") + label + (detail ? "   " + detail : ""));
  if (!cond) pass = false;
};

// abce1f4 is the first commit of this work; its types are pre-my-edits.
const original = typesAt("abce1f4");
check("recovered pre-change generated types", original !== null,
  original ? original.length + " bytes" : "git show failed");

if (original) {
  console.log("objects the rate-limit migration creates must NOT already exist live:");
  for (const name of ["rate_limits", "consume_rate_limit", "prune_rate_limits"]) {
    const present = new RegExp("\\b" + name + ":").test(original);
    check(name + " absent from live schema", !present, present ? "ALREADY EXISTS" : "");
  }
}

// Any CREATE OR REPLACE must target only those new objects.
const sql = fs.readFileSync("supabase/migrations/20260805000000_rate_limits.sql", "utf8");
const replaced = [...sql.matchAll(/CREATE OR REPLACE FUNCTION public\.(\w+)/g)].map(m => m[1]);
console.log("\nCREATE OR REPLACE targets:");
check("only the two new functions are replaced",
  replaced.length === 2 && replaced.every(n => ["consume_rate_limit", "prune_rate_limits"].includes(n)),
  JSON.stringify(replaced));

// GRANTs must not touch anything else.
const grants = [...sql.matchAll(/GRANT EXECUTE ON FUNCTION public\.(\w+)/g)].map(m => m[1]);
console.log("\nGRANT targets:");
check("grants are scoped to the new functions",
  grants.every(n => ["consume_rate_limit", "prune_rate_limits"].includes(n)),
  JSON.stringify(grants));

// The table must be guarded and RLS-enabled in the same breath.
console.log("\ntable creation:");
check("rate_limits uses IF NOT EXISTS", /CREATE TABLE IF NOT EXISTS public\.rate_limits/.test(sql));
check("rate_limits enables RLS", /ALTER TABLE public\.rate_limits ENABLE ROW LEVEL SECURITY/.test(sql));

// The carbon_stakeholders drift fix must be additive only.
const drift = fs.readFileSync("supabase/migrations/20260310015000_carbon_stakeholders_missing_columns.sql", "utf8");
console.log("\ncarbon_stakeholders drift fix:");
check("uses ADD COLUMN IF NOT EXISTS only",
  (drift.match(/ADD COLUMN IF NOT EXISTS/g) || []).length === 2
  && !/DROP|ALTER COLUMN|TYPE /.test(drift.split(/\r?\n/).filter(l => !l.trim().startsWith("--")).join("\n")));

console.log("\n" + (pass ? "RATE-LIMIT AND DRIFT MIGRATIONS ARE ADDITIVE" : "REVIEW NEEDED"));
process.exit(pass ? 0 : 1);

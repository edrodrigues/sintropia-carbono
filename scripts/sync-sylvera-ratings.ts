// scripts/sync-sylvera-ratings.ts
//
// Pulls project ratings from the official Sylvera Assessment API
// (https://docs.sylvera.com/) and upserts them into cad_trust_ratings.
//
// Auth: Sylvera uses API-key -> Bearer-token exchange, NOT username/password.
// Set SYLVERA_API_KEY in .env.local to a key generated from the Sylvera
// dashboard (format: "<public-id>.<private-secret>"). POST it to
// /auth/tokens to get a short-lived (30 min) access token.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SYLVERA_AUTH_URL = "https://api.sylvera.com/auth/tokens";
const SYLVERA_API_BASE = "https://api.sylvera.com/v1";
const SYLVERA_API_KEY = process.env.SYLVERA_API_KEY;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SYLVERA_API_KEY) {
  console.error(
    "SYLVERA_API_KEY not set in .env.local. Sylvera's API authenticates with an API key " +
    "(format 'public.private'), not a login/password — generate one from the Sylvera " +
    "dashboard (Account/API settings) and set it as SYLVERA_API_KEY.",
  );
  process.exit(1);
}
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getAccessToken(): Promise<string> {
  const res = await fetch(SYLVERA_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/vnd.api+json" },
    body: JSON.stringify({
      data: { type: "apiTokens", attributes: { apiKey: SYLVERA_API_KEY } },
    }),
  });
  if (!res.ok) {
    throw new Error(`Sylvera auth failed: ${res.status} ${res.statusText} — ${await res.text()}`);
  }
  const body = await res.json();
  return body.data.attributes.accessToken as string;
}

interface SylveraIdentifier {
  identifier_type: "internal_project_id" | "current_registry_project_id" | string;
  value: string;
}

interface SylveraAssessment {
  body: string;
  assessment_type: string;
  on_watch: boolean;
  on_watch_commentary?: string;
  issued_at: string;
  rating: string;
  links: string[];
}

interface SylveraProjectEntry {
  project: {
    name: string;
    identifiers: SylveraIdentifier[];
    project_description?: string;
    registry_link?: string;
  };
  registry: { current_registry: { name: string } };
  x_sylvera_assessment: SylveraAssessment[] | null;
}

interface SylveraProjectsResponse {
  meta: { total: number; page: number; limit: number };
  data: SylveraProjectEntry[];
}

async function fetchAllAssessedProjects(accessToken: string): Promise<SylveraProjectEntry[]> {
  const limit = 1000;
  let page = 1;
  const all: SylveraProjectEntry[] = [];

  while (true) {
    const url = `${SYLVERA_API_BASE}/projects?page=${page}&limit=${limit}&onlyIncludeAssessedProjects=true`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Sylvera /projects failed (page ${page}): ${res.status} ${res.statusText} — ${await res.text()}`);
    }
    const body: SylveraProjectsResponse = await res.json();
    all.push(...body.data);
    console.log(`Fetched page ${page}: ${body.data.length} projects (${all.length}/${body.meta.total})`);
    if (all.length >= body.meta.total || body.data.length === 0) break;
    page++;
  }

  return all;
}

function pickIdentifier(identifiers: SylveraIdentifier[], type: string): string | undefined {
  return identifiers.find(i => i.identifier_type === type)?.value;
}

function pickBestAssessment(assessments: SylveraAssessment[]): SylveraAssessment | undefined {
  if (assessments.length === 0) return undefined;
  return [...assessments].sort((a, b) => {
    if (a.issued_at !== b.issued_at) return a.issued_at > b.issued_at ? -1 : 1;
    if (a.assessment_type === b.assessment_type) return 0;
    return a.assessment_type === "full" ? -1 : 1;
  })[0];
}

async function run() {
  console.log("Authenticating with Sylvera...");
  const accessToken = await getAccessToken();

  console.log("Fetching assessed projects from Sylvera...");
  const entries = await fetchAllAssessedProjects(accessToken);
  console.log(`Got ${entries.length} assessed project(s) from Sylvera`);

  let matched = 0;
  let upserted = 0;
  const unmatched: { registryProjectId: string; registryName: string; rating: string }[] = [];

  for (const entry of entries) {
    const assessment = pickBestAssessment(entry.x_sylvera_assessment ?? []);
    if (!assessment) continue;

    const registryProjectId = pickIdentifier(entry.project.identifiers, "current_registry_project_id");
    if (!registryProjectId) {
      console.warn(`Skipping "${entry.project.name}": no current_registry_project_id identifier`);
      continue;
    }

    const { data: project, error: lookupErr } = await supabase
      .from("cad_trust_projects")
      .select("id")
      .eq("project_id", registryProjectId)
      .maybeSingle();

    if (lookupErr) {
      console.warn(`Lookup failed for project_id ${registryProjectId}: ${lookupErr.message}`);
      continue;
    }

    if (!project) {
      unmatched.push({
        registryProjectId,
        registryName: entry.registry.current_registry.name,
        rating: assessment.rating,
      });
      continue;
    }

    matched++;

    const { error: upsertErr } = await supabase
      .from("cad_trust_ratings")
      .upsert({
        cad_trust_project_id: project.id,
        rating_name: "Sylvera",
        rating_type: assessment.assessment_type,
        rating_value: assessment.rating,
        rating_link: assessment.links?.[0] ?? null,
        rating_source: "direct",
        rated_at: assessment.issued_at,
        on_watch: assessment.on_watch,
        updated_at: new Date().toISOString(),
      }, { onConflict: "cad_trust_project_id,rating_name,rating_source" });

    if (upsertErr) {
      console.warn(`Upsert failed for project_id ${registryProjectId}: ${upsertErr.message}`);
      continue;
    }
    upserted++;
  }

  console.log(`Done. ${upserted}/${matched} matched project(s) upserted.`);

  if (unmatched.length > 0) {
    console.warn(`${unmatched.length} assessed Sylvera project(s) had no matching cad_trust_projects.project_id — needs manual reconciliation (registry ID format may differ, e.g. missing/extra "VCS" prefix):`);
    for (const u of unmatched) {
      console.warn(`  registry="${u.registryName}" registry_project_id="${u.registryProjectId}" rating="${u.rating}"`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

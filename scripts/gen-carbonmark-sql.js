const https = require("https");

const API_KEY = "cm_api_sandbox_1f2906a9-c799-4908-a434-5ce0b6f3984c";
const BASE = "https://v19.api.carbonmark.com";

function fetch(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    https.get(url, { headers: { Authorization: "Bearer " + API_KEY } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Parse error for " + path));
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

const esc = (s) => (s || "").replace(/'/g, "''");

async function main() {
  console.error("Fetching prices...");
  const prices = await fetch("/prices");
  console.error("Got " + prices.length + " prices");

  const projectKeys = [
    ...new Set(
      prices
        .map(
          (p) =>
            p.listing?.creditId?.projectId ??
            p.klimaprotocol?.creditId?.projectId
        )
        .filter(Boolean)
    ),
  ];
  console.error("Unique projects: " + projectKeys.length);

  const projects = {};
  for (let i = 0; i < projectKeys.length; i += 5) {
    const batch = projectKeys.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map((k) => fetch("/carbonProjects/" + encodeURIComponent(k)))
    );
    for (let j = 0; j < results.length; j++) {
      if (results[j].status === "fulfilled") projects[batch[j]] = results[j].value;
    }
    console.error(
      "Fetched " + Math.min(i + 5, projectKeys.length) + "/" + projectKeys.length + " projects"
    );
  }

  const lines = [];

  // Get or create data source
  lines.push("-- Data source");
  lines.push(
    "INSERT INTO public.data_sources (source_name, source_url, data_type, last_updated, refresh_frequency)",
    "VALUES ('Carbonmark', 'https://carbonmark.com', 'carbon', NOW(), 'daily')",
    "ON CONFLICT (source_name) DO UPDATE SET last_updated = NOW();"
  );
  lines.push("");

  // Assets
  lines.push("-- Assets (" + Object.keys(projects).length + " projects)");
  for (const [key, proj] of Object.entries(projects)) {
    const meta = JSON.stringify({
      projectID: proj.projectID,
      key: proj.key,
      stats: proj.stats,
    }).replace(/'/g, "''");

    lines.push(
      "INSERT INTO public.assets (slug, name, asset_type, registry, country, region, project_category, methodology, is_active, metadata, updated_at)",
      "VALUES (" +
        "'" + esc(key) + "', " +
        "'" + esc(proj.name) + "', " +
        "'carbon_credit', " +
        "'" + esc(proj.registry) + "', " +
        "'" + esc(proj.country) + "', " +
        "'" + esc(proj.region) + "', " +
        "'" + esc(proj.methodologies?.[0]?.category) + "', " +
        "'" + esc(proj.methodologies?.[0]?.id) + "', " +
        (proj.hasSupply ? "true" : "false") + ", " +
        "'" + meta + "'::jsonb, NOW()" +
      ")",
      "ON CONFLICT (slug) DO UPDATE SET " +
        "name = EXCLUDED.name, registry = EXCLUDED.registry, country = EXCLUDED.country, " +
        "region = EXCLUDED.region, project_category = EXCLUDED.project_category, " +
        "methodology = EXCLUDED.methodology, is_active = EXCLUDED.is_active, " +
        "metadata = EXCLUDED.metadata, updated_at = NOW();"
    );
  }
  lines.push("");

  // Price references
  lines.push("-- Price references (" + prices.length + " entries)");
  for (const p of prices) {
    const pid = p.listing?.creditId?.projectId ?? p.klimaprotocol?.creditId?.projectId;
    if (!pid) continue;
    const vintage = p.listing?.creditId?.vintage ?? p.klimaprotocol?.creditId?.vintage ?? null;
    const refType = p.type === "listing" ? "carbonmark_listing" : "carbonmark_pool";
    const raw = JSON.stringify(p).replace(/'/g, "''");

    lines.push(
      "INSERT INTO public.price_references (asset_id, price, price_display, currency, unit, vintage_year, volume, volume_unit, reference_date, reference_type, data_source_id, source_identifier, original_data, fetched_at)",
      "VALUES (" +
        "(SELECT id FROM public.assets WHERE slug = '" + esc(pid) + "'), " +
        p.purchasePrice + ", " +
        "'$" + p.purchasePrice.toFixed(2) + "', " +
        "'USD', " +
        "'tCO2e', " +
        (vintage ?? "NULL") + ", " +
        (p.supply ?? "NULL") + ", " +
        "'tonnes', " +
        "NOW(), " +
        "'" + refType + "', " +
        "(SELECT id FROM public.data_sources WHERE source_name = 'Carbonmark'), " +
        "'" + esc(p.sourceId) + "', " +
        "'" + raw + "'::jsonb, NOW()" +
      ");"
    );
  }

  console.log(lines.join("\n"));
  console.error("Done. Generated " + lines.length + " SQL lines");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

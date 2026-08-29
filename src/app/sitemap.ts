import { MetadataRoute } from "next";
import {
  SITE_URL,
  LOCALE_LANGUAGE_CODES,
  localizedPath,
  routing,
} from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

type RouteEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const publicRoutes: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/certificadoras", changeFrequency: "monthly", priority: 0.9 },
  { path: "/energia", changeFrequency: "weekly", priority: 0.95 },
  { path: "/energia/ranking-brasil", changeFrequency: "weekly", priority: 0.9 },
  { path: "/energia/ranking-mundo", changeFrequency: "weekly", priority: 0.9 },
  { path: "/energia/setores", changeFrequency: "monthly", priority: 0.8 },
  { path: "/energia/precos", changeFrequency: "weekly", priority: 0.85 },
  { path: "/carbono", changeFrequency: "weekly", priority: 0.95 },
  { path: "/carbono/ranking-brasil", changeFrequency: "weekly", priority: 0.9 },
  { path: "/carbono/ranking-mundo", changeFrequency: "weekly", priority: 0.9 },
  { path: "/carbono/setores", changeFrequency: "monthly", priority: 0.8 },
  { path: "/carbono/precos", changeFrequency: "weekly", priority: 0.85 },
  { path: "/carbono/projetos", changeFrequency: "monthly", priority: 0.75 },
  { path: "/carbono/mercados-ao-vivo", changeFrequency: "weekly", priority: 0.85 },
  { path: "/categorias", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contribuir", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacidade", changeFrequency: "yearly", priority: 0.3 },
  { path: "/termos", changeFrequency: "yearly", priority: 0.3 },
];

function languagesFor(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[LOCALE_LANGUAGE_CODES[locale] || locale] =
      `${SITE_URL}${localizedPath(locale, path)}`;
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const pageEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => {
    const url = `${SITE_URL}${localizedPath(routing.defaultLocale, route.path)}`;
    return {
      url,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: languagesFor(route.path),
        xDefault: url,
      },
    };
  });

  let profileEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .neq("role", "banned")
      .not("display_name", "is", null)
      .order("karma", { ascending: false })
      .limit(1000);

    if (data && data.length > 0) {
      profileEntries = data.map((profile) => {
        const path = `/u/${profile.username}`;
        const url = `${SITE_URL}${localizedPath(routing.defaultLocale, path)}`;
        return {
          url,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
          alternates: {
            languages: languagesFor(path),
            xDefault: url,
          },
        };
      });
    }
  } catch {
    // Profiles are optional — keep the sitemap to static routes if DB is unreachable
  }

  return [...pageEntries, ...profileEntries];
}

import { routing } from "@/i18n/routing";

export const SITE_URL = "https://www.sintropia.space";

export const LOCALE_LANGUAGE_CODES: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export const LOCALE_OG_CODES: Record<string, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

/**
 * Builds the localized href for a path, omitting the locale prefix for the
 * default locale (pt) to match next-intl's `as-needed` routing.
 */
export function localizedPath(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return locale === routing.defaultLocale ? normalized : `/${locale}${normalized}`;
}

export interface LocalizedAlternates {
  canonical: string;
  languages: Record<string, string>;
  xDefault: string;
}

/**
 * Returns a localized `alternates` object (canonical + hreflang languages +
 * x-default) for a given route path. The `path` must be locale-agnostic
 * (e.g. "/carbono/ranking-brasil" or "/u/username").
 */
export function getLocalizedAlternates(locale: string, path: string): LocalizedAlternates {
  const canonical = `${SITE_URL}${localizedPath(locale, path)}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[LOCALE_LANGUAGE_CODES[l] || l] = `${SITE_URL}${localizedPath(l, path)}`;
  }
  return {
    canonical,
    languages,
    xDefault: `${SITE_URL}${localizedPath(routing.defaultLocale, path)}`,
  };
}

/**
 * Returns the canonical URL for a route path in a given locale.
 */
export function getCanonicalUrl(locale: string, path: string): string {
  return getLocalizedAlternates(locale, path).canonical;
}

export { routing };

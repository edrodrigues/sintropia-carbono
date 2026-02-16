export type Language = "pt" | "en"

export const languages: Record<Language, string> = {
  pt: "Português",
  en: "English",
}

export const defaultLanguage: Language = "pt"

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return defaultLanguage

  const stored = localStorage.getItem("language") as Language
  if (stored && languages[stored]) {
    return stored
  }

  // Check browser language preference
  const browserLang = navigator.language.split("-")[0] as Language
  return languages[browserLang] ? browserLang : defaultLanguage
}

export function setStoredLanguage(language: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", language)
  }
}

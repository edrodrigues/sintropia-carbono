"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, defaultLanguage, getStoredLanguage, setStoredLanguage } from "@/lib/i18n"
import { translations } from "@/lib/translations"

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isLoaded: boolean // Added loading state
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [isLoaded, setIsLoaded] = useState(false) // Track if context is loaded

  useEffect(() => {
    const storedLanguage = getStoredLanguage()
    setLanguageState(storedLanguage)
    setIsLoaded(true) // Mark as loaded after initialization
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    setStoredLanguage(newLanguage)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== "string") {
      // Fallback to English if translation not found
      value = translations.en
      for (const k of keys) {
        value = value?.[k]
      }
    }

    if (typeof value !== "string") {
      return key // Return key if no translation found
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }

  return <I18nContext.Provider value={{ language, setLanguage, t, isLoaded }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

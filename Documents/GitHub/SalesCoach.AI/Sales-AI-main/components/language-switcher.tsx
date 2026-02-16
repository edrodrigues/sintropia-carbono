"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useI18n } from "@/contexts/i18n-context"
import { languages, type Language } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { language, setLanguage, isLoaded } = useI18n() // Added isLoaded check

  // Show loading state while i18n is initializing
  if (!isLoaded) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" disabled>
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code as Language)}
            className={language === code ? "bg-accent" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

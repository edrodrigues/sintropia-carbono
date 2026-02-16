"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/contexts/i18n-context"
import { languages } from "@/lib/i18n"

export function I18nTest() {
  const { language, t } = useI18n()

  const testKeys = [
    { key: "common.loading", category: "Common" },
    { key: "common.email", category: "Common" },
    { key: "nav.modules", category: "Navigation" },
    { key: "nav.aiPractice", category: "Navigation" },
    { key: "landing.heroTitle", category: "Landing" },
    { key: "landing.feature1Title", category: "Landing" },
    { key: "auth.welcomeBack", category: "Authentication" },
    { key: "auth.signInDescription", category: "Authentication" },
    { key: "dashboard.welcomeMessage", category: "Dashboard", params: { name: "João" } },
    { key: "dashboard.modulesCompleted", category: "Dashboard" },
    { key: "practice.title", category: "Practice" },
    { key: "progress.title", category: "Progress" },
    { key: "resources.title", category: "Resources" },
    { key: "footer.description", category: "Footer" },
  ]

  return (
    <div className="container py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Internationalization Test
            <Badge variant="outline">{languages[language]}</Badge>
          </CardTitle>
          <CardDescription>
            Testing translation keys across different sections of the application. Current language: {language}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testKeys.map(({ key, category, params }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-mono text-sm text-muted-foreground">{key}</div>
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">{t(key, params)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language Switching Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Use the language switcher in the header (globe icon) to change languages</p>
            <p>2. Navigate between different pages to see translations in action</p>
            <p>3. Check that all text content updates when switching languages</p>
            <p>4. Verify that the language preference persists after page refresh</p>
            <p>5. Test both authenticated and unauthenticated views</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

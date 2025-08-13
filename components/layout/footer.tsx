"use client"

import Link from "next/link"
import { Mail, MapPin } from "lucide-react"
import { useI18n } from "@/contexts/i18n-context"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-slate-50 border-t mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sales Training Platform</h3>
            <p className="text-sm text-muted-foreground">{t("footer.description")}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              edmilson.rodrigues@futurereadylabs.com.br
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="font-medium">{t("footer.platform")}</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.trainingModules")}
              </Link>
              <Link href="/practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.aiPracticeSessions")}
              </Link>
              <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.progressTracking")}
              </Link>
              <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.resourceLibrary")}
              </Link>
            </nav>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="font-medium">{t("footer.support")}</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.helpCenter")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.gettingStarted")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.contactSupport")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.systemStatus")}
              </Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-medium">{t("footer.company")}</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.aboutUs")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.privacyPolicy")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.termsOfService")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.cookiePolicy")}
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground">{t("footer.allRightsReserved")}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{t("footer.developedBy")}</span>
              <Link
                href="https://futurereadylabs.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                {t("footer.futureReadyLabs")}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {t("footer.location")}
          </div>
        </div>
      </div>
    </footer>
  )
}

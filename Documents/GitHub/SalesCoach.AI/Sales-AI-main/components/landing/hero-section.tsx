"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Users, TrendingUp, Award } from "lucide-react"
import { useI18n } from "@/contexts/i18n-context" // Added i18n hook

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { t } = useI18n() // Added translation function

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                {t("landing.heroTitle")}
                <span className="text-blue-600 block">{t("landing.heroTitleHighlight")}</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">{t("landing.heroDescription")}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                {t("landing.startTrainingNow")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 px-8 py-3 text-lg bg-transparent"
              >
                <Play className="mr-2 h-5 w-5" />
                {t("landing.watchDemo")}
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-slate-600">{t("landing.statsUsers", { count: "10,000" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-slate-600">{t("landing.statsSuccessRate", { rate: "85" })}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-500 ml-2">{t("landing.aiCoachTitle")}</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      "I'm interested in your product, but I'm not sure if it fits our budget..."
                    </p>
                    <span className="text-xs text-blue-600 mt-2 block">{t("landing.customerPersona")}</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      "I understand budget is a key concern. Let me show you our ROI calculator..."
                    </p>
                    <span className="text-xs text-slate-500 mt-2 block">{t("landing.yourResponse")}</span>
                  </div>

                  <div className="flex items-center gap-2 text-green-600">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("landing.greatHandling")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

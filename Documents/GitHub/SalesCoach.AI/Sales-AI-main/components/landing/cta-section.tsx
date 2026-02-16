"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useI18n } from "@/contexts/i18n-context" // Added i18n hook

interface CTASectionProps {
  onGetStarted: () => void
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const { t } = useI18n() // Added translation function

  const benefits = [
    t("landing.ctaBenefit1"),
    t("landing.ctaBenefit2"),
    t("landing.ctaBenefit3"),
    t("landing.ctaBenefit4"),
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">{t("landing.ctaTitle")}</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">{t("landing.ctaDescription")}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
          >
            {t("common.getStartedFree")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-sm text-blue-200 mt-4">{t("landing.ctaFooter")}</p>
        </div>
      </div>
    </section>
  )
}

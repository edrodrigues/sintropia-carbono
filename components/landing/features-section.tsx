"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Brain, BarChart3, BookOpen, Users, Target } from "lucide-react"
import { useI18n } from "@/contexts/i18n-context" // Added i18n hook

export function FeaturesSection() {
  const { t } = useI18n() // Added translation function

  const features = [
    {
      icon: Mic,
      title: t("landing.feature1Title"),
      description: t("landing.feature1Description"),
    },
    {
      icon: Brain,
      title: t("landing.feature2Title"),
      description: t("landing.feature2Description"),
    },
    {
      icon: BarChart3,
      title: t("landing.feature3Title"),
      description: t("landing.feature3Description"),
    },
    {
      icon: BookOpen,
      title: t("landing.feature4Title"),
      description: t("landing.feature4Description"),
    },
    {
      icon: Users,
      title: t("landing.feature5Title"),
      description: t("landing.feature5Description"),
    },
    {
      icon: Target,
      title: t("landing.feature6Title"),
      description: t("landing.feature6Description"),
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t("landing.featuresTitle")}</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">{t("landing.featuresDescription")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {
  const { user, loading } = useAuth()
  const { t, isLoaded } = useI18n()
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        setShowLanding(true)
      }
    }
  }, [user, loading, router])

  const handleGetStarted = () => {
    router.push("/auth")
  }

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{isLoaded ? t("common.loading") : "Loading..."}</p>
        </div>
      </div>
    )
  }

  if (!showLanding) {
    return null // Will redirect if user is logged in
  }

  return (
    <div className="min-h-screen">
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
      <CTASection onGetStarted={handleGetStarted} />
    </div>
  )
}

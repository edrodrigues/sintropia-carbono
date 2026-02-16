"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context" // Added i18n hook

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "trainee" | "trainer" | "admin"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const { t } = useI18n() // Added translation function
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth")
        return
      }

      if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
        router.push("/dashboard") // Redirect to dashboard if insufficient permissions
        return
      }
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">{t("errors.accessDenied")}</h1>
          <p className="text-muted-foreground mt-2">{t("errors.noPermission")}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

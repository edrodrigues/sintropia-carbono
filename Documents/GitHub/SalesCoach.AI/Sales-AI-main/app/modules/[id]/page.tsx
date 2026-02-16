"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ModuleContentView } from "@/components/modules/module-content"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, BookOpen, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LocalStorageService } from "@/lib/storage"
import { mockTrainingModules } from "@/lib/mock-data"
import type { TrainingModule, UserProgress } from "@/lib/types"
import Link from "next/link"

export default function ModulePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id || !user) return

    const modules = LocalStorageService.get("training-modules", mockTrainingModules)
    const foundModule = modules.find((m: TrainingModule) => m.id === params.id)

    if (!foundModule) {
      router.push("/dashboard")
      return
    }

    const allProgress = LocalStorageService.get(`user-progress-${user.id}`, [])
    const moduleProgress = allProgress.find((p: UserProgress) => p.moduleId === params.id)

    setModule(foundModule)
    setUserProgress(moduleProgress || null)
    setLoading(false)

    // Create initial progress if none exists
    if (!moduleProgress) {
      const newProgress: UserProgress = {
        id: `progress-${Date.now()}`,
        userId: user.id,
        moduleId: foundModule.id,
        status: "in-progress",
        completionPercentage: 0,
        timeSpent: 0,
        lastAccessed: new Date(),
        startedAt: new Date(),
      }

      const updatedProgress = [...allProgress, newProgress]
      LocalStorageService.set(`user-progress-${user.id}`, updatedProgress)
      setUserProgress(newProgress)
    } else {
      // Update last accessed time
      const updatedProgress = allProgress.map((p: UserProgress) =>
        p.moduleId === params.id ? { ...p, lastAccessed: new Date() } : p,
      )
      LocalStorageService.set(`user-progress-${user.id}`, updatedProgress)
    }
  }, [params.id, user, router])

  const handleModuleComplete = () => {
    if (!user || !module || !userProgress) return

    const allProgress = LocalStorageService.get(`user-progress-${user.id}`, [])
    const updatedProgress = allProgress.map((p: UserProgress) =>
      p.moduleId === module.id
        ? {
            ...p,
            status: "completed" as const,
            completionPercentage: 100,
            completedAt: new Date(),
          }
        : p,
    )

    LocalStorageService.set(`user-progress-${user.id}`, updatedProgress)

    // Redirect to dashboard with success message
    router.push("/dashboard?completed=" + module.id)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <div className="container py-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading module...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!module) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <div className="container py-8">
            <Card className="text-center py-12">
              <CardContent>
                <h1 className="text-2xl font-bold mb-2">Module Not Found</h1>
                <p className="text-muted-foreground mb-4">The requested training module could not be found.</p>
                <Link href="/dashboard">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container py-8 space-y-6">
          {/* Back Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Module Info Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                    <Badge variant="outline">{module.category.replace("-", " ")}</Badge>
                    {userProgress?.status === "completed" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{module.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {module.estimatedDuration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {module.content.length} sections
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Content */}
          <ModuleContentView module={module} onComplete={handleModuleComplete} />
        </main>
      </div>
    </ProtectedRoute>
  )
}

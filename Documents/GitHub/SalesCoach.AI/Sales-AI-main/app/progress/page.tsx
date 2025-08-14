"use client"

import { useState, useEffect } from "react"
import { ProgressOverview } from "@/components/progress/progress-overview"
import { SkillsBreakdown } from "@/components/progress/skills-breakdown"
import { LearningStreak } from "@/components/progress/learning-streak"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Target, Flame, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context" // Added i18n hook
import { LocalStorageService } from "@/lib/storage"
import { mockTrainingModules } from "@/lib/mock-data"
import type { TrainingModule, UserProgress, Conversation, UserAnalytics } from "@/lib/types"

export default function ProgressPage() {
  const { user } = useAuth()
  const { t } = useI18n() // Added translation function
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    userId: "",
    totalTimeSpent: 0,
    modulesCompleted: 0,
    averageScore: 0,
    conversationsCompleted: 0,
    skillsProgress: {},
    lastActivity: new Date(),
    streak: 0,
  })

  useEffect(() => {
    if (!user) return

    // Load data
    const loadedModules = LocalStorageService.get("training-modules", mockTrainingModules)
    const loadedProgress = LocalStorageService.get(`user-progress-${user.id}`, [])
    const loadedConversations = LocalStorageService.get(`conversations-${user.id}`, [])

    setModules(loadedModules)
    setUserProgress(loadedProgress)
    setConversations(loadedConversations)

    // Calculate analytics
    const completedModules = loadedProgress.filter((p: UserProgress) => p.status === "completed")
    const totalTimeSpent = loadedProgress.reduce((sum: number, p: UserProgress) => sum + p.timeSpent, 0)
    const averageScore =
      completedModules.length > 0
        ? completedModules.reduce((sum: number, p: UserProgress) => sum + (p.score || 0), 0) / completedModules.length
        : 0

    const skillsProgress = loadedModules.reduce((acc: Record<string, number>, module: TrainingModule) => {
      const progress = loadedProgress.find((p: UserProgress) => p.moduleId === module.id)
      if (!acc[module.category]) acc[module.category] = 0
      if (progress?.status === "completed") acc[module.category]++
      return acc
    }, {})

    const lastActivity =
      loadedProgress.length > 0 || loadedConversations.length > 0
        ? new Date(
            Math.max(
              ...loadedProgress.map((p: UserProgress) => new Date(p.lastAccessed).getTime()),
              ...loadedConversations.map((c: Conversation) => new Date(c.createdAt).getTime()),
            ),
          )
        : new Date()

    setAnalytics({
      userId: user.id,
      totalTimeSpent,
      modulesCompleted: completedModules.length,
      averageScore,
      conversationsCompleted: loadedConversations.length,
      skillsProgress,
      lastActivity,
      streak: 0, // Will be calculated in LearningStreak component
    })
  }, [user])

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("progress.title")}</h1>
          <p className="text-muted-foreground">{t("progress.description")}</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("progress.overallProgress")}
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProgressOverview
              userProgress={userProgress}
              modules={modules}
              conversations={conversations}
              analytics={analytics}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillsBreakdown userProgress={userProgress} modules={modules} conversations={conversations} />
          </TabsContent>

          <TabsContent value="streak" className="space-y-6">
            <LearningStreak userProgress={userProgress} conversations={conversations} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Insights
                </CardTitle>
                <CardDescription>Personalized recommendations based on your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.modulesCompleted === 0 ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">Get Started</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Begin with the "Product Knowledge Fundamentals" module to build a strong foundation.
                      </p>
                    </div>
                  ) : analytics.modulesCompleted < 3 ? (
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h3 className="font-medium text-green-900 dark:text-green-100">Keep Building</h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        You're making great progress! Try the "Consultative Selling Techniques" module next.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <h3 className="font-medium text-purple-900 dark:text-purple-100">Advanced Skills</h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        You're ready for advanced topics! Consider practicing objection handling scenarios.
                      </p>
                    </div>
                  )}

                  {conversations.length === 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <h3 className="font-medium text-orange-900 dark:text-orange-100">Practice Recommendation</h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Try an AI practice session to apply what you've learned in realistic scenarios.
                      </p>
                    </div>
                  )}

                  {analytics.totalTimeSpent > 0 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Time Investment</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        You've invested {Math.round(analytics.totalTimeSpent / 60)} hours in learning. Consistent daily
                        practice will accelerate your progress.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

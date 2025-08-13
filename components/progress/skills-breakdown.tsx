"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, BarChart3 } from "lucide-react"
import type { UserProgress, TrainingModule, Conversation } from "@/lib/types"

interface SkillsBreakdownProps {
  userProgress: UserProgress[]
  modules: TrainingModule[]
  conversations: Conversation[]
}

export function SkillsBreakdown({ userProgress, modules, conversations }: SkillsBreakdownProps) {
  // Calculate skills progress by category
  const skillCategories = [
    { id: "product-knowledge", name: "Product Knowledge", icon: Target },
    { id: "sales-techniques", name: "Sales Techniques", icon: TrendingUp },
    { id: "customer-engagement", name: "Customer Engagement", icon: BarChart3 },
    { id: "objection-handling", name: "Objection Handling", icon: Target },
  ]

  const getSkillProgress = (categoryId: string) => {
    const categoryModules = modules.filter((m) => m.category === categoryId)
    const completedInCategory = userProgress.filter(
      (p) => p.status === "completed" && categoryModules.some((m) => m.id === p.moduleId),
    )

    const totalModules = categoryModules.length
    const completedModules = completedInCategory.length
    const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

    const totalTimeSpent = userProgress
      .filter((p) => categoryModules.some((m) => m.id === p.moduleId))
      .reduce((sum, p) => sum + p.timeSpent, 0)

    const averageScore =
      completedInCategory.length > 0
        ? completedInCategory.reduce((sum, p) => sum + (p.score || 0), 0) / completedInCategory.length
        : 0

    return {
      totalModules,
      completedModules,
      progressPercentage,
      timeSpent: totalTimeSpent,
      averageScore,
    }
  }

  const getSkillLevel = (percentage: number) => {
    if (percentage === 0) return { level: "Not Started", color: "bg-gray-100 text-gray-800" }
    if (percentage < 25) return { level: "Beginner", color: "bg-red-100 text-red-800" }
    if (percentage < 50) return { level: "Developing", color: "bg-yellow-100 text-yellow-800" }
    if (percentage < 75) return { level: "Proficient", color: "bg-blue-100 text-blue-800" }
    if (percentage < 100) return { level: "Advanced", color: "bg-green-100 text-green-800" }
    return { level: "Expert", color: "bg-purple-100 text-purple-800" }
  }

  // Practice session insights
  const practiceInsights = conversations.reduce(
    (acc, conv) => {
      const scenario = conv.scenario.toLowerCase()
      if (scenario.includes("objection")) {
        acc.objectionHandling++
      } else if (scenario.includes("discovery") || scenario.includes("prospect")) {
        acc.customerEngagement++
      } else {
        acc.salesTechniques++
      }
      return acc
    },
    { objectionHandling: 0, customerEngagement: 0, salesTechniques: 0 },
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Skills Breakdown
          </CardTitle>
          <CardDescription>Your progress across different sales skill areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillCategories.map((category) => {
              const progress = getSkillProgress(category.id)
              const skillLevel = getSkillLevel(progress.progressPercentage)
              const Icon = category.icon

              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <Badge className={skillLevel.color}>{skillLevel.level}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(progress.progressPercentage)}%</span>
                    </div>
                    <Progress value={progress.progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium text-foreground">{progress.completedModules}</div>
                      <div>Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">{Math.round(progress.timeSpent / 60)}h</div>
                      <div>Time Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">
                        {progress.averageScore > 0 ? Math.round(progress.averageScore) + "%" : "N/A"}
                      </div>
                      <div>Avg Score</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Practice Session Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Practice Session Insights
          </CardTitle>
          <CardDescription>Your AI practice session activity by skill area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">{practiceInsights.customerEngagement}</div>
              <p className="text-sm text-muted-foreground">Customer Engagement Sessions</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">{practiceInsights.salesTechniques}</div>
              <p className="text-sm text-muted-foreground">Sales Technique Sessions</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-600">{practiceInsights.objectionHandling}</div>
              <p className="text-sm text-muted-foreground">Objection Handling Sessions</p>
            </div>
          </div>

          {conversations.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No practice sessions yet</p>
              <p className="text-xs text-muted-foreground">Start an AI practice session to see insights here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

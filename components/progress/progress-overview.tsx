"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, BookOpen, MessageSquare, Award, Calendar } from "lucide-react"
import type { UserProgress, UserAnalytics, TrainingModule, Conversation } from "@/lib/types"

interface ProgressOverviewProps {
  userProgress: UserProgress[]
  modules: TrainingModule[]
  conversations: Conversation[]
  analytics: UserAnalytics
}

export function ProgressOverview({ userProgress, modules, conversations, analytics }: ProgressOverviewProps) {
  const completedModules = userProgress.filter((p) => p.status === "completed")
  const inProgressModules = userProgress.filter((p) => p.status === "in-progress")
  const completionRate = modules.length > 0 ? (completedModules.length / modules.length) * 100 : 0

  const getSkillLevel = (completedCount: number) => {
    if (completedCount === 0) return { level: "Beginner", color: "bg-gray-100 text-gray-800" }
    if (completedCount < 3) return { level: "Developing", color: "bg-blue-100 text-blue-800" }
    if (completedCount < 6) return { level: "Proficient", color: "bg-green-100 text-green-800" }
    return { level: "Expert", color: "bg-purple-100 text-purple-800" }
  }

  const skillLevel = getSkillLevel(completedModules.length)

  const recentActivity = [
    ...completedModules.slice(-3).map((p) => ({
      type: "module",
      title: modules.find((m) => m.id === p.moduleId)?.title || "Unknown Module",
      date: p.completedAt || p.lastAccessed,
      icon: BookOpen,
    })),
    ...conversations.slice(-2).map((c) => ({
      type: "practice",
      title: `AI Practice: ${c.scenario}`,
      date: c.completedAt || c.createdAt,
      icon: MessageSquare,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <p className="text-xs text-muted-foreground">
              {completedModules.length} of {modules.length} modules completed
            </p>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.totalTimeSpent / 60)}h</div>
            <p className="text-xs text-muted-foreground">{analytics.totalTimeSpent} minutes total</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Avg: {Math.round(analytics.totalTimeSpent / Math.max(completedModules.length, 1))} min/module
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillLevel.level}</div>
            <Badge className={`mt-2 ${skillLevel.color}`}>{skillLevel.level}</Badge>
            <p className="text-xs text-muted-foreground mt-1">Based on completed modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground">AI conversations completed</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Avg score: {analytics.averageScore ? Math.round(analytics.averageScore) : "N/A"}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Module Progress
            </CardTitle>
            <CardDescription>Your progress through training modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules.slice(0, 5).map((module) => {
              const progress = userProgress.find((p) => p.moduleId === module.id)
              const progressPercentage = progress?.completionPercentage || 0
              const status = progress?.status || "not-started"

              return (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{module.title}</p>
                      <p className="text-xs text-muted-foreground">{module.category.replace("-", " ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          status === "completed" ? "default" : status === "in-progress" ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        {status === "not-started"
                          ? "Not Started"
                          : status === "in-progress"
                            ? "In Progress"
                            : "Complete"}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={progressPercentage} className="h-1" />
                </div>
              )
            })}

            {modules.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{modules.length - 5} more modules available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()} at{" "}
                          {new Date(activity.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground">Start a module or practice session to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

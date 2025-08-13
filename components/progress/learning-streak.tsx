"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flame, Trophy } from "lucide-react"
import type { UserProgress, Conversation } from "@/lib/types"

interface LearningStreakProps {
  userProgress: UserProgress[]
  conversations: Conversation[]
}

export function LearningStreak({ userProgress, conversations }: LearningStreakProps) {
  // Calculate learning streak
  const calculateStreak = () => {
    const allActivities = [
      ...userProgress.map((p) => ({ date: p.lastAccessed, type: "module" })),
      ...conversations.map((c) => ({ date: c.createdAt, type: "practice" })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (allActivities.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if there's activity today or yesterday
    const latestActivity = new Date(allActivities[0].date)
    latestActivity.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - latestActivity.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 1) return 0 // Streak broken

    // Count consecutive days with activity
    const activityDates = new Set(
      allActivities.map((a) => {
        const date = new Date(a.date)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      }),
    )

    const currentDate = new Date(today)
    if (daysDiff === 1) currentDate.setDate(currentDate.getDate() - 1) // Start from yesterday if no activity today

    while (activityDates.has(currentDate.getTime())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  const currentStreak = calculateStreak()

  // Calculate weekly activity
  const getWeeklyActivity = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyModules = userProgress.filter((p) => new Date(p.lastAccessed) >= oneWeekAgo).length
    const weeklyPractice = conversations.filter((c) => new Date(c.createdAt) >= oneWeekAgo).length

    return { modules: weeklyModules, practice: weeklyPractice, total: weeklyModules + weeklyPractice }
  }

  const weeklyActivity = getWeeklyActivity()

  // Get achievements
  const getAchievements = () => {
    const achievements = []
    const completedModules = userProgress.filter((p) => p.status === "completed").length

    if (completedModules >= 1) achievements.push({ name: "First Steps", description: "Completed your first module" })
    if (completedModules >= 3) achievements.push({ name: "Getting Started", description: "Completed 3 modules" })
    if (completedModules >= 5) achievements.push({ name: "Dedicated Learner", description: "Completed 5 modules" })
    if (conversations.length >= 1)
      achievements.push({ name: "Practice Makes Perfect", description: "Completed first AI practice session" })
    if (conversations.length >= 5)
      achievements.push({ name: "Conversation Master", description: "Completed 5 practice sessions" })
    if (currentStreak >= 3) achievements.push({ name: "Consistent Learner", description: "3-day learning streak" })
    if (currentStreak >= 7) achievements.push({ name: "Week Warrior", description: "7-day learning streak" })

    return achievements
  }

  const achievements = getAchievements()

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your learning streak today!"
    if (streak === 1) return "Great start! Keep it going tomorrow."
    if (streak < 7) return `${streak} days strong! You're building a great habit.`
    if (streak < 30) return `Amazing ${streak}-day streak! You're on fire!`
    return `Incredible ${streak}-day streak! You're a learning champion!`
  }

  return (
    <div className="space-y-6">
      {/* Learning Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Learning Streak
          </CardTitle>
          <CardDescription>Keep up your daily learning momentum</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">{currentStreak}</div>
              <p className="text-lg font-medium">{currentStreak === 1 ? "Day" : "Days"} in a row</p>
              <p className="text-sm text-muted-foreground">{getStreakMessage(currentStreak)}</p>
            </div>

            {currentStreak > 0 && (
              <div className="flex justify-center">
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                  <Flame className="h-3 w-3 mr-1" />
                  On Fire!
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Activity
          </CardTitle>
          <CardDescription>Your learning activity over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">{weeklyActivity.modules}</div>
              <p className="text-sm text-muted-foreground">Modules Studied</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{weeklyActivity.practice}</div>
              <p className="text-sm text-muted-foreground">Practice Sessions</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">{weeklyActivity.total}</div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Milestones you've unlocked on your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No achievements yet</p>
              <p className="text-xs text-muted-foreground">
                Complete modules and practice sessions to unlock achievements
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

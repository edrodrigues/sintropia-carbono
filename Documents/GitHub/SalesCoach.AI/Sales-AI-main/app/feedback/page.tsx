"use client"

import { useState, useEffect } from "react"
import { FeedbackHistory } from "@/components/feedback/feedback-history"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, TrendingUp, Target, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LocalStorageService } from "@/lib/storage"
import type { Conversation, ConversationFeedback } from "@/lib/types"

export default function FeedbackPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [feedbacks, setFeedbacks] = useState<ConversationFeedback[]>([])

  useEffect(() => {
    if (!user) return

    const loadedConversations = LocalStorageService.get(`conversations-${user.id}`, [])
    const loadedFeedbacks = LocalStorageService.get(`feedbacks-${user.id}`, [])

    setConversations(loadedConversations)
    setFeedbacks(loadedFeedbacks)
  }, [user])

  // Calculate skill trends
  const getSkillTrends = () => {
    if (feedbacks.length < 2) return {}

    const skillTrends: Record<string, { current: number; previous: number; trend: number }> = {}

    const recentFeedbacks = feedbacks.slice(-3) // Last 3 sessions
    const earlierFeedbacks = feedbacks.slice(0, -3) // Earlier sessions

    const getAverageSkillScore = (feedbackList: ConversationFeedback[], skillName: string) => {
      const skillScores = feedbackList
        .flatMap((f) => f.skillsAssessed)
        .filter((s) => s.skill === skillName)
        .map((s) => s.score)

      return skillScores.length > 0 ? skillScores.reduce((sum, score) => sum + score, 0) / skillScores.length : 0
    }

    // Get all unique skills
    const allSkills = [...new Set(feedbacks.flatMap((f) => f.skillsAssessed.map((s) => s.skill)))]

    allSkills.forEach((skill) => {
      const currentAvg = getAverageSkillScore(recentFeedbacks, skill)
      const previousAvg = earlierFeedbacks.length > 0 ? getAverageSkillScore(earlierFeedbacks, skill) : currentAvg

      skillTrends[skill] = {
        current: Math.round(currentAvg),
        previous: Math.round(previousAvg),
        trend: Math.round(currentAvg - previousAvg),
      }
    })

    return skillTrends
  }

  const skillTrends = getSkillTrends()

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Feedback & Analysis</h1>
          <p className="text-muted-foreground">
            Review your practice session feedback and track your improvement over time.
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            <FeedbackHistory conversations={conversations} feedbacks={feedbacks} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Skill Development Trends
                </CardTitle>
                <CardDescription>Track how your skills have improved over recent practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(skillTrends).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(skillTrends).map(([skill, data]) => (
                      <div key={skill} className="p-4 border rounded-lg space-y-2">
                        <h3 className="font-medium">{skill}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current Average</span>
                          <span className="font-bold">{data.current}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Trend</span>
                          <span className={`font-bold ${data.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {data.trend >= 0 ? "+" : ""}
                            {data.trend}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Not Enough Data</h3>
                    <p className="text-muted-foreground">
                      Complete more practice sessions to see skill development trends.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Personalized Insights
                </CardTitle>
                <CardDescription>AI-powered recommendations based on your feedback history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
                      <p className="text-muted-foreground">
                        Complete AI practice sessions to receive personalized insights and recommendations.
                      </p>
                    </div>
                  ) : (
                    <>
                      {feedbacks.length >= 3 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <h3 className="font-medium text-blue-900 dark:text-blue-100">Consistency Insight</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            You've completed {feedbacks.length} practice sessions. Regular practice is key to
                            improvement!
                          </p>
                        </div>
                      )}

                      {Object.entries(skillTrends).some(([_, data]) => data.trend > 10) && (
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <h3 className="font-medium text-green-900 dark:text-green-100">Strong Improvement</h3>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Great progress! You've shown significant improvement in several skill areas.
                          </p>
                        </div>
                      )}

                      {feedbacks.some((f) => f.overallScore < 60) && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <h3 className="font-medium text-orange-900 dark:text-orange-100">Focus Area</h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Consider reviewing training modules for skills where you scored below 60%.
                          </p>
                        </div>
                      )}

                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <h3 className="font-medium text-purple-900 dark:text-purple-100">Next Steps</h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Try practicing different scenario types to develop a well-rounded skill set.
                        </p>
                      </div>
                    </>
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

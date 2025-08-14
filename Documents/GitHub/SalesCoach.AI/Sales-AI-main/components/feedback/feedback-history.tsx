"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp, MessageSquare, Calendar, TrendingUp, Award } from "lucide-react"
import type { Conversation, ConversationFeedback } from "@/lib/types"

interface FeedbackHistoryProps {
  conversations: Conversation[]
  feedbacks: ConversationFeedback[]
}

export function FeedbackHistory({ conversations, feedbacks }: FeedbackHistoryProps) {
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Fair"
    if (score >= 60) return "Needs Improvement"
    return "Poor"
  }

  const sortedFeedbacks = feedbacks
    .map((feedback) => ({
      feedback,
      conversation: conversations.find((c) => c.id === feedback.conversationId),
    }))
    .filter((item) => item.conversation)
    .sort((a, b) => new Date(b.feedback.createdAt).getTime() - new Date(a.feedback.createdAt).getTime())

  const averageScore =
    feedbacks.length > 0 ? Math.round(feedbacks.reduce((sum, f) => sum + f.overallScore, 0) / feedbacks.length) : 0

  const improvementTrend =
    feedbacks.length >= 2 ? feedbacks[feedbacks.length - 1].overallScore - feedbacks[0].overallScore : 0

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>No Feedback Yet</CardTitle>
          <CardDescription>
            Complete AI practice sessions to receive detailed feedback and track your improvement.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</div>
            <p className="text-xs text-muted-foreground">{getScoreLabel(averageScore)} overall</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbacks.length}</div>
            <p className="text-xs text-muted-foreground">Practice sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${improvementTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {improvementTrend >= 0 ? "+" : ""}
              {improvementTrend}%
            </div>
            <p className="text-xs text-muted-foreground">Since first session</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Feedback History
          </CardTitle>
          <CardDescription>Review your past practice session feedback and track improvement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedFeedbacks.map(({ feedback, conversation }) => (
            <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{conversation!.scenario}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(feedback.createdAt).toLocaleDateString()} at{" "}
                    {new Date(feedback.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                      {feedback.overallScore}%
                    </div>
                    <Badge variant={feedback.overallScore >= 70 ? "default" : "secondary"}>
                      {getScoreLabel(feedback.overallScore)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedFeedback(expandedFeedback === feedback.id ? null : feedback.id)}
                  >
                    {expandedFeedback === feedback.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedFeedback === feedback.id && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Skills Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Skills Assessment</h4>
                    {feedback.skillsAssessed.map((skill, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{skill.skill}</span>
                          <span className={`font-medium ${getScoreColor(skill.score)}`}>{skill.score}%</span>
                        </div>
                        <Progress value={skill.score} className="h-1" />
                      </div>
                    ))}
                  </div>

                  {/* Key Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1">
                        {feedback.strengths.slice(0, 3).map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2">Improvements</h4>
                      <ul className="text-sm space-y-1">
                        {feedback.improvements.slice(0, 3).map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-600">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

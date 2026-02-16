"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, TrendingUp, MessageSquare, Clock, Target } from "lucide-react"
import type { Conversation, ConversationFeedback as Feedback } from "@/lib/types"

interface Props {
  conversation: Conversation
  feedback: Feedback
  onClose?: () => void
}

export function ConversationFeedbackComponent({ conversation, feedback, onClose }: Props) {
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

  const userMessages = conversation.messages.filter((m) => m.role === "user")
  const conversationDuration = conversation.completedAt
    ? Math.round((conversation.completedAt.getTime() - conversation.createdAt.getTime()) / 60000)
    : 0

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center mb-4">
            <span className={`text-3xl font-bold ${getScoreColor(feedback.overallScore)}`}>
              {feedback.overallScore}
            </span>
          </div>
          <CardTitle className="text-2xl">{getScoreLabel(feedback.overallScore)} Performance!</CardTitle>
          <CardDescription>Your overall score for the "{conversation.scenario}" practice session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{userMessages.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Your Messages</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{conversationDuration}</span>
              </div>
              <p className="text-sm text-muted-foreground">Minutes</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{feedback.skillsAssessed.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Skills Assessed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skills Assessment
          </CardTitle>
          <CardDescription>Detailed breakdown of your performance by skill area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.skillsAssessed.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{skill.skill}</h3>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(skill.score)}`}>{skill.score}%</span>
                  <Badge variant={skill.score >= 70 ? "default" : "secondary"}>
                    {skill.score >= 70 ? "Strong" : "Needs Work"}
                  </Badge>
                </div>
              </div>
              <Progress value={skill.score} className="h-2" />
              <p className="text-sm text-muted-foreground">{skill.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths and Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
            <CardDescription>What you did well in this conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>Focus areas for your next practice session</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Comprehensive feedback on your conversation performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">{feedback.detailedFeedback}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {onClose && (
        <div className="flex justify-center gap-4">
          <Button onClick={onClose} className="px-8">
            Continue Learning
          </Button>
        </div>
      )}
    </div>
  )
}

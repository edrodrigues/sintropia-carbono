"use client"

import { useState, useEffect } from "react"
import { ScenarioSelector } from "@/components/ai-agent/scenario-selector"
import { ConversationInterface } from "@/components/ai-agent/conversation-interface"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, MessageSquare, Headphones, Mic, Volume2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context" // Added i18n hook
import { LocalStorageService } from "@/lib/storage"
import { mockSalesScenarios } from "@/lib/mock-data"
import type { SalesScenario, Conversation } from "@/lib/types"

export default function PracticePage() {
  const { user } = useAuth()
  const { t } = useI18n() // Added translation function
  const [scenarios, setScenarios] = useState<SalesScenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<SalesScenario | null>(null)
  const [conversationComplete, setConversationComplete] = useState(false)
  const [completedConversation, setCompletedConversation] = useState<Conversation | null>(null)

  useEffect(() => {
    // Load scenarios
    const loadedScenarios = LocalStorageService.get("sales-scenarios", mockSalesScenarios)
    setScenarios(loadedScenarios)

    // Initialize scenarios in storage if not present
    if (LocalStorageService.get("sales-scenarios", []).length === 0) {
      LocalStorageService.set("sales-scenarios", mockSalesScenarios)
    }
  }, [])

  const handleScenarioSelect = (scenario: SalesScenario) => {
    setSelectedScenario(scenario)
    setConversationComplete(false)
    setCompletedConversation(null)
  }

  const handleConversationEnd = (conversation: Conversation) => {
    // Save conversation to storage
    const existingConversations = LocalStorageService.get(`conversations-${user?.id}`, [])
    const updatedConversations = [...existingConversations, conversation]
    LocalStorageService.set(`conversations-${user?.id}`, updatedConversations)

    setCompletedConversation(conversation)
    setConversationComplete(true)
  }

  const handleBackToScenarios = () => {
    setSelectedScenario(null)
    setConversationComplete(false)
    setCompletedConversation(null)
  }

  if (conversationComplete && completedConversation) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <Card className="max-w-3xl mx-auto border-2 border-green-200 dark:border-green-800">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold">{t("practice.sessionComplete")}</CardTitle>
              <p className="text-lg text-muted-foreground mt-2">Audio conversation practice completed!</p>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="text-center space-y-2">
                <p className="text-lg text-muted-foreground">{t("practice.scenarioCompleted")}</p>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-3 bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Mic className="h-6 w-6 text-blue-600" />
                    <span className="text-3xl font-bold text-blue-600">
                      {completedConversation.messages.filter((m) => m.role === "user").length}
                    </span>
                  </div>
                  <p className="text-sm font-medium">Voice Responses</p>
                </div>
                <div className="space-y-3 bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-6 w-6 text-purple-600" />
                    <span className="text-3xl font-bold text-purple-600">
                      {Math.round(
                        (completedConversation.completedAt!.getTime() - completedConversation.createdAt.getTime()) /
                          60000,
                      )}
                    </span>
                  </div>
                  <p className="text-sm font-medium">Minutes Practiced</p>
                </div>
                <div className="space-y-3 bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Volume2 className="h-6 w-6 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">
                      {completedConversation.messages.filter((m) => m.role === "ai").length}
                    </span>
                  </div>
                  <p className="text-sm font-medium">AI Responses</p>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  What's Next?
                </h3>
                <ul className="space-y-3 text-base">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">•</span>
                    <span>{t("practice.reviewConversation")} - Listen to your performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">•</span>
                    <span>{t("practice.tryAnotherScenario")} - Practice different scenarios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">•</span>
                    <span>{t("practice.checkProgressDashboard")} - View your audio training progress</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBackToScenarios} className="flex-1 h-12 text-lg" size="lg">
                  <Headphones className="h-5 w-5 mr-2" />
                  {t("practice.practiceAgain")}
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="flex-1 h-12 text-lg" size="lg">
                  {t("practice.backToDashboard")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (selectedScenario) {
    return (
      <ProtectedRoute>
        <div className="container py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToScenarios}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("practice.backToScenarios")}
            </Button>
          </div>

          <ConversationInterface scenario={selectedScenario} onConversationEnd={handleConversationEnd} />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <ScenarioSelector scenarios={scenarios} onSelectScenario={handleScenarioSelect} />
      </div>
    </ProtectedRoute>
  )
}

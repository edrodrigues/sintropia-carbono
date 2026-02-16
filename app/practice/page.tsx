"use client"

import { useState, useEffect } from "react"
import { ScenarioSelector } from "@/components/ai-agent/scenario-selector"
import { ConversationInterface } from "@/components/ai-agent/conversation-interface"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, MessageSquare } from "lucide-react"
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{t("practice.sessionComplete")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">{t("practice.scenarioCompleted")}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {completedConversation.messages.filter((m) => m.role === "user").length}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Your Messages</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {Math.round(
                        (completedConversation.completedAt!.getTime() - completedConversation.createdAt.getTime()) /
                          60000,
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">What's Next?</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{t("practice.reviewConversation")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{t("practice.tryAnotherScenario")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{t("practice.checkProgressDashboard")}</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBackToScenarios} className="flex-1">
                  {t("practice.practiceAgain")}
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="flex-1">
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

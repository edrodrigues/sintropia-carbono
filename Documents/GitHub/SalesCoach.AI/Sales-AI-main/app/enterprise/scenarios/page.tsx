"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context"
import { LocalStorageService } from "@/lib/storage"
import { Bot, Plus, Trash2, Edit, Play, Users, Target, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

interface AIScenario {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  customerPersona: {
    name: string
    role: string
    company: string
    personality: string
    painPoints: string[]
    budget: string
    decisionMaker: boolean
  }
  objectives: string[]
  conversationFlow: {
    greeting: string[]
    questions: string[]
    objections: string[]
    hesitations: string[]
    closingSignals: string[]
  }
  aiInstructions: string
  assignedTo: string[]
  createdBy: string
  createdAt: Date
  status: "active" | "draft" | "archived"
  usageCount: number
  averageScore: number
}

const scenarioCategories = [
  "Cold Calling",
  "Product Demo",
  "Objection Handling",
  "Closing Techniques",
  "Discovery Calls",
  "Follow-up Meetings",
  "Negotiation",
  "Customer Retention",
  "Upselling",
  "Cross-selling",
]

const difficultyLevels = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
]

export default function ScenariosPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()
  const [scenarios, setScenarios] = useState<AIScenario[]>([])
  const [invitedTrainees, setInvitedTrainees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingScenario, setEditingScenario] = useState<AIScenario | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerRole, setCustomerRole] = useState("")
  const [customerCompany, setCustomerCompany] = useState("")
  const [customerPersonality, setCustomerPersonality] = useState("")
  const [painPoints, setPainPoints] = useState("")
  const [budget, setBudget] = useState("")
  const [isDecisionMaker, setIsDecisionMaker] = useState(true)
  const [objectives, setObjectives] = useState("")
  const [greetings, setGreetings] = useState("")
  const [questions, setQuestions] = useState("")
  const [objections, setObjections] = useState("")
  const [hesitations, setHesitations] = useState("")
  const [closingSignals, setClosingSignals] = useState("")
  const [aiInstructions, setAiInstructions] = useState("")
  const [assignedTo, setAssignedTo] = useState<string[]>([])

  useEffect(() => {
    // Redirect if not enterprise user
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    // Load scenarios and trainees
    const loadedScenarios = LocalStorageService.get("custom-scenarios", [])
    const loadedTrainees = LocalStorageService.get("invited-trainees", [])
    setScenarios(loadedScenarios)
    setInvitedTrainees(loadedTrainees)
  }, [user, router])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDifficulty("")
    setCategory("")
    setCustomerName("")
    setCustomerRole("")
    setCustomerCompany("")
    setCustomerPersonality("")
    setPainPoints("")
    setBudget("")
    setIsDecisionMaker(true)
    setObjectives("")
    setGreetings("")
    setQuestions("")
    setObjections("")
    setHesitations("")
    setClosingSignals("")
    setAiInstructions("")
    setAssignedTo([])
    setEditingScenario(null)
  }

  const loadScenarioForEdit = (scenario: AIScenario) => {
    setTitle(scenario.title)
    setDescription(scenario.description)
    setDifficulty(scenario.difficulty)
    setCategory(scenario.category)
    setCustomerName(scenario.customerPersona.name)
    setCustomerRole(scenario.customerPersona.role)
    setCustomerCompany(scenario.customerPersona.company)
    setCustomerPersonality(scenario.customerPersona.personality)
    setPainPoints(scenario.customerPersona.painPoints.join(", "))
    setBudget(scenario.customerPersona.budget)
    setIsDecisionMaker(scenario.customerPersona.decisionMaker)
    setObjectives(scenario.objectives.join(", "))
    setGreetings(scenario.conversationFlow.greeting.join("\n"))
    setQuestions(scenario.conversationFlow.questions.join("\n"))
    setObjections(scenario.conversationFlow.objections.join("\n"))
    setHesitations(scenario.conversationFlow.hesitations.join("\n"))
    setClosingSignals(scenario.conversationFlow.closingSignals.join("\n"))
    setAiInstructions(scenario.aiInstructions)
    setAssignedTo(scenario.assignedTo)
    setEditingScenario(scenario)
    setShowCreateForm(true)
  }

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const scenarioData: AIScenario = {
        id: editingScenario?.id || Date.now().toString(),
        title,
        description,
        difficulty: difficulty as AIScenario["difficulty"],
        category,
        customerPersona: {
          name: customerName,
          role: customerRole,
          company: customerCompany,
          personality: customerPersonality,
          painPoints: painPoints
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          budget,
          decisionMaker: isDecisionMaker,
        },
        objectives: objectives
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
        conversationFlow: {
          greeting: greetings
            .split("\n")
            .map((g) => g.trim())
            .filter(Boolean),
          questions: questions
            .split("\n")
            .map((q) => q.trim())
            .filter(Boolean),
          objections: objections
            .split("\n")
            .map((o) => o.trim())
            .filter(Boolean),
          hesitations: hesitations
            .split("\n")
            .map((h) => h.trim())
            .filter(Boolean),
          closingSignals: closingSignals
            .split("\n")
            .map((c) => c.trim())
            .filter(Boolean),
        },
        aiInstructions,
        assignedTo,
        createdBy: user?.id || "",
        createdAt: editingScenario?.createdAt || new Date(),
        status: "active",
        usageCount: editingScenario?.usageCount || 0,
        averageScore: editingScenario?.averageScore || 0,
      }

      let updatedScenarios: AIScenario[]
      if (editingScenario) {
        updatedScenarios = scenarios.map((s) => (s.id === editingScenario.id ? scenarioData : s))
      } else {
        updatedScenarios = [...scenarios, scenarioData]
      }

      setScenarios(updatedScenarios)
      LocalStorageService.set("custom-scenarios", updatedScenarios)

      toast({
        title: editingScenario ? "Scenario Updated" : "Scenario Created",
        description: `${title} has been successfully ${editingScenario ? "updated" : "created"}.`,
      })

      resetForm()
      setShowCreateForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save scenario. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteScenario = (scenarioId: string) => {
    const updatedScenarios = scenarios.filter((s) => s.id !== scenarioId)
    setScenarios(updatedScenarios)
    LocalStorageService.set("custom-scenarios", updatedScenarios)

    toast({
      title: "Scenario Deleted",
      description: "AI scenario has been removed.",
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    const level = difficultyLevels.find((l) => l.value === difficulty)
    return level?.color || "bg-gray-100 text-gray-800"
  }

  if (user?.role !== "admin") {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="h-8 w-8 text-purple-600" />
              AI Scenarios
            </h1>
            <p className="text-muted-foreground">Create custom AI-powered sales scenarios for your team's training.</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Scenario
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scenarios</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scenarios.length}</div>
              <p className="text-xs text-muted-foreground">custom scenarios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Scenarios</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scenarios.filter((s) => s.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">available for training</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scenarios.reduce((sum, s) => sum + s.usageCount, 0)}</div>
              <p className="text-xs text-muted-foreground">practice sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scenarios.length > 0
                  ? Math.round(scenarios.reduce((sum, s) => sum + s.averageScore, 0) / scenarios.length)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">across all scenarios</p>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingScenario ? "Edit Scenario" : "Create New Scenario"}</CardTitle>
              <CardDescription>
                Design a custom AI scenario with specific customer personas and conversation flows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveScenario} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Scenario Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Handling Price Objections"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {scenarioCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level *</Label>
                      <Select value={difficulty} onValueChange={setDifficulty} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="objectives">Learning Objectives (comma-separated)</Label>
                      <Input
                        id="objectives"
                        placeholder="e.g., Handle price objections, Build value, Close deal"
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the scenario and what trainees will learn..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Customer Persona */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Customer Persona</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        placeholder="e.g., Sarah Johnson"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerRole">Role/Title *</Label>
                      <Input
                        id="customerRole"
                        placeholder="e.g., VP of Sales"
                        value={customerRole}
                        onChange={(e) => setCustomerRole(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerCompany">Company *</Label>
                      <Input
                        id="customerCompany"
                        placeholder="e.g., TechCorp Industries"
                        value={customerCompany}
                        onChange={(e) => setCustomerCompany(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerPersonality">Personality Traits</Label>
                      <Input
                        id="customerPersonality"
                        placeholder="e.g., Analytical, skeptical, budget-conscious"
                        value={customerPersonality}
                        onChange={(e) => setCustomerPersonality(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <Input
                        id="budget"
                        placeholder="e.g., $50K-100K annually"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="painPoints">Pain Points (comma-separated)</Label>
                    <Input
                      id="painPoints"
                      placeholder="e.g., Manual processes, Poor reporting, High costs"
                      value={painPoints}
                      onChange={(e) => setPainPoints(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDecisionMaker"
                      checked={isDecisionMaker}
                      onChange={(e) => setIsDecisionMaker(e.target.checked)}
                    />
                    <Label htmlFor="isDecisionMaker">Is the primary decision maker</Label>
                  </div>
                </div>

                <Separator />

                {/* Conversation Flow */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Conversation Flow</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="greetings">Greeting Responses (one per line)</Label>
                      <Textarea
                        id="greetings"
                        placeholder="Hi there! Thanks for reaching out..."
                        value={greetings}
                        onChange={(e) => setGreetings(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="questions">Questions (one per line)</Label>
                      <Textarea
                        id="questions"
                        placeholder="Can you tell me more about that?..."
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="objections">Objections (one per line)</Label>
                      <Textarea
                        id="objections"
                        placeholder="That seems expensive for what we're getting..."
                        value={objections}
                        onChange={(e) => setObjections(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hesitations">Hesitations (one per line)</Label>
                      <Textarea
                        id="hesitations"
                        placeholder="I need to think about this..."
                        value={hesitations}
                        onChange={(e) => setHesitations(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closingSignals">Closing Signals (one per line)</Label>
                    <Textarea
                      id="closingSignals"
                      placeholder="This sounds like exactly what we need..."
                      value={closingSignals}
                      onChange={(e) => setClosingSignals(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                {/* AI Instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Behavior Instructions</h3>
                  <div className="space-y-2">
                    <Label htmlFor="aiInstructions">Detailed AI Instructions</Label>
                    <Textarea
                      id="aiInstructions"
                      placeholder="You are playing the role of [customer name]. Be skeptical about price but show interest in the solution. Challenge the salesperson to prove ROI..."
                      value={aiInstructions}
                      onChange={(e) => setAiInstructions(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <Separator />

                {/* Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Assignment</h3>
                  <div className="space-y-2">
                    <Label>Assign to Trainees (Optional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                      {invitedTrainees.map((trainee) => (
                        <label key={trainee.id} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={assignedTo.includes(trainee.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedTo([...assignedTo, trainee.id])
                              } else {
                                setAssignedTo(assignedTo.filter((id) => id !== trainee.id))
                              }
                            }}
                          />
                          <span>{trainee.name}</span>
                        </label>
                      ))}
                    </div>
                    {invitedTrainees.length === 0 && (
                      <p className="text-sm text-muted-foreground">No trainees available. Invite trainees first.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : editingScenario ? "Update Scenario" : "Create Scenario"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setShowCreateForm(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Scenarios List */}
        <Card>
          <CardHeader>
            <CardTitle>Created Scenarios ({scenarios.length})</CardTitle>
            <CardDescription>Manage your custom AI scenarios and track their performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {scenarios.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No scenarios created yet</h3>
                <p className="text-muted-foreground">Start by creating your first AI training scenario above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scenarios.map((scenario, index) => (
                  <div key={scenario.id}>
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{scenario.title}</h4>
                          <Badge className={getDifficultyColor(scenario.difficulty)}>{scenario.difficulty}</Badge>
                          <Badge variant="outline">{scenario.category}</Badge>
                        </div>
                        {scenario.description && (
                          <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <span>Customer: {scenario.customerPersona.name}</span>
                          <span>Company: {scenario.customerPersona.company}</span>
                          <span>Usage: {scenario.usageCount} sessions</span>
                          <span>Avg Score: {scenario.averageScore}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Created: {new Date(scenario.createdAt).toLocaleDateString()}</span>
                          <span>Assigned to: {scenario.assignedTo.length} trainees</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => loadScenarioForEdit(scenario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteScenario(scenario.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {index < scenarios.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

"use client"

import { useEffect, useState } from "react"
import { ModuleCard } from "@/components/modules/module-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Clock, Trophy, TrendingUp, Search, Filter, Users, FileText, Bot, Mic, MicOff, Volume2, VolumeX, Play, Pause, Headphones } from "lucide-react"
import { MicrophoneIndicator } from "@/components/ui/microphone-indicator"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context"
import { LocalStorageService } from "@/lib/storage"
import { mockTrainingModules } from "@/lib/mock-data"
import type { TrainingModule, UserProgress } from "@/lib/types"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [isListening, setIsListening] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  const isEnterprise = user?.role === "admin"

  useEffect(() => {
    // Load modules and user progress
    const loadedModules = LocalStorageService.get("training-modules", mockTrainingModules)
    const loadedProgress = LocalStorageService.get(`user-progress-${user?.id}`, [])

    setModules(loadedModules)
    setUserProgress(loadedProgress)

    // Initialize modules in storage if not present
    if (LocalStorageService.get("training-modules", []).length === 0) {
      LocalStorageService.set("training-modules", mockTrainingModules)
    }
  }, [user?.id])

  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || module.category === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || module.difficulty === difficultyFilter

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const completedModules = userProgress.filter((p) => p.status === "completed").length
  const inProgressModules = userProgress.filter((p) => p.status === "in-progress").length
  const totalTimeSpent = userProgress.reduce((total, p) => total + p.timeSpent, 0)

  const getSkillLevel = () => {
    if (completedModules === 0) return t("dashboard.beginner")
    if (completedModules < 3) return t("dashboard.developing") // Added translation for developing level
    if (completedModules < 6) return t("dashboard.intermediate")
    return t("dashboard.advanced")
  }

  const getEnterpriseStats = () => {
    const invitedTrainees = LocalStorageService.get("invited-trainees", [])
    const customMaterials = LocalStorageService.get("custom-materials", [])
    const customScenarios = LocalStorageService.get("custom-scenarios", [])

    return {
      totalTrainees: invitedTrainees.length,
      activeTrainees: invitedTrainees.filter((t: any) => t.status === "active").length,
      customMaterials: customMaterials.length,
      customScenarios: customScenarios.length,
    }
  }

  const enterpriseStats = isEnterprise ? getEnterpriseStats() : null

  const toggleVoiceSearch = () => {
    setIsListening(!isListening)
    // In a real implementation, this would start/stop speech recognition
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false)
        setSearchTerm("sales techniques") // Simulated voice input
      }, 3000)
    }
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
  }

  const playWelcomeMessage = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, this would play/pause audio
    if (!isPlaying) {
      setTimeout(() => {
        setIsPlaying(false)
      }, 5000) // Simulate 5-second audio
    }
  }

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        {/* Audio-First Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold">
                  {isEnterprise
                    ? `${t("dashboard.welcomeMessage", { name: user?.name || "" })} - ${t("dashboard.enterprise")}`
                    : t("dashboard.welcomeMessage", { name: user?.name || "" })}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isEnterprise
                    ? t("dashboard.enterpriseDescription")
                    : t("dashboard.continueTraining")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={playWelcomeMessage}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  {isPlaying ? "Pause" : "Listen"}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleAudio}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEnterprise && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/enterprise/invite-trainees">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg">{t("dashboard.inviteTrainees")}</CardTitle> {/* Added translation */}
                    <CardDescription>{t("dashboard.inviteTraineesDesc")}</CardDescription> {/* Added translation */}
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/enterprise/materials">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <FileText className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg">{t("dashboard.trainingMaterials")}</CardTitle>{" "}
                    {/* Added translation */}
                    <CardDescription>{t("dashboard.trainingMaterialsDesc")}</CardDescription> {/* Added translation */}
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/enterprise/scenarios">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Bot className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg">{t("dashboard.aiScenarios")}</CardTitle> {/* Added translation */}
                    <CardDescription>{t("dashboard.aiScenariosDesc")}</CardDescription> {/* Added translation */}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        )}

        {/* Audio-First Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isEnterprise ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.totalTrainees")}</CardTitle>{" "}
                  {/* Added translation */}
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enterpriseStats?.totalTrainees || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {enterpriseStats?.activeTrainees || 0} {t("dashboard.active")}
                  </p>{" "}
                  {/* Added translation */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.customMaterials")}</CardTitle>{" "}
                  {/* Added translation */}
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enterpriseStats?.customMaterials || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.uploadedResources")}</p>{" "}
                  {/* Added translation */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.aiScenarios")}</CardTitle>{" "}
                  {/* Added translation */}
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enterpriseStats?.customScenarios || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.customScenarios")}</p>{" "}
                  {/* Added translation */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.trainingModules")}</CardTitle>{" "}
                  {/* Added translation */}
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{modules.length}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.availableModules")}</p>{" "}
                  {/* Added translation */}
                </CardContent>
              </Card>
            </>
          ) : (
            // Audio-focused trainee stats with larger, more accessible design
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{t("dashboard.modulesCompleted")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{completedModules}</div>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.outOfTotal", { total: modules.length })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{t("dashboard.inProgress")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{inProgressModules}</div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.modulesStarted")}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{t("dashboard.timeInvested")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{Math.round(totalTimeSpent / 60)}h</div>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.minutesTotal", { minutes: totalTimeSpent })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{t("dashboard.skillLevel")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">{getSkillLevel()}</div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.basedOnProgress")}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Voice-Enabled Search and Filters */}
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-600" />
              {isEnterprise ? t("dashboard.manageTrainingModules") : "Voice-Enabled Module Search"}
            </CardTitle>
            <CardDescription>
              {isEnterprise
                ? t("dashboard.manageModulesDesc")
                : "Use voice commands or type to find training modules. Say 'search for sales techniques' or 'show beginner modules'"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isListening ? "Listening..." : "Type or use voice search..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-12 ${isListening ? 'border-red-300 bg-red-50 dark:bg-red-950' : ''}`}
                  disabled={isListening}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceSearch}
                  className={`absolute right-1 top-1 h-8 w-8 p-0 ${isListening ? 'text-red-600 bg-red-100 dark:bg-red-900' : 'text-blue-600'}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("dashboard.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.filterByCategory")}</SelectItem>
                  <SelectItem value="product-knowledge">{t("dashboard.productKnowledge")}</SelectItem>
                  <SelectItem value="sales-techniques">{t("dashboard.salesTechniques")}</SelectItem>
                  <SelectItem value="customer-engagement">{t("dashboard.customerEngagement")}</SelectItem>
                  <SelectItem value="objection-handling">{t("dashboard.objectionHandling")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("dashboard.difficulty")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.filterByDifficulty")}</SelectItem>
                  <SelectItem value="beginner">{t("dashboard.beginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("dashboard.intermediate")}</SelectItem>
                  <SelectItem value="advanced">{t("dashboard.advanced")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isListening && (
              <div className="mt-4">
                <MicrophoneIndicator
                  isListening={isListening}
                  volume={Math.random() * 100} // Simulated volume
                  className="max-w-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Audio Training Access */}
        {!isEnterprise && (
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Headphones className="h-6 w-6" />
                    Quick Audio Training
                  </h3>
                  <p className="text-purple-100">Jump into voice-powered sales practice</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/practice">
                    <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Mic className="h-5 w-5 mr-2" />
                      Voice Practice
                    </Button>
                  </Link>
                  <Link href="/modules/module-1">
                    <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Play className="h-5 w-5 mr-2" />
                      Audio Lessons
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Headphones className="h-6 w-6" />
              {t("dashboard.availableModules")}
            </h2>
            <Badge variant="outline">{t("dashboard.modulesCount", { count: filteredModules.length })}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => {
              const progress = userProgress.find((p) => p.moduleId === module.id)
              return <ModuleCard key={module.id} module={module} progress={progress} />
            })}
          </div>

          {filteredModules.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("dashboard.noModulesFound")}</h3>{" "}
                {/* Added translation */}
                <p className="text-muted-foreground mb-4">
                  {t("dashboard.noModulesFoundDesc")} {/* Added translation */}
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                    setDifficultyFilter("all")
                  }}
                >
                  {t("dashboard.clearFilters")} {/* Added translation */}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

"use client"

import { useEffect, useState } from "react"
import { ModuleCard } from "@/components/modules/module-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Clock, Trophy, TrendingUp, Search, Filter, Users, FileText, Bot } from "lucide-react"
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

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {isEnterprise
              ? `${t("dashboard.welcomeMessage", { name: user?.name || "" })} - ${t("dashboard.enterprise")}`
              : t("dashboard.welcomeMessage", { name: user?.name || "" })}
          </h1>
          <p className="text-muted-foreground">
            {isEnterprise
              ? t("dashboard.enterpriseDescription") // Added translation for enterprise description
              : t("dashboard.continueTraining")}
          </p>
        </div>

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

        {/* Stats Cards */}
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
            // Regular trainee stats
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.modulesCompleted")}</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedModules}</div>
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.outOfTotal", { total: modules.length })}
                  </p>{" "}
                  {/* Added translation with parameter */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.inProgress")}</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressModules}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.modulesStarted")}</p>{" "}
                  {/* Added translation */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.timeInvested")}</CardTitle>{" "}
                  {/* Added translation */}
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)}h</div>
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.minutesTotal", { minutes: totalTimeSpent })}
                  </p>{" "}
                  {/* Added translation with parameter */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.skillLevel")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getSkillLevel()}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.basedOnProgress")}</p>{" "}
                  {/* Added translation */}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {isEnterprise ? t("dashboard.manageTrainingModules") : t("dashboard.findTrainingModules")}{" "}
              {/* Added translations */}
            </CardTitle>
            <CardDescription>
              {isEnterprise
                ? t("dashboard.manageModulesDesc") // Added translation
                : t("dashboard.findModulesDesc")}{" "}
              {/* Added translation */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("dashboard.searchModules")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("dashboard.category")} /> {/* Added translation */}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.filterByCategory")}</SelectItem>
                  <SelectItem value="product-knowledge">{t("dashboard.productKnowledge")}</SelectItem>{" "}
                  {/* Added translation */}
                  <SelectItem value="sales-techniques">{t("dashboard.salesTechniques")}</SelectItem>{" "}
                  {/* Added translation */}
                  <SelectItem value="customer-engagement">{t("dashboard.customerEngagement")}</SelectItem>{" "}
                  {/* Added translation */}
                  <SelectItem value="objection-handling">{t("dashboard.objectionHandling")}</SelectItem>{" "}
                  {/* Added translation */}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("dashboard.difficulty")} /> {/* Added translation */}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.filterByDifficulty")}</SelectItem>
                  <SelectItem value="beginner">{t("dashboard.beginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("dashboard.intermediate")}</SelectItem>
                  <SelectItem value="advanced">{t("dashboard.advanced")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Training Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t("dashboard.availableModules")}</h2>
            <Badge variant="outline">{t("dashboard.modulesCount", { count: filteredModules.length })}</Badge>{" "}
            {/* Added translation with parameter */}
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

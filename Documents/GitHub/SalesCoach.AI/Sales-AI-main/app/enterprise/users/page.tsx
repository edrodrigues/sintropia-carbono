"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context"
import { LocalStorageService } from "@/lib/storage"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  TrendingUp,
  Clock,
  Trophy,
  Download,
  Eye,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface TraineeData {
  id: string
  name: string
  email: string
  status: "active" | "inactive" | "pending"
  joinedAt: Date
  lastActive: Date
  progress: {
    modulesCompleted: number
    totalModules: number
    practiceSessionsCompleted: number
    averageScore: number
    timeSpent: number // in minutes
    currentStreak: number
  }
  assignedMaterials: number
  assignedScenarios: number
}

export default function UsersPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()
  const [trainees, setTrainees] = useState<TraineeData[]>([])
  const [filteredTrainees, setFilteredTrainees] = useState<TraineeData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  useEffect(() => {
    // Redirect if not enterprise user
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    // Load and process trainee data
    const invitedTrainees = LocalStorageService.get("invited-trainees", [])
    const customMaterials = LocalStorageService.get("custom-materials", [])
    const customScenarios = LocalStorageService.get("custom-scenarios", [])

    const processedTrainees: TraineeData[] = invitedTrainees.map((trainee: any) => {
      // Generate mock progress data for demonstration
      const modulesCompleted = Math.floor(Math.random() * 8)
      const practiceSessionsCompleted = Math.floor(Math.random() * 15)
      const averageScore = Math.floor(Math.random() * 40) + 60 // 60-100%
      const timeSpent = Math.floor(Math.random() * 300) + 60 // 60-360 minutes
      const currentStreak = Math.floor(Math.random() * 14)

      return {
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
        status: trainee.status === "pending" ? "pending" : Math.random() > 0.2 ? "active" : "inactive",
        joinedAt: new Date(trainee.invitedAt),
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        progress: {
          modulesCompleted,
          totalModules: 8,
          practiceSessionsCompleted,
          averageScore,
          timeSpent,
          currentStreak,
        },
        assignedMaterials: customMaterials.filter((m: any) => m.assignedTo.includes(trainee.id)).length,
        assignedScenarios: customScenarios.filter((s: any) => s.assignedTo.includes(trainee.id)).length,
      }
    })

    setTrainees(processedTrainees)
    setFilteredTrainees(processedTrainees)
  }, [user, router])

  useEffect(() => {
    // Filter and sort trainees
    const filtered = trainees.filter((trainee) => {
      const matchesSearch =
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || trainee.status === statusFilter

      return matchesSearch && matchesStatus
    })

    // Sort trainees
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "progress":
          return b.progress.modulesCompleted - a.progress.modulesCompleted
        case "score":
          return b.progress.averageScore - a.progress.averageScore
        case "lastActive":
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        default:
          return 0
      }
    })

    setFilteredTrainees(filtered)
  }, [trainees, searchTerm, statusFilter, sortBy])

  const handleStatusChange = (traineeId: string, newStatus: "active" | "inactive") => {
    const updatedTrainees = trainees.map((trainee) =>
      trainee.id === traineeId ? { ...trainee, status: newStatus } : trainee,
    )
    setTrainees(updatedTrainees)

    // Update in storage
    const invitedTrainees = LocalStorageService.get("invited-trainees", [])
    const updatedInvited = invitedTrainees.map((t: any) => (t.id === traineeId ? { ...t, status: newStatus } : t))
    LocalStorageService.set("invited-trainees", updatedInvited)

    toast({
      title: "Status Updated",
      description: `Trainee has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const exportUserData = () => {
    const csvContent = [
      ["Name", "Email", "Status", "Modules Completed", "Average Score", "Time Spent (hours)", "Last Active"].join(","),
      ...filteredTrainees.map((trainee) =>
        [
          trainee.name,
          trainee.email,
          trainee.status,
          `${trainee.progress.modulesCompleted}/${trainee.progress.totalModules}`,
          `${trainee.progress.averageScore}%`,
          Math.round(trainee.progress.timeSpent / 60),
          new Date(trainee.lastActive).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "trainee-data.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Trainee data has been exported to CSV file.",
    })
  }

  if (user?.role !== "admin") {
    return null
  }

  const activeTrainees = trainees.filter((t) => t.status === "active").length
  const totalProgress = trainees.reduce(
    (sum, t) => sum + (t.progress.modulesCompleted / t.progress.totalModules) * 100,
    0,
  )
  const averageProgress = trainees.length > 0 ? Math.round(totalProgress / trainees.length) : 0
  const totalTimeSpent = trainees.reduce((sum, t) => sum + t.progress.timeSpent, 0)

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              User Management
            </h1>
            <p className="text-muted-foreground">Monitor and manage your team's training progress and performance.</p>
          </div>
          <Button onClick={exportUserData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trainees</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTrainees}</div>
              <p className="text-xs text-muted-foreground">out of {trainees.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
              <p className="text-xs text-muted-foreground">across all trainees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)}h</div>
              <p className="text-xs text-muted-foreground">team training time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trainees.length > 0
                  ? Math.round(trainees.reduce((sum, t) => sum + t.progress.averageScore, 0) / trainees.length)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">team average</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search Trainees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="score">Average Score</SelectItem>
                  <SelectItem value="lastActive">Last Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Trainees List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({filteredTrainees.length})</CardTitle>
            <CardDescription>Detailed view of all trainees and their training progress.</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTrainees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No trainees found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start by inviting trainees to your training program."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrainees.map((trainee, index) => (
                  <div key={trainee.id}>
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h4 className="font-semibold">{trainee.name}</h4>
                            <p className="text-sm text-muted-foreground">{trainee.email}</p>
                          </div>
                          <Badge className={getStatusColor(trainee.status)}>{trainee.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">
                              {trainee.progress.modulesCompleted}/{trainee.progress.totalModules}
                            </div>
                            <div className="text-xs text-muted-foreground">Modules</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className={`text-lg font-bold ${getProgressColor(trainee.progress.averageScore)}`}>
                              {trainee.progress.averageScore}%
                            </div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="text-lg font-bold text-purple-600">
                              {trainee.progress.practiceSessionsCompleted}
                            </div>
                            <div className="text-xs text-muted-foreground">Sessions</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <div className="text-lg font-bold text-orange-600">
                              {Math.round(trainee.progress.timeSpent / 60)}h
                            </div>
                            <div className="text-xs text-muted-foreground">Time Spent</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Joined: {new Date(trainee.joinedAt).toLocaleDateString()}</span>
                          <span>Last Active: {new Date(trainee.lastActive).toLocaleDateString()}</span>
                          <span>Streak: {trainee.progress.currentStreak} days</span>
                          <span>Materials: {trainee.assignedMaterials}</span>
                          <span>Scenarios: {trainee.assignedScenarios}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {trainee.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(trainee.id, "inactive")}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(trainee.id, "active")}>
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {index < filteredTrainees.length - 1 && <Separator />}
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

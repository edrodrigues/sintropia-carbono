import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, CheckCircle, PlayCircle } from "lucide-react"
import type { TrainingModule, UserProgress } from "@/lib/types"
import Link from "next/link"

interface ModuleCardProps {
  module: TrainingModule
  progress?: UserProgress
}

export function ModuleCard({ module, progress }: ModuleCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "product-knowledge":
        return <BookOpen className="h-4 w-4" />
      case "sales-techniques":
        return <PlayCircle className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const isCompleted = progress?.status === "completed"
  const isInProgress = progress?.status === "in-progress"
  const progressPercentage = progress?.completionPercentage || 0

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(module.category)}
            <Badge variant="secondary" className={getDifficultyColor(module.difficulty)}>
              {module.difficulty}
            </Badge>
          </div>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
        </div>
        <CardTitle className="text-lg leading-tight">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2">{module.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {module.estimatedDuration} min
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {module.content.length} sections
            </div>
          </div>

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </div>

        <div className="mt-4">
          <Link href={`/modules/${module.id}`}>
            <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
              {isCompleted ? "Review" : isInProgress ? "Continue" : "Start Module"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

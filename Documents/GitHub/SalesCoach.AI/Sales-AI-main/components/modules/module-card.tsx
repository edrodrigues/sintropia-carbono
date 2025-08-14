import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, CheckCircle, PlayCircle, Headphones, Volume2, Play, Pause } from "lucide-react"
import type { TrainingModule, UserProgress } from "@/lib/types"
import Link from "next/link"
import { useState } from "react"

interface ModuleCardProps {
  module: TrainingModule
  progress?: UserProgress
}

export function ModuleCard({ module, progress }: ModuleCardProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)

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

  const playPreview = () => {
    setIsPlayingPreview(!isPlayingPreview)
    // In a real implementation, this would play/pause audio preview
    if (!isPlayingPreview) {
      setTimeout(() => {
        setIsPlayingPreview(false)
      }, 3000) // Simulate 3-second preview
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
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className={getDifficultyColor(module.difficulty)}>
              {module.difficulty}
            </Badge>
          </div>
          {isCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
        </div>
        <CardTitle className="text-xl leading-tight font-bold">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-base">{module.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-6">
          {/* Audio-focused metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <Clock className="h-4 w-4" />
              <div>
                <div className="font-medium">{module.estimatedDuration} min</div>
                <div className="text-xs">Listen time</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <Volume2 className="h-4 w-4" />
              <div>
                <div className="font-medium">{module.content.length}</div>
                <div className="text-xs">Audio sections</div>
              </div>
            </div>
          </div>

          {/* Audio preview button */}
          <Button
            variant="outline"
            onClick={playPreview}
            className="w-full border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            {isPlayingPreview ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Playing Preview...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Preview Audio
              </>
            )}
          </Button>

          {progress && (
            <div className="space-y-3 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Learning Progress</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <Link href={`/modules/${module.id}`}>
            <Button 
              className="w-full h-12 text-lg font-semibold" 
              variant={isCompleted ? "outline" : "default"}
              size="lg"
            >
              <Headphones className="h-5 w-5 mr-2" />
              {isCompleted ? "Listen Again" : isInProgress ? "Continue Learning" : "Start Audio Training"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

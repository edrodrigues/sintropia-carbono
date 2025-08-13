"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, FileText, HelpCircle, Zap } from "lucide-react"
import type { TrainingModule, ModuleContent } from "@/lib/types"

interface ModuleContentViewProps {
  module: TrainingModule
  onComplete?: () => void
}

export function ModuleContentView({ module, onComplete }: ModuleContentViewProps) {
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const currentContent = module.content[currentContentIndex]
  const progress = ((currentContentIndex + 1) / module.content.length) * 100

  const getContentIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Play className="h-4 w-4" />
      case "interactive":
        return <Zap className="h-4 w-4" />
      case "quiz":
        return <HelpCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "video":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "interactive":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "quiz":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleNext = () => {
    if (currentContentIndex < module.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1)
    } else if (onComplete) {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1)
    }
  }

  const renderContent = (content: ModuleContent) => {
    switch (content.type) {
      case "text":
        return (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">{content.content}</p>
          </div>
        )
      case "video":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Video content would be embedded here</p>
                <p className="text-sm text-muted-foreground mt-1">{content.content}</p>
              </div>
            </div>
          </div>
        )
      case "interactive":
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg border">
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold mb-2">Interactive Exercise</h3>
                <p className="text-muted-foreground">{content.content}</p>
                <Button className="mt-4 bg-transparent" variant="outline">
                  Start Interactive Session
                </Button>
              </div>
            </div>
          </div>
        )
      case "quiz":
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
              <div className="text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-2">Knowledge Check</h3>
                <p className="text-muted-foreground">{content.content}</p>
                <Button className="mt-4 bg-transparent" variant="outline">
                  Take Quiz
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return <p>{content.content}</p>
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{module.title}</h1>
          <Badge variant="outline">
            {currentContentIndex + 1} of {module.content.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getContentIcon(currentContent.type)}
            <Badge className={getContentTypeColor(currentContent.type)}>{currentContent.type}</Badge>
          </div>
          <CardTitle>{currentContent.title}</CardTitle>
          {currentContent.duration && (
            <p className="text-sm text-muted-foreground">Estimated time: {currentContent.duration} minutes</p>
          )}
        </CardHeader>
        <CardContent>{renderContent(currentContent)}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handlePrevious} disabled={currentContentIndex === 0}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Section {currentContentIndex + 1} of {module.content.length}
        </div>

        <Button onClick={handleNext}>
          {currentContentIndex === module.content.length - 1 ? "Complete Module" : "Next"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

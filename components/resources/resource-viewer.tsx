"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Video,
  Download,
  ExternalLink,
  CheckSquare,
  FileSpreadsheet,
  ArrowLeft,
  Calendar,
  Tag,
} from "lucide-react"
import type { Resource } from "@/lib/types"

interface ResourceViewerProps {
  resource: Resource
  onBack: () => void
}

export function ResourceViewer({ resource, onBack }: ResourceViewerProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "document":
        return <Download className="h-5 w-5" />
      case "template":
        return <FileSpreadsheet className="h-5 w-5" />
      case "checklist":
        return <CheckSquare className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "video":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "document":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "template":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "checklist":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const renderContent = () => {
    if (resource.type === "video") {
      return (
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Video content would be embedded here</p>
              <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
            </div>
          </div>
          {resource.content && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed">{resource.content}</p>
            </div>
          )}
        </div>
      )
    }

    if (resource.type === "checklist") {
      const checklistItems = resource.content?.split("\n").filter((item) => item.trim()) || []
      return (
        <div className="space-y-3">
          <h3 className="font-semibold">Checklist Items:</h3>
          <div className="space-y-2">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-2 bg-muted rounded">
                <CheckSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-sm">{item.replace(/^\d+\.\s*/, "")}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (resource.content) {
      return (
        <div className="prose dark:prose-invert max-w-none">
          <div className="text-foreground leading-relaxed whitespace-pre-line">{resource.content}</div>
        </div>
      )
    }

    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">This resource is available as an external link or download.</p>
        {resource.url && (
          <Button className="mt-4" asChild>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Resource
            </a>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Resources
      </Button>

      {/* Resource Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getResourceIcon(resource.type)}
                <Badge className={getTypeColor(resource.type)}>{resource.type}</Badge>
                <Badge variant="outline">{resource.category}</Badge>
              </div>
              <div>
                <CardTitle className="text-2xl">{resource.title}</CardTitle>
                <CardDescription className="text-base mt-2">{resource.description}</CardDescription>
              </div>
            </div>
            {resource.url && (
              <Button asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open External
                </a>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Updated {new Date(resource.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {resource.tags.length} tags
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resource Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px]">{renderContent()}</ScrollArea>
        </CardContent>
      </Card>

      {/* Tags */}
      {resource.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

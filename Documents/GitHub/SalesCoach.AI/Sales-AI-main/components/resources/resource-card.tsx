"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Video,
  Download,
  ExternalLink,
  CheckSquare,
  FileSpreadsheet,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import type { Resource } from "@/lib/types"
import { useState } from "react"

interface ResourceCardProps {
  resource: Resource
  isBookmarked?: boolean
  onBookmark?: (resourceId: string) => void
  onView?: (resource: Resource) => void
}

export function ResourceCard({ resource, isBookmarked = false, onBookmark, onView }: ResourceCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
        return <Download className="h-4 w-4" />
      case "template":
        return <FileSpreadsheet className="h-4 w-4" />
      case "checklist":
        return <CheckSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    onBookmark?.(resource.id)
  }

  const handleView = () => {
    onView?.(resource)
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getResourceIcon(resource.type)}
            <Badge className={getTypeColor(resource.type)}>{resource.type}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBookmark} className="h-8 w-8 p-0">
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>
        <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Updated {new Date(resource.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleView} className="flex-1" size="sm">
            View Resource
          </Button>
          {resource.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

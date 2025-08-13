"use client"

import { useState, useEffect } from "react"
import { ResourceCard } from "@/components/resources/resource-card"
import { ResourceViewer } from "@/components/resources/resource-viewer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  BookOpen,
  Bookmark,
  FileText,
  Video,
  Download,
  CheckSquare,
  FileSpreadsheet,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LocalStorageService } from "@/lib/storage"
import { mockResources } from "@/lib/mock-data"
import type { Resource } from "@/lib/types"

export default function ResourcesPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [bookmarkedResources, setBookmarkedResources] = useState<string[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Load resources and bookmarks
    const loadedResources = LocalStorageService.get("resources", mockResources)
    const loadedBookmarks = LocalStorageService.get(`bookmarks-${user?.id}`, [])

    setResources(loadedResources)
    setBookmarkedResources(loadedBookmarks)

    // Initialize resources in storage if not present
    if (LocalStorageService.get("resources", []).length === 0) {
      LocalStorageService.set("resources", mockResources)
    }
  }, [user?.id])

  const handleBookmark = (resourceId: string) => {
    const updatedBookmarks = bookmarkedResources.includes(resourceId)
      ? bookmarkedResources.filter((id) => id !== resourceId)
      : [...bookmarkedResources, resourceId]

    setBookmarkedResources(updatedBookmarks)
    if (user) {
      LocalStorageService.set(`bookmarks-${user.id}`, updatedBookmarks)
    }
  }

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource)
  }

  const handleBackToLibrary = () => {
    setSelectedResource(null)
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter
    const matchesType = typeFilter === "all" || resource.type === typeFilter
    const matchesTab = activeTab === "all" || (activeTab === "bookmarked" && bookmarkedResources.includes(resource.id))

    return matchesSearch && matchesCategory && matchesType && matchesTab
  })

  const resourceStats = {
    total: resources.length,
    articles: resources.filter((r) => r.type === "article").length,
    videos: resources.filter((r) => r.type === "video").length,
    documents: resources.filter((r) => r.type === "document").length,
    templates: resources.filter((r) => r.type === "template").length,
    checklists: resources.filter((r) => r.type === "checklist").length,
    bookmarked: bookmarkedResources.length,
  }

  const categories = [...new Set(resources.map((r) => r.category))]

  if (selectedResource) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <ResourceViewer resource={selectedResource} onBack={handleBackToLibrary} />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Resource Library</h1>
          <p className="text-muted-foreground">
            Access comprehensive sales resources, templates, and learning materials to support your training.
          </p>
        </div>

        {/* Resource Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{resourceStats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{resourceStats.articles}</div>
              <p className="text-xs text-muted-foreground">Articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Video className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{resourceStats.videos}</div>
              <p className="text-xs text-muted-foreground">Videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Download className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{resourceStats.documents}</div>
              <p className="text-xs text-muted-foreground">Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileSpreadsheet className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{resourceStats.templates}</div>
              <p className="text-xs text-muted-foreground">Templates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckSquare className="h-6 w-6 mx-auto mb-2 text-pink-600" />
              <div className="text-2xl font-bold">{resourceStats.checklists}</div>
              <p className="text-xs text-muted-foreground">Checklists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Bookmark className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{resourceStats.bookmarked}</div>
              <p className="text-xs text-muted-foreground">Bookmarked</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Find Resources
            </CardTitle>
            <CardDescription>Search and filter resources to find exactly what you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources, tags, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="checklist">Checklists</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resource Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              All Resources
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarked ({resourceStats.bookmarked})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Resources</h2>
              <Badge variant="outline">{filteredResources.length} resources</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isBookmarked={bookmarkedResources.includes(resource.id)}
                  onBookmark={handleBookmark}
                  onView={handleViewResource}
                />
              ))}
            </div>

            {filteredResources.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters to find relevant resources.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setCategoryFilter("all")
                      setTypeFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Bookmarked Resources</h2>
              <Badge variant="outline">{filteredResources.length} bookmarked</Badge>
            </div>

            {bookmarkedResources.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No bookmarked resources</h3>
                  <p className="text-muted-foreground mb-4">
                    Bookmark resources by clicking the bookmark icon on any resource card.
                  </p>
                  <Button onClick={() => setActiveTab("all")}>Browse All Resources</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isBookmarked={true}
                    onBookmark={handleBookmark}
                    onView={handleViewResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

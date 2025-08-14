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
import { FileText, Upload, Video, ImageIcon, File, Trash2, Edit, Eye, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface TrainingMaterial {
  id: string
  title: string
  description: string
  type: "document" | "video" | "presentation" | "image" | "other"
  category: string
  uploadedBy: string
  uploadedAt: Date
  fileSize: string
  assignedTo: string[] // trainee IDs
  tags: string[]
  status: "active" | "draft" | "archived"
  views: number
  lastAccessed?: Date
}

const materialCategories = [
  "Product Knowledge",
  "Sales Techniques",
  "Customer Engagement",
  "Objection Handling",
  "Presentation Skills",
  "Communication",
  "Industry Insights",
  "Company Policies",
  "Other",
]

const materialTypes = [
  { value: "document", label: "Document", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "presentation", label: "Presentation", icon: File },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "other", label: "Other", icon: File },
]

export default function MaterialsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()
  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [invitedTrainees, setInvitedTrainees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [tags, setTags] = useState("")
  const [assignedTo, setAssignedTo] = useState<string[]>([])

  useEffect(() => {
    // Redirect if not enterprise user
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    // Load materials and trainees
    const loadedMaterials = LocalStorageService.get("custom-materials", [])
    const loadedTrainees = LocalStorageService.get("invited-trainees", [])
    setMaterials(loadedMaterials)
    setInvitedTrainees(loadedTrainees)
  }, [user, router])

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newMaterial: TrainingMaterial = {
        id: Date.now().toString(),
        title,
        description,
        type: type as TrainingMaterial["type"],
        category,
        uploadedBy: user?.id || "",
        uploadedAt: new Date(),
        fileSize: `${Math.floor(Math.random() * 50) + 1} MB`, // Mock file size
        assignedTo,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status: "active",
        views: 0,
      }

      const updatedMaterials = [...materials, newMaterial]
      setMaterials(updatedMaterials)
      LocalStorageService.set("custom-materials", updatedMaterials)

      toast({
        title: "Material Uploaded",
        description: `${title} has been successfully uploaded and assigned.`,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setType("")
      setCategory("")
      setTags("")
      setAssignedTo([])
      setShowUploadForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload material. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMaterial = (materialId: string) => {
    const updatedMaterials = materials.filter((m) => m.id !== materialId)
    setMaterials(updatedMaterials)
    LocalStorageService.set("custom-materials", updatedMaterials)

    toast({
      title: "Material Deleted",
      description: "Training material has been removed.",
    })
  }

  const getTypeIcon = (type: string) => {
    const materialType = materialTypes.find((t) => t.value === type)
    return materialType?.icon || File
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
              <FileText className="h-8 w-8 text-green-600" />
              Training Materials
            </h1>
            <p className="text-muted-foreground">Upload, organize, and manage training materials for your team.</p>
          </div>
          <Button onClick={() => setShowUploadForm(!showUploadForm)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Material
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.length}</div>
              <p className="text-xs text-muted-foreground">uploaded resources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Materials</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.filter((m) => m.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">available to trainees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.reduce((sum, m) => sum + m.views, 0)}</div>
              <p className="text-xs text-muted-foreground">across all materials</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <File className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(materials.map((m) => m.category)).size}</div>
              <p className="text-xs text-muted-foreground">different categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card>
            <CardHeader>
              <CardTitle>Upload New Material</CardTitle>
              <CardDescription>Add training materials and assign them to your team members.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadMaterial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Material Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Product Overview Presentation"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Material Type *</Label>
                    <Select value={type} onValueChange={setType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialTypes.map((materialType) => (
                          <SelectItem key={materialType.value} value={materialType.value}>
                            {materialType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the material and its learning objectives..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., beginner, product, overview"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>

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

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Uploading..." : "Upload Material"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Materials List */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Materials ({materials.length})</CardTitle>
            <CardDescription>Manage your training materials and track their usage.</CardDescription>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No materials uploaded yet</h3>
                <p className="text-muted-foreground">Start by uploading your first training material above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((material, index) => {
                  const TypeIcon = getTypeIcon(material.type)
                  return (
                    <div key={material.id}>
                      <div className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          <TypeIcon className="h-8 w-8 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{material.title}</h4>
                              <Badge className={getStatusColor(material.status)}>{material.status}</Badge>
                              <Badge variant="outline">{material.category}</Badge>
                            </div>
                            {material.description && (
                              <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Size: {material.fileSize}</span>
                              <span>Views: {material.views}</span>
                              <span>Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</span>
                              <span>Assigned to: {material.assignedTo.length} trainees</span>
                            </div>
                            {material.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {material.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index < materials.length - 1 && <Separator />}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

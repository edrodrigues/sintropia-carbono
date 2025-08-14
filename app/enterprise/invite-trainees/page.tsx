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
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context"
import { LocalStorageService } from "@/lib/storage"
import { Mail, UserPlus, Users, Send, Trash2, RefreshCw, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface InvitedTrainee {
  id: string
  email: string
  name: string
  invitedBy: string
  invitedAt: Date
  status: "pending" | "accepted" | "active" | "inactive"
  message?: string
}

export default function InviteTraineesPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()
  const [invitedTrainees, setInvitedTrainees] = useState<InvitedTrainee[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [emails, setEmails] = useState<string[]>([""])
  const [bulkEmails, setBulkEmails] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [inviteMode, setInviteMode] = useState<"single" | "multiple" | "bulk">("single")

  useEffect(() => {
    // Redirect if not enterprise user
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    // Load invited trainees
    const trainees = LocalStorageService.get("invited-trainees", [])
    setInvitedTrainees(trainees)
  }, [user, router])

  const addEmailField = () => {
    setEmails([...emails, ""])
  }

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index))
    }
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const processEmails = (): string[] => {
    let emailList: string[] = []

    if (inviteMode === "bulk") {
      // Process bulk emails (comma or line separated)
      emailList = bulkEmails
        .split(/[,\n]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
    } else {
      // Process individual email fields
      emailList = emails.map((email) => email.trim()).filter((email) => email.length > 0)
    }

    return [...new Set(emailList)] // Remove duplicates
  }

  const handleInviteTrainee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const emailList = processEmails()

      if (emailList.length === 0) {
        toast({
          title: t("enterprise.inviteTrainees.noEmails") || "No Emails",
          description:
            t("enterprise.inviteTrainees.enterAtLeastOneEmail") || "Please enter at least one email address.",
          variant: "destructive",
        })
        return
      }

      // Validate all emails
      const invalidEmails = emailList.filter((email) => !validateEmail(email))
      if (invalidEmails.length > 0) {
        toast({
          title: t("enterprise.inviteTrainees.invalidEmails") || "Invalid Emails",
          description: `Invalid email addresses: ${invalidEmails.join(", ")}`,
          variant: "destructive",
        })
        return
      }

      // Check for already invited emails
      const alreadyInvited = emailList.filter((email) => invitedTrainees.some((t) => t.email === email))

      if (alreadyInvited.length > 0) {
        toast({
          title: t("enterprise.inviteTrainees.alreadyInvited") || "Already Invited",
          description: `These emails have already been invited: ${alreadyInvited.join(", ")}`,
          variant: "destructive",
        })
        return
      }

      // Create invitations for all valid emails
      const newInvites: InvitedTrainee[] = emailList.map((email) => ({
        id: `${Date.now()}-${Math.random()}`,
        email,
        name: name || email.split("@")[0],
        invitedBy: user?.id || "",
        invitedAt: new Date(),
        status: "pending",
        message,
      }))

      const updatedTrainees = [...invitedTrainees, ...newInvites]
      setInvitedTrainees(updatedTrainees)
      LocalStorageService.set("invited-trainees", updatedTrainees)

      // Simulate email sending
      setTimeout(() => {
        toast({
          title: t("enterprise.inviteTrainees.invitationsSent") || "Invitations Sent",
          description: `${emailList.length} training invitation${emailList.length > 1 ? "s" : ""} sent successfully`,
        })
      }, 1000)

      // Reset form
      setEmails([""])
      setBulkEmails("")
      setName("")
      setMessage("")
    } catch (error) {
      toast({
        title: t("common.error") || "Error",
        description: t("enterprise.inviteTrainees.failedToSend") || "Failed to send invitations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendInvite = (traineeId: string) => {
    const updatedTrainees = invitedTrainees.map((t) =>
      t.id === traineeId ? { ...t, invitedAt: new Date(), status: "pending" as const } : t,
    )
    setInvitedTrainees(updatedTrainees)
    LocalStorageService.set("invited-trainees", updatedTrainees)

    toast({
      title: t("enterprise.inviteTrainees.invitationResent") || "Invitation Resent",
      description: t("enterprise.inviteTrainees.invitationResentDesc") || "Training invitation has been resent.",
    })
  }

  const handleRemoveInvite = (traineeId: string) => {
    const updatedTrainees = invitedTrainees.filter((t) => t.id !== traineeId)
    setInvitedTrainees(updatedTrainees)
    LocalStorageService.set("invited-trainees", updatedTrainees)

    toast({
      title: t("enterprise.inviteTrainees.invitationRemoved") || "Invitation Removed",
      description: t("enterprise.inviteTrainees.invitationRemovedDesc") || "Trainee invitation has been removed.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-blue-600" />
            {t("enterprise.inviteTrainees.title")}
          </h1>
          <p className="text-muted-foreground">{t("enterprise.inviteTrainees.description")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invitation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t("enterprise.inviteTrainees.sendInvitation")}
              </CardTitle>
              <CardDescription>{t("enterprise.inviteTrainees.sendInvitationDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label className="text-sm font-medium">{t("enterprise.inviteTrainees.invitationMode")}</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={inviteMode === "single" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInviteMode("single")}
                  >
                    {t("enterprise.inviteTrainees.single")}
                  </Button>
                  <Button
                    type="button"
                    variant={inviteMode === "multiple" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInviteMode("multiple")}
                  >
                    {t("enterprise.inviteTrainees.multiple")}
                  </Button>
                  <Button
                    type="button"
                    variant={inviteMode === "bulk" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInviteMode("bulk")}
                  >
                    {t("enterprise.inviteTrainees.bulk")}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleInviteTrainee} className="space-y-4">
                {inviteMode === "bulk" ? (
                  <div className="space-y-2">
                    <Label htmlFor="bulkEmails">{t("enterprise.inviteTrainees.emailAddresses")} *</Label>
                    <Textarea
                      id="bulkEmails"
                      placeholder={t("enterprise.inviteTrainees.bulkEmailPlaceholder")}
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{t("enterprise.inviteTrainees.bulkEmailHelper")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>
                      {inviteMode === "multiple"
                        ? t("enterprise.inviteTrainees.emailAddresses")
                        : t("enterprise.inviteTrainees.emailAddress")}{" "}
                      *
                    </Label>
                    {emails.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="trainee@company.com"
                          value={email}
                          onChange={(e) => updateEmail(index, e.target.value)}
                          required
                        />
                        {inviteMode === "multiple" && (
                          <>
                            {index === emails.length - 1 && (
                              <Button type="button" variant="outline" size="icon" onClick={addEmailField}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                            {emails.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeEmailField(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    {inviteMode === "single" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setInviteMode("multiple")}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t("enterprise.inviteTrainees.addMoreEmails")}
                      </Button>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">{t("enterprise.inviteTrainees.defaultName")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("enterprise.inviteTrainees.defaultNamePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{t("enterprise.inviteTrainees.defaultNameHelper")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("enterprise.inviteTrainees.personalMessage")}</Label>
                  <Textarea
                    id="message"
                    placeholder={t("enterprise.inviteTrainees.personalMessagePlaceholder")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {t("enterprise.inviteTrainees.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {inviteMode !== "single"
                        ? t("enterprise.inviteTrainees.sendInvitations")
                        : t("enterprise.inviteTrainees.sendInvitation")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("enterprise.inviteTrainees.invitationStats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{invitedTrainees.length}</div>
                  <div className="text-sm text-muted-foreground">{t("enterprise.inviteTrainees.totalInvited")}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {invitedTrainees.filter((t) => t.status === "active").length}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("enterprise.inviteTrainees.activeTrainees")}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {invitedTrainees.filter((t) => t.status === "pending").length}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("enterprise.inviteTrainees.pending")}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {invitedTrainees.filter((t) => t.status === "accepted").length}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("enterprise.inviteTrainees.accepted")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invited Trainees List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("enterprise.inviteTrainees.invitedTraineesList")} ({invitedTrainees.length})
            </CardTitle>
            <CardDescription>{t("enterprise.inviteTrainees.manageTeamMembers")}</CardDescription>
          </CardHeader>
          <CardContent>
            {invitedTrainees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("enterprise.inviteTrainees.noTraineesYet")}</h3>
                <p className="text-muted-foreground">{t("enterprise.inviteTrainees.sendFirstInvitation")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitedTrainees.map((trainee, index) => (
                  <div key={trainee.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{trainee.name}</h4>
                          <Badge className={getStatusColor(trainee.status)}>{trainee.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{trainee.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("enterprise.inviteTrainees.invitedOn")} {new Date(trainee.invitedAt).toLocaleDateString()}
                        </p>
                        {trainee.message && (
                          <p className="text-xs text-muted-foreground mt-2 italic">"{trainee.message}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {trainee.status === "pending" && (
                          <Button variant="outline" size="sm" onClick={() => handleResendInvite(trainee.id)}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t("enterprise.inviteTrainees.resend")}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleRemoveInvite(trainee.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {index < invitedTrainees.length - 1 && <Separator />}
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

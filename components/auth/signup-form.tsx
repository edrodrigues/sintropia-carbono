"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context"

interface SignupFormProps {
  onToggleMode: () => void
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState<"trainee" | "enterprise">("trainee")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"))
      return
    }

    if (password.length < 6) {
      setError(t("auth.passwordTooShort"))
      return
    }

    setLoading(true)

    const result = await signup(email, password, name, userType)

    if (!result.success) {
      setError(result.error || t("auth.signupFailed"))
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t("common.createAccount")}</CardTitle>
        <CardDescription>{t("auth.signUpDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("auth.accountType")}</Label>
            <RadioGroup
              value={userType}
              onValueChange={(value: "trainee" | "enterprise") => setUserType(value)}
              className="grid grid-cols-1 gap-3"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="trainee" id="trainee" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="trainee" className="font-medium cursor-pointer">
                    {t("auth.traineeAccount")}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t("auth.traineeDescription")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="enterprise" id="enterprise" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="enterprise" className="font-medium cursor-pointer">
                    {t("auth.enterpriseAccount")}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t("auth.enterpriseDescription")}</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t("common.fullName")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("auth.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("common.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.createPasswordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.creatingAccount") : t("common.createAccount")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("auth.alreadyHaveAccount")}{" "}
            <button onClick={onToggleMode} className="text-primary hover:underline font-medium">
              {t("common.signIn")}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

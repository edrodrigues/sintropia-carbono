"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useI18n } from "@/contexts/i18n-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  LogOut,
  Settings,
  User,
  MessageSquare,
  BookOpen,
  BarChart3,
  Library,
  Menu,
  Users,
  FileText,
  Bot,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const { user, logout } = useAuth()
  const { t, isLoaded } = useI18n()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show loading state while i18n is initializing
  if (!isLoaded) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={user ? "/dashboard" : "/"}>
              <h1 className="text-xl font-bold hover:text-primary transition-colors">Sales Training Platform</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  const traineeNavigationItems = [
    { href: "/dashboard", label: t("nav.modules"), icon: BookOpen },
    { href: "/practice", label: t("nav.aiPractice"), icon: MessageSquare },
    { href: "/progress", label: t("nav.progress"), icon: BarChart3 },
    { href: "/resources", label: t("nav.resources"), icon: Library },
  ]

  const enterpriseNavigationItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: BarChart3 },
    { href: "/enterprise/invite-trainees", label: t("nav.inviteTrainees"), icon: Users },
    { href: "/enterprise/materials", label: t("nav.materials"), icon: FileText },
    { href: "/enterprise/scenarios", label: t("nav.scenarios"), icon: Bot },
    { href: "/enterprise/users", label: t("nav.userManagement"), icon: Users },
  ]

  const navigationItems = user?.role === "admin" ? enterpriseNavigationItems : traineeNavigationItems

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={user ? "/dashboard" : "/"}>
            <h1 className="text-xl font-bold hover:text-primary transition-colors">{t("common.platformName")}</h1>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-4">
              {navigationItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {user ? (
            <>
              <div className="hidden md:block text-sm text-muted-foreground">
                {t("dashboard.welcomeMessage", { name: user.name })}
              </div>

              {/* Mobile menu for authenticated users */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <div className="flex flex-col gap-4 mt-8">
                    {navigationItems.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.role === "admin" ? t("common.enterpriseAccount") : t("common.traineeAccount")}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("common.profile")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("common.settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("common.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  {t("common.signIn")}
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">{t("common.getStarted")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

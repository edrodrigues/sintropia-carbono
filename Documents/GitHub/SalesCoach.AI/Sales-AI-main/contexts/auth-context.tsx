"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { AuthService, LocalStorageService } from "@/lib/storage"
import { mockUsers } from "@/lib/mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (
    email: string,
    password: string,
    name: string,
    userType?: "trainee" | "enterprise",
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize users in localStorage if not present
    const existingUsers = LocalStorageService.get("users", [])
    if (existingUsers.length === 0) {
      LocalStorageService.set("users", mockUsers)
    }

    // Check for existing session
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const users = LocalStorageService.get("users", mockUsers)
    const foundUser = users.find((u: User) => u.email === email)

    if (!foundUser) {
      return { success: false, error: "User not found" }
    }

    // In a real app, you'd verify the password hash
    // For demo purposes, we'll accept any password
    const updatedUser = { ...foundUser, lastLogin: new Date() }

    // Update user in storage
    const updatedUsers = users.map((u: User) => (u.id === foundUser.id ? updatedUser : u))
    LocalStorageService.set("users", updatedUsers)

    AuthService.setCurrentUser(updatedUser)
    setUser(updatedUser)

    return { success: true }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    userType: "trainee" | "enterprise" = "trainee",
  ) => {
    const users = LocalStorageService.get("users", mockUsers)
    const existingUser = users.find((u: User) => u.email === email)

    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    const role = userType === "enterprise" ? "admin" : "trainee"

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date(),
      lastLogin: new Date(),
    }

    const updatedUsers = [...users, newUser]
    LocalStorageService.set("users", updatedUsers)

    AuthService.setCurrentUser(newUser)
    setUser(newUser)

    return { success: true }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

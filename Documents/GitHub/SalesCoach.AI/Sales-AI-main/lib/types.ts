// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  role: "trainee" | "trainer" | "admin"
  avatar?: string
  createdAt: Date
  lastLogin?: Date
}

// Training Module Types
export interface TrainingModule {
  id: string
  title: string
  description: string
  category: "product-knowledge" | "sales-techniques" | "customer-engagement" | "objection-handling"
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number // in minutes
  content: ModuleContent[]
  prerequisites?: string[] // module IDs
  createdAt: Date
  updatedAt: Date
}

export interface ModuleContent {
  id: string
  type: "text" | "video" | "audio" | "interactive" | "quiz"
  title: string
  content: string
  duration?: number
  order: number
}

// Progress Tracking Types
export interface UserProgress {
  id: string
  userId: string
  moduleId: string
  status: "not-started" | "in-progress" | "completed"
  completionPercentage: number
  timeSpent: number // in minutes
  lastAccessed: Date
  startedAt?: Date
  completedAt?: Date
  score?: number
}

// AI Agent and Conversation Types
export interface Conversation {
  id: string
  userId: string
  moduleId?: string
  scenario: string
  messages: ConversationMessage[]
  status: "active" | "completed" | "paused"
  createdAt: Date
  completedAt?: Date
  feedback?: ConversationFeedback
}

export interface ConversationMessage {
  id: string
  role: "user" | "ai" | "system"
  content: string
  timestamp: Date
  audioUrl?: string
}

export interface ConversationFeedback {
  id: string
  conversationId: string
  overallScore: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  skillsAssessed: SkillAssessment[]
  createdAt: Date
}

export interface SkillAssessment {
  skill: string
  score: number
  feedback: string
}

// Sales Scenario Types
export interface SalesScenario {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  customerProfile: CustomerProfile
  objectives: string[]
  context: string
  expectedDuration: number
}

export interface CustomerProfile {
  name: string
  role: string
  company: string
  personality: string
  painPoints: string[]
  budget?: string
  timeline?: string
}

// Resource Types
export interface Resource {
  id: string
  title: string
  type: "article" | "video" | "document" | "template" | "checklist"
  category: string
  description: string
  url?: string
  content?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Analytics and Reporting Types
export interface UserAnalytics {
  userId: string
  totalTimeSpent: number
  modulesCompleted: number
  averageScore: number
  conversationsCompleted: number
  skillsProgress: Record<string, number>
  lastActivity: Date
  streak: number
}

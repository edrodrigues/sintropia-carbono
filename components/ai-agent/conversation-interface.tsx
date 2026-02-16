"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mic, MicOff, Send, User, Bot } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { Conversation, ConversationMessage, SalesScenario } from "@/lib/types"
import { mockAIResponses } from "@/lib/ai-responses"
import { FeedbackGenerator } from "@/lib/feedback-generator"
import { LocalStorageService } from "@/lib/storage"
import { useAuth } from "@/contexts/auth-context"

interface ConversationInterfaceProps {
  scenario: SalesScenario
  onConversationEnd: (conversation: Conversation) => void
}

export function ConversationInterface({ scenario, onConversationEnd }: ConversationInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [conversationStarted, setConversationStarted] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (role: "user" | "ai" | "system", content: string) => {
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }

  const getAIResponse = (userMessage: string, messageHistory: ConversationMessage[]) => {
    // Simple keyword-based response system for demo
    const responses = mockAIResponses[scenario.id] || mockAIResponses.default

    // Check for specific keywords and context
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("expensive")) {
      return responses.priceObjection[Math.floor(Math.random() * responses.priceObjection.length)]
    }

    if (
      lowerMessage.includes("think about it") ||
      lowerMessage.includes("consider") ||
      lowerMessage.includes("maybe")
    ) {
      return responses.hesitation[Math.floor(Math.random() * responses.hesitation.length)]
    }

    if (lowerMessage.includes("competitor") || lowerMessage.includes("other") || lowerMessage.includes("alternative")) {
      return responses.competition[Math.floor(Math.random() * responses.competition.length)]
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || messageHistory.length <= 1) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
    }

    if (lowerMessage.includes("feature") || lowerMessage.includes("how") || lowerMessage.includes("what")) {
      return responses.questions[Math.floor(Math.random() * responses.questions.length)]
    }

    // Default responses
    return responses.general[Math.floor(Math.random() * responses.general.length)]
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return

    // Add user message
    addMessage("user", currentInput.trim())
    const userMessage = currentInput.trim()
    setCurrentInput("")

    // Show typing indicator
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(
      () => {
        const aiResponse = getAIResponse(userMessage, messages)
        addMessage("ai", aiResponse)
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    ) // 1-3 seconds delay
  }

  const startConversation = () => {
    setConversationStarted(true)
    addMessage("system", `Starting role-play scenario: ${scenario.title}`)
    addMessage(
      "system",
      `You are speaking with ${scenario.customerProfile.name}, ${scenario.customerProfile.role} at ${scenario.customerProfile.company}`,
    )

    // AI starts the conversation
    setTimeout(() => {
      const greeting = mockAIResponses[scenario.id]?.greeting[0] || mockAIResponses.default.greeting[0]
      addMessage("ai", greeting)
    }, 1000)
  }

  const endConversation = () => {
    const conversation: Conversation = {
      id: `conv-${Date.now()}`,
      userId: user?.id || "current-user",
      moduleId: scenario.id,
      scenario: scenario.title,
      messages,
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
    }

    const feedback = FeedbackGenerator.generateFeedback(conversation)

    // Save feedback to storage
    if (user) {
      const existingFeedbacks = LocalStorageService.get(`feedbacks-${user.id}`, [])
      const updatedFeedbacks = [...existingFeedbacks, feedback]
      LocalStorageService.set(`feedbacks-${user.id}`, updatedFeedbacks)
    }

    onConversationEnd(conversation)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real implementation, this would start/stop audio recording
    if (!isRecording) {
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false)
        setCurrentInput(
          "This is a simulated voice input. In a real implementation, this would be the transcribed audio.",
        )
      }, 3000)
    }
  }

  if (!conversationStarted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Sales Scenario Practice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{scenario.title}</h3>
            <p className="text-muted-foreground">{scenario.description}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Customer Profile</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Name:</strong> {scenario.customerProfile.name}
                  </p>
                  <p>
                    <strong>Role:</strong> {scenario.customerProfile.role}
                  </p>
                  <p>
                    <strong>Company:</strong> {scenario.customerProfile.company}
                  </p>
                  <p>
                    <strong>Personality:</strong> {scenario.customerProfile.personality}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Your Objectives</h4>
                <ul className="space-y-1 text-sm">
                  {scenario.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Context</h4>
              <p className="text-sm text-muted-foreground">{scenario.context}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={startConversation} size="lg">
              Start Conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle>{scenario.customerProfile.name}</CardTitle>
            <Badge variant="outline">{scenario.customerProfile.role}</Badge>
          </div>
          <Button variant="outline" onClick={endConversation}>
            End Conversation
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user"
                    ? "justify-end"
                    : message.role === "system"
                      ? "justify-center"
                      : "justify-start"
                }`}
              >
                {message.role !== "user" && message.role !== "system" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "system"
                        ? "bg-muted text-muted-foreground text-sm text-center"
                        : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4 space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your response or use voice input..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] resize-none"
              disabled={isRecording}
            />
            <div className="flex flex-col gap-2">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={toggleRecording}
                className="h-[60px] w-12"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isRecording}
                size="icon"
                className="h-[60px] w-12"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Recording... (simulated)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

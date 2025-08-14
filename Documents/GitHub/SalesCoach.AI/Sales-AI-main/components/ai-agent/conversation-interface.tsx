"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, User, Bot, Volume2, VolumeX, Phone, PhoneOff, MessageSquare, Eye, EyeOff } from "lucide-react"
import { FloatingMicIndicator } from "@/components/ui/floating-mic-indicator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [audioVolume, setAudioVolume] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [lastAIMessage, setLastAIMessage] = useState("")
  const [conversationDuration, setConversationDuration] = useState(0)
  const startTimeRef = useRef<Date | null>(null)

  // Track conversation duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (conversationStarted && startTimeRef.current) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - startTimeRef.current!.getTime()) / 1000)
        setConversationDuration(duration)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [conversationStarted])

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

  const handleVoiceMessage = async (transcript: string) => {
    if (!transcript.trim()) return

    // Add user message
    addMessage("user", transcript.trim())
    setCurrentTranscript(transcript.trim())

    // Show AI is thinking/speaking
    setIsAISpeaking(true)

    // Simulate AI response time
    setTimeout(() => {
      const aiResponse = getAIResponse(transcript, messages)
      addMessage("ai", aiResponse)
      setLastAIMessage(aiResponse)

      // Simulate AI speaking duration
      setTimeout(() => {
        setIsAISpeaking(false)
      }, aiResponse.length * 50) // Simulate speaking time based on message length
    }, 1000 + Math.random() * 2000)
  }

  const startConversation = () => {
    setConversationStarted(true)
    startTimeRef.current = new Date()

    // Add system messages for transcript
    addMessage("system", `Starting role-play scenario: ${scenario.title}`)
    addMessage("system", `You are speaking with ${scenario.customerProfile.name}, ${scenario.customerProfile.role} at ${scenario.customerProfile.company}`)

    // AI starts the conversation
    setIsAISpeaking(true)
    setTimeout(() => {
      const greeting = mockAIResponses[scenario.id]?.greeting[0] || mockAIResponses.default.greeting[0]
      addMessage("ai", greeting)
      setLastAIMessage(greeting)

      // Simulate AI speaking the greeting
      setTimeout(() => {
        setIsAISpeaking(false)
      }, greeting.length * 50)
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



  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      setAudioVolume(0)
    } else {
      // Start recording
      setIsRecording(true)
      setCurrentTranscript("")

      // Simulate audio volume levels while recording
      const volumeInterval = setInterval(() => {
        setAudioVolume(Math.random() * 100)
      }, 100)

      // Simulate recording process: listening -> transcribing -> processing -> AI response
      setTimeout(() => {
        setIsRecording(false)
        setIsTranscribing(true)
        clearInterval(volumeInterval)
        setAudioVolume(0)

        // Simulate transcription time
        setTimeout(() => {
          setIsTranscribing(false)
          setIsProcessing(true)

          // Simulate processing time
          setTimeout(() => {
            setIsProcessing(false)
            const simulatedTranscript = "This is a simulated voice input. In a real implementation, this would be the transcribed audio from your speech."
            handleVoiceMessage(simulatedTranscript)
          }, 1000)
        }, 1500)
      }, 3000)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!conversationStarted) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Voice Sales Practice</CardTitle>
            <p className="text-lg text-muted-foreground">Prepare for your conversation with {scenario.customerProfile.name}</p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Scenario Overview */}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">{scenario.title}</h3>
              <p className="text-muted-foreground">{scenario.description}</p>
            </div>

            {/* Customer Profile Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                    {scenario.customerProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xl font-bold">{scenario.customerProfile.name}</h4>
                  <p className="text-muted-foreground">{scenario.customerProfile.role}</p>
                  <p className="text-sm font-medium">{scenario.customerProfile.company}</p>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                <p className="text-sm"><strong>Personality:</strong> {scenario.customerProfile.personality}</p>
              </div>
            </div>

            {/* Objectives */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Your Conversation Goals
              </h4>
              <div className="grid gap-3">
                {scenario.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-bold mb-2 text-amber-800 dark:text-amber-200">Conversation Context</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">{scenario.context}</p>
            </div>

            {/* Start Button */}
            <div className="text-center space-y-4">
              <Button onClick={startConversation} size="lg" className="h-14 px-8 text-lg font-bold">
                <Phone className="h-6 w-6 mr-3" />
                Start Voice Conversation
              </Button>
              <p className="text-xs text-muted-foreground">
                Make sure your microphone is enabled and you're in a quiet environment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-blue-200">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{scenario.customerProfile.name}</h2>
            <p className="text-sm text-muted-foreground">{scenario.customerProfile.role} at {scenario.customerProfile.company}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Call Duration</div>
            <div className="text-lg font-mono font-bold">{formatDuration(conversationDuration)}</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowTranscript(!showTranscript)}>
            {showTranscript ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showTranscript ? "Hide" : "Show"} Transcript
          </Button>
          <Button variant="destructive" onClick={endConversation}>
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Audio Interface */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Customer Avatar and Status */}
          <div className="text-center mb-8">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl">
                  {scenario.customerProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isAISpeaking && (
                <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">{scenario.customerProfile.name}</h3>
            <p className="text-muted-foreground mb-4">{scenario.customerProfile.personality}</p>

            {/* AI Status */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {isAISpeaking ? (
                <>
                  <Volume2 className="h-5 w-5 text-green-600 animate-pulse" />
                  <span className="text-green-600 font-medium">Speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5 text-gray-400" />
                  <span className="text-muted-foreground">Listening</span>
                </>
              )}
            </div>

            {/* Last AI Message Display */}
            {lastAIMessage && (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto mb-6">
                <p className="text-sm italic">"{lastAIMessage}"</p>
              </div>
            )}
          </div>

          {/* Central Microphone Control */}
          <div className="mb-8">
            <FloatingMicIndicator
              isListening={isRecording}
              isTranscribing={isTranscribing}
              isProcessing={isProcessing}
              volume={audioVolume}
              size="lg"
            />
          </div>

          {/* Voice Controls */}
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className="h-14 w-14 rounded-full"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              onClick={toggleRecording}
              disabled={isTranscribing || isProcessing || isAISpeaking}
              className={`h-20 w-20 rounded-full text-white font-bold ${isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowTranscript(!showTranscript)}
              className="h-14 w-14 rounded-full"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </div>

          {/* Current Transcript Display */}
          {currentTranscript && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-950 rounded-lg p-4 max-w-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>You said:</strong> "{currentTranscript}"
              </p>
            </div>
          )}

          {/* Voice Instructions */}
          <div className="mt-8 text-center">
            <p className="text-lg font-medium mb-2">
              {isRecording && "🎤 Listening to your voice..."}
              {isTranscribing && "📝 Converting speech to text..."}
              {isProcessing && "⚡ Processing your message..."}
              {isAISpeaking && "🔊 AI is responding..."}
              {!isRecording && !isTranscribing && !isProcessing && !isAISpeaking && "🎯 Press the microphone to speak"}
            </p>
            <p className="text-sm text-muted-foreground">
              Have a natural conversation - the AI will respond with voice
            </p>
          </div>
        </div>

        {/* Transcript Sidebar */}
        {showTranscript && (
          <div className="w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-l p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversation Transcript
            </h3>
            <div className="space-y-3">
              {messages.filter(m => m.role !== 'system').map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg text-sm ${message.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900 ml-4"
                      : "bg-gray-100 dark:bg-gray-800 mr-4"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === "user" ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                    <span className="font-medium text-xs">
                      {message.role === "user" ? "You" : scenario.customerProfile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

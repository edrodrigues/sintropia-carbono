"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MicrophoneIndicatorProps {
  isListening?: boolean
  isTranscribing?: boolean
  isProcessing?: boolean
  volume?: number
  className?: string
}

export function MicrophoneIndicator({ 
  isListening = false, 
  isTranscribing = false, 
  isProcessing = false,
  volume = 0,
  className 
}: MicrophoneIndicatorProps) {
  const [audioLevels, setAudioLevels] = useState<number[]>([])

  // Simulate audio levels when listening
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isListening) {
      interval = setInterval(() => {
        const newLevels = Array.from({ length: 5 }, () => Math.random() * 100)
        setAudioLevels(newLevels)
      }, 100)
    } else {
      setAudioLevels([])
    }
    return () => clearInterval(interval)
  }, [isListening])

  const getStatusText = () => {
    if (isProcessing) return "Processing..."
    if (isTranscribing) return "Transcribing..."
    if (isListening) return "Listening..."
    return "Ready"
  }

  const getStatusColor = () => {
    if (isProcessing) return "text-blue-600"
    if (isTranscribing) return "text-yellow-600"
    if (isListening) return "text-red-600"
    return "text-gray-500"
  }

  const getIconColor = () => {
    if (isProcessing) return "text-blue-600"
    if (isTranscribing) return "text-yellow-600"
    if (isListening) return "text-red-600"
    return "text-gray-400"
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900", className)}>
      {/* Microphone Icon with Status */}
      <div className="relative">
        <div className={cn(
          "p-2 rounded-full transition-all duration-300",
          isListening && "bg-red-100 dark:bg-red-900 animate-pulse",
          isTranscribing && "bg-yellow-100 dark:bg-yellow-900",
          isProcessing && "bg-blue-100 dark:bg-blue-900"
        )}>
          {isProcessing ? (
            <Loader2 className={cn("h-5 w-5 animate-spin", getIconColor())} />
          ) : isListening ? (
            <Mic className={cn("h-5 w-5", getIconColor())} />
          ) : (
            <MicOff className={cn("h-5 w-5", getIconColor())} />
          )}
        </div>
        
        {/* Pulsing ring when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
        )}
      </div>

      {/* Audio Visualizer */}
      {isListening && (
        <div className="flex items-center gap-1 h-8">
          {audioLevels.map((level, index) => (
            <div
              key={index}
              className="w-1 bg-red-500 rounded-full transition-all duration-100"
              style={{ 
                height: `${Math.max(4, (level / 100) * 32)}px`,
                opacity: 0.7 + (level / 100) * 0.3
              }}
            />
          ))}
        </div>
      )}

      {/* Status Text */}
      <div className="flex flex-col">
        <span className={cn("text-sm font-medium", getStatusColor())}>
          {getStatusText()}
        </span>
        {volume > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Volume2 className="h-3 w-3 text-gray-400" />
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-150"
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Transcription Status Dots */}
      {(isTranscribing || isProcessing) && (
        <div className="flex gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full animate-bounce",
            isTranscribing ? "bg-yellow-500" : "bg-blue-500"
          )} />
          <div className={cn(
            "w-2 h-2 rounded-full animate-bounce",
            isTranscribing ? "bg-yellow-500" : "bg-blue-500"
          )} style={{ animationDelay: "0.1s" }} />
          <div className={cn(
            "w-2 h-2 rounded-full animate-bounce",
            isTranscribing ? "bg-yellow-500" : "bg-blue-500"
          )} style={{ animationDelay: "0.2s" }} />
        </div>
      )}
    </div>
  )
}
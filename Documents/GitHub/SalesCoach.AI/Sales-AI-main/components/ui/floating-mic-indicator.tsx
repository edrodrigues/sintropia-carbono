"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Volume2, Loader2, Waves } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingMicIndicatorProps {
  isListening?: boolean
  isTranscribing?: boolean
  isProcessing?: boolean
  volume?: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FloatingMicIndicator({ 
  isListening = false, 
  isTranscribing = false, 
  isProcessing = false,
  volume = 0,
  className,
  size = "md"
}: FloatingMicIndicatorProps) {
  const [audioWaves, setAudioWaves] = useState<number[]>([])

  // Simulate audio waves when listening
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isListening) {
      interval = setInterval(() => {
        const newWaves = Array.from({ length: 8 }, () => Math.random() * 100)
        setAudioWaves(newWaves)
      }, 150)
    } else {
      setAudioWaves([])
    }
    return () => clearInterval(interval)
  }, [isListening])

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20", 
    lg: "w-24 h-24"
  }

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }

  const getStatusText = () => {
    if (isProcessing) return "Processing your message..."
    if (isTranscribing) return "Converting speech to text..."
    if (isListening) return "Listening to your voice..."
    return "Ready to listen"
  }

  const getStatusColor = () => {
    if (isProcessing) return "border-blue-500 bg-blue-50 dark:bg-blue-950"
    if (isTranscribing) return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
    if (isListening) return "border-red-500 bg-red-50 dark:bg-red-950"
    return "border-gray-300 bg-gray-50 dark:bg-gray-900"
  }

  const getIconColor = () => {
    if (isProcessing) return "text-blue-600"
    if (isTranscribing) return "text-yellow-600"
    if (isListening) return "text-red-600"
    return "text-gray-400"
  }

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Main Microphone Circle */}
      <div className="relative">
        <div className={cn(
          "rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-lg",
          sizeClasses[size],
          getStatusColor(),
          isListening && "animate-pulse"
        )}>
          {isProcessing ? (
            <Loader2 className={cn("animate-spin", iconSizes[size], getIconColor())} />
          ) : isListening ? (
            <Mic className={cn(iconSizes[size], getIconColor())} />
          ) : (
            <MicOff className={cn(iconSizes[size], getIconColor())} />
          )}
        </div>
        
        {/* Pulsing rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-50" style={{ animationDelay: "0.5s" }} />
          </>
        )}

        {/* Transcribing spinner ring */}
        {isTranscribing && (
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin" />
        )}
      </div>

      {/* Audio Visualizer Waves */}
      {isListening && (
        <div className="flex items-end justify-center gap-1 h-12 w-32">
          {audioWaves.map((wave, index) => (
            <div
              key={index}
              className="bg-red-500 rounded-full transition-all duration-150 opacity-80"
              style={{ 
                width: "3px",
                height: `${Math.max(8, (wave / 100) * 48)}px`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Status Text */}
      <div className="text-center max-w-xs">
        <p className={cn(
          "text-sm font-medium",
          isProcessing && "text-blue-600",
          isTranscribing && "text-yellow-600", 
          isListening && "text-red-600",
          !isListening && !isTranscribing && !isProcessing && "text-gray-500"
        )}>
          {getStatusText()}
        </p>
        
        {/* Volume indicator */}
        {volume > 0 && isListening && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-150 rounded-full"
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Processing dots */}
      {(isTranscribing || isProcessing) && (
        <div className="flex gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full animate-bounce",
            isTranscribing ? "bg-yellow-500" : "bg-blue-500"
          )} />
          <div className={cn(
            "w-3 h-3 rounded-full animate-bounce",
            isTranscribing ? "bg-yellow-500" : "bg-blue-500"
          )} style={{ animationDelay: "0.1s" }} />
          <div className={cn(
            "w-3 h-3 rounded-full animate-bounce",
            isTranscribing ? "bg-yellow-500" : "bg-blue-500"
          )} style={{ animationDelay: "0.2s" }} />
        </div>
      )}
    </div>
  )
}
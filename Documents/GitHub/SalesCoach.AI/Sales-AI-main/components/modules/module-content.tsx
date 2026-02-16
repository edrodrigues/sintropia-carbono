"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, FileText, HelpCircle, Zap, Pause, Volume2, VolumeX, SkipBack, SkipForward, Rewind, FastForward, Headphones } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import type { TrainingModule, ModuleContent } from "@/lib/types"

interface ModuleContentViewProps {
  module: TrainingModule
  onComplete?: () => void
}

export function ModuleContentView({ module, onComplete }: ModuleContentViewProps) {
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  
  const currentContent = module.content[currentContentIndex]
  const progress = ((currentContentIndex + 1) / module.content.length) * 100

  // Simulate audio progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const getContentIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Play className="h-4 w-4" />
      case "interactive":
        return <Zap className="h-4 w-4" />
      case "quiz":
        return <HelpCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "video":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "interactive":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "quiz":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleNext = () => {
    setIsPlaying(false)
    setAudioProgress(0)
    if (currentContentIndex < module.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1)
    } else if (onComplete) {
      onComplete()
    }
  }

  const handlePrevious = () => {
    setIsPlaying(false)
    setAudioProgress(0)
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const skipBackward = () => {
    setAudioProgress(Math.max(0, audioProgress - 10))
  }

  const skipForward = () => {
    setAudioProgress(Math.min(100, audioProgress + 10))
  }

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setPlaybackSpeed(speeds[nextIndex])
  }

  const renderContent = (content: ModuleContent) => {
    switch (content.type) {
      case "text":
        return (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">{content.content}</p>
          </div>
        )
      case "video":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Video content would be embedded here</p>
                <p className="text-sm text-muted-foreground mt-1">{content.content}</p>
              </div>
            </div>
          </div>
        )
      case "interactive":
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg border">
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold mb-2">Interactive Exercise</h3>
                <p className="text-muted-foreground">{content.content}</p>
                <Button className="mt-4 bg-transparent" variant="outline">
                  Start Interactive Session
                </Button>
              </div>
            </div>
          </div>
        )
      case "quiz":
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
              <div className="text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-2">Knowledge Check</h3>
                <p className="text-muted-foreground">{content.content}</p>
                <Button className="mt-4 bg-transparent" variant="outline">
                  Take Quiz
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return <p>{content.content}</p>
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Audio-First Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Headphones className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold">{module.title}</h1>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {currentContentIndex + 1} of {module.content.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-3 bg-white/20" />
        </CardContent>
      </Card>

      {/* Audio Player Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getContentIcon(currentContent.type)}
              <div>
                <CardTitle className="text-xl">{currentContent.title}</CardTitle>
                {currentContent.duration && (
                  <p className="text-sm text-muted-foreground">Duration: {currentContent.duration} minutes</p>
                )}
              </div>
            </div>
            <Badge className={getContentTypeColor(currentContent.type)}>{currentContent.type}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Audio Controls */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.floor(audioProgress * (currentContent.duration || 5) / 100)}:{String(Math.floor((audioProgress * (currentContent.duration || 5) / 100) % 1 * 60)).padStart(2, '0')}</span>
                <span>{currentContent.duration || 5}:00</span>
              </div>
              <Slider
                value={[audioProgress]}
                onValueChange={(value) => setAudioProgress(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg" onClick={skipBackward}>
                <Rewind className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg" onClick={handlePrevious} disabled={currentContentIndex === 0}>
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button size="lg" onClick={togglePlayPause} className="h-16 w-16 rounded-full">
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              
              <Button variant="outline" size="lg" onClick={handleNext}>
                <SkipForward className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg" onClick={skipForward}>
                <FastForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="w-20"
                />
              </div>
              
              <Button variant="ghost" size="sm" onClick={changeSpeed}>
                {playbackSpeed}x
              </Button>
            </div>
          </div>

          {/* Content Display */}
          <div className="min-h-[200px]">
            {renderContent(currentContent)}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="lg" onClick={handlePrevious} disabled={currentContentIndex === 0}>
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous Section
        </Button>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Section {currentContentIndex + 1} of {module.content.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round(progress)}% Complete
          </div>
        </div>

        <Button size="lg" onClick={handleNext}>
          {currentContentIndex === module.content.length - 1 ? "Complete Module" : "Next Section"}
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}

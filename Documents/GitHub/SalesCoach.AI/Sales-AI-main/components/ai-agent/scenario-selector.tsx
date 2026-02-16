"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Building, Target, Headphones, Mic, Volume2, Play } from "lucide-react"
import type { SalesScenario } from "@/lib/types"

interface ScenarioSelectorProps {
  scenarios: SalesScenario[]
  onSelectScenario: (scenario: SalesScenario) => void
}

export function ScenarioSelector({ scenarios, onSelectScenario }: ScenarioSelectorProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-8">
      {/* Audio-First Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Headphones className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">Voice-Powered Sales Practice</h1>
          </div>
          <p className="text-xl text-blue-100">
            Practice real sales conversations with AI customers using voice interaction
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-blue-100">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              <span>Voice Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              <span>AI Voice Responses</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span>Real-time Feedback</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge className={getDifficultyColor(scenario.difficulty)} size="lg">
                  {scenario.difficulty}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {scenario.category}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold">{scenario.title}</CardTitle>
              <CardDescription className="text-base">{scenario.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Customer Profile */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
                    <User className="h-5 w-5" />
                    <span className="font-semibold">You'll be speaking with:</span>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-lg">{scenario.customerProfile.name}</p>
                    <p className="text-muted-foreground">{scenario.customerProfile.role}</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {scenario.customerProfile.company}
                    </p>
                  </div>
                </div>

                {/* Objectives */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-5 w-5" />
                    <span className="font-semibold">Your Objectives</span>
                  </div>
                  <ul className="space-y-2">
                    {scenario.objectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <span className="text-primary text-lg">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                    {scenario.objectives.length > 2 && (
                      <li className="text-muted-foreground text-sm ml-6">
                        +{scenario.objectives.length - 2} more objectives
                      </li>
                    )}
                  </ul>
                </div>

                {/* Audio Duration */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">~{scenario.expectedDuration} minutes of voice practice</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => onSelectScenario(scenario)} className="w-full h-12 text-lg font-semibold" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Voice Practice
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Make sure your microphone is enabled for the best experience
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

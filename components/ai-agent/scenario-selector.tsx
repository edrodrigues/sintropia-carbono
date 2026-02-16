"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Building, Target } from "lucide-react"
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Sales Practice</h1>
        <p className="text-muted-foreground">
          Choose a scenario to practice your sales skills with our AI-powered customer simulation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <Badge className={getDifficultyColor(scenario.difficulty)}>{scenario.difficulty}</Badge>
                <Badge variant="outline">{scenario.category}</Badge>
              </div>
              <CardTitle className="text-lg">{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Customer</span>
                    </div>
                    <div>
                      <p className="font-medium">{scenario.customerProfile.name}</p>
                      <p className="text-muted-foreground">{scenario.customerProfile.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>Company</span>
                    </div>
                    <p className="font-medium">{scenario.customerProfile.company}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Key Objectives</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    {scenario.objectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                    {scenario.objectives.length > 2 && (
                      <li className="text-muted-foreground">+{scenario.objectives.length - 2} more objectives</li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>~{scenario.expectedDuration} minutes</span>
                </div>
              </div>

              <Button onClick={() => onSelectScenario(scenario)} className="w-full">
                Start Practice Session
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

import type { Conversation, ConversationFeedback, SkillAssessment } from "./types"

export class FeedbackGenerator {
  static generateFeedback(conversation: Conversation): ConversationFeedback {
    const userMessages = conversation.messages.filter((m) => m.role === "user")
    const aiMessages = conversation.messages.filter((m) => m.role === "ai")

    // Analyze conversation content
    const analysis = this.analyzeConversation(userMessages, aiMessages, conversation.scenario)

    // Generate skill assessments
    const skillsAssessed = this.assessSkills(userMessages, conversation.scenario)

    // Calculate overall score
    const overallScore = this.calculateOverallScore(skillsAssessed)

    // Generate strengths and improvements
    const { strengths, improvements } = this.generateStrengthsAndImprovements(analysis, skillsAssessed)

    // Generate detailed feedback
    const detailedFeedback = this.generateDetailedFeedback(analysis, skillsAssessed, conversation.scenario)

    return {
      id: `feedback-${Date.now()}`,
      conversationId: conversation.id,
      overallScore,
      strengths,
      improvements,
      detailedFeedback,
      skillsAssessed,
      createdAt: new Date(),
    }
  }

  private static analyzeConversation(userMessages: any[], aiMessages: any[], scenario: string) {
    const userContent = userMessages.map((m) => m.content.toLowerCase()).join(" ")

    return {
      messageCount: userMessages.length,
      avgMessageLength: userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length,
      hasQuestions: userContent.includes("?") || userContent.includes("what") || userContent.includes("how"),
      showsEmpathy:
        userContent.includes("understand") || userContent.includes("appreciate") || userContent.includes("feel"),
      addressesObjections:
        userContent.includes("however") || userContent.includes("but") || userContent.includes("although"),
      usesFeatureBenefits:
        userContent.includes("benefit") || userContent.includes("help") || userContent.includes("solution"),
      asksForCommitment:
        userContent.includes("next step") || userContent.includes("move forward") || userContent.includes("decision"),
      scenario: scenario.toLowerCase(),
    }
  }

  private static assessSkills(userMessages: any[], scenario: string): SkillAssessment[] {
    const userContent = userMessages.map((m) => m.content.toLowerCase()).join(" ")
    const skills: SkillAssessment[] = []

    // Discovery & Questioning
    const questioningScore = this.calculateQuestioningScore(userContent, userMessages.length)
    skills.push({
      skill: "Discovery & Questioning",
      score: questioningScore,
      feedback:
        questioningScore >= 70
          ? "You asked thoughtful questions to understand the customer's needs."
          : "Try asking more open-ended questions to better understand customer pain points.",
    })

    // Active Listening
    const listeningScore = this.calculateListeningScore(userContent)
    skills.push({
      skill: "Active Listening",
      score: listeningScore,
      feedback:
        listeningScore >= 70
          ? "You demonstrated good listening skills by acknowledging customer concerns."
          : "Show more active listening by acknowledging and building on customer responses.",
    })

    // Value Proposition
    const valueScore = this.calculateValueScore(userContent)
    skills.push({
      skill: "Value Proposition",
      score: valueScore,
      feedback:
        valueScore >= 70
          ? "You effectively communicated the value and benefits of your solution."
          : "Focus more on connecting features to specific customer benefits and outcomes.",
    })

    // Objection Handling
    if (scenario.includes("objection") || scenario.includes("price")) {
      const objectionScore = this.calculateObjectionScore(userContent)
      skills.push({
        skill: "Objection Handling",
        score: objectionScore,
        feedback:
          objectionScore >= 70
            ? "You handled objections professionally and provided good responses."
            : "Practice the LAER method: Listen, Acknowledge, Explore, Respond to objections.",
      })
    }

    // Closing & Next Steps
    const closingScore = this.calculateClosingScore(userContent)
    skills.push({
      skill: "Closing & Next Steps",
      score: closingScore,
      feedback:
        closingScore >= 70
          ? "You effectively moved the conversation toward next steps."
          : "Be more direct about asking for commitment and defining clear next steps.",
    })

    return skills
  }

  private static calculateQuestioningScore(content: string, messageCount: number): number {
    const questionWords = ["what", "how", "why", "when", "where", "who", "which", "tell me", "can you", "would you"]
    const questionCount = questionWords.reduce((count, word) => count + (content.split(word).length - 1), 0)
    const questionMarks = (content.match(/\?/g) || []).length

    const baseScore = Math.min((questionCount + questionMarks) * 15, 80)
    const lengthBonus = messageCount >= 5 ? 10 : 0

    return Math.min(baseScore + lengthBonus, 100)
  }

  private static calculateListeningScore(content: string): number {
    const listeningIndicators = ["understand", "hear", "appreciate", "makes sense", "i see", "that's", "you mentioned"]
    const score = listeningIndicators.reduce((count, phrase) => count + (content.split(phrase).length - 1), 0)

    return Math.min(score * 20 + 40, 100)
  }

  private static calculateValueScore(content: string): number {
    const valueWords = ["benefit", "help", "solution", "improve", "save", "increase", "reduce", "roi", "value"]
    const score = valueWords.reduce((count, word) => count + (content.split(word).length - 1), 0)

    return Math.min(score * 15 + 30, 100)
  }

  private static calculateObjectionScore(content: string): number {
    const objectionHandling = [
      "however",
      "understand your concern",
      "let me explain",
      "what if",
      "consider",
      "alternative",
    ]
    const score = objectionHandling.reduce((count, phrase) => count + (content.split(phrase).length - 1), 0)

    return Math.min(score * 25 + 35, 100)
  }

  private static calculateClosingScore(content: string): number {
    const closingPhrases = ["next step", "move forward", "decision", "when", "timeline", "ready", "proceed"]
    const score = closingPhrases.reduce((count, phrase) => count + (content.split(phrase).length - 1), 0)

    return Math.min(score * 20 + 25, 100)
  }

  private static calculateOverallScore(skills: SkillAssessment[]): number {
    const totalScore = skills.reduce((sum, skill) => sum + skill.score, 0)
    return Math.round(totalScore / skills.length)
  }

  private static generateStrengthsAndImprovements(analysis: any, skills: SkillAssessment[]) {
    const strengths: string[] = []
    const improvements: string[] = []

    // Analyze strengths
    if (analysis.hasQuestions) {
      strengths.push("Asked relevant questions to understand customer needs")
    }
    if (analysis.showsEmpathy) {
      strengths.push("Demonstrated empathy and understanding")
    }
    if (analysis.usesFeatureBenefits) {
      strengths.push("Connected features to customer benefits")
    }
    if (analysis.messageCount >= 6) {
      strengths.push("Maintained good conversation flow and engagement")
    }

    // Analyze improvements
    if (!analysis.hasQuestions) {
      improvements.push("Ask more discovery questions to uncover customer pain points")
    }
    if (!analysis.showsEmpathy) {
      improvements.push("Show more empathy by acknowledging customer concerns")
    }
    if (!analysis.asksForCommitment) {
      improvements.push("Be more direct about next steps and gaining commitment")
    }
    if (analysis.avgMessageLength < 50) {
      improvements.push("Provide more detailed responses to build credibility")
    }

    // Add skill-specific improvements
    skills.forEach((skill) => {
      if (skill.score < 70) {
        improvements.push(`Improve ${skill.skill.toLowerCase()} techniques`)
      }
    })

    return {
      strengths: strengths.slice(0, 4),
      improvements: improvements.slice(0, 4),
    }
  }

  private static generateDetailedFeedback(analysis: any, skills: SkillAssessment[], scenario: string): string {
    const avgScore = skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length

    let feedback = `In this ${scenario.toLowerCase()} practice session, you demonstrated `

    if (avgScore >= 80) {
      feedback += "strong sales skills with excellent execution across multiple areas. "
    } else if (avgScore >= 70) {
      feedback += "good sales fundamentals with room for refinement in key areas. "
    } else {
      feedback += "basic sales skills that need development to become more effective. "
    }

    if (analysis.hasQuestions) {
      feedback += "Your questioning technique helped uncover important customer information. "
    } else {
      feedback += "Focus on asking more discovery questions to better understand customer needs. "
    }

    if (analysis.showsEmpathy) {
      feedback += "You showed good empathy and understanding of the customer's perspective. "
    }

    if (analysis.usesFeatureBenefits) {
      feedback += "You effectively connected product features to customer benefits. "
    } else {
      feedback += "Work on translating features into specific benefits that matter to the customer. "
    }

    feedback += "Continue practicing to build confidence and refine your approach. "
    feedback +=
      "Consider reviewing the training modules related to your lowest-scoring skill areas for additional improvement."

    return feedback
  }
}

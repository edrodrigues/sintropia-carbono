// Mock AI responses for different scenarios and conversation contexts
export const mockAIResponses: Record<string, any> = {
  "scenario-1": {
    greeting: [
      "Hi there! Thanks for reaching out. I'm Michael Chen, VP of Sales at TechCorp Industries. I understand you wanted to discuss some solutions for our sales team?",
      "Hello! I appreciate you taking the time to connect with me. I've been looking into ways to improve our sales processes, so I'm curious to hear what you have to offer.",
    ],
    questions: [
      "That's interesting. Can you tell me more about how this would specifically help with our reporting challenges?",
      "I see. How does this compare to what we're currently using? We have a pretty established process.",
      "What kind of implementation timeline are we looking at? We can't afford any disruption to our current operations.",
    ],
    priceObjection: [
      "That seems quite expensive for what we're getting. We're working with a tight budget this year.",
      "I need to be honest - that's significantly more than we were hoping to spend. What options do we have?",
      "The price point is concerning. Can you help me understand the ROI we'd see with this investment?",
    ],
    hesitation: [
      "I need to think about this and discuss it with my team. This is a big decision for us.",
      "It sounds promising, but I'm not ready to move forward just yet. What's the next step?",
      "I appreciate the information. Let me review this internally and get back to you.",
    ],
    competition: [
      "We've been looking at a few different options. How do you differentiate from [competitor]?",
      "Another vendor quoted us something similar but at a lower price point. What makes you different?",
      "We're evaluating multiple solutions. What's your unique value proposition?",
    ],
    general: [
      "That makes sense. Tell me more about that.",
      "I see. How would that work in practice?",
      "Interesting. What would be the next steps if we decided to move forward?",
      "I appreciate the information. What other companies similar to ours have you worked with?",
    ],
  },
  "scenario-2": {
    greeting: [
      "Hi! I'm Lisa Rodriguez from GrowthStart. I've been reviewing your proposal, and while I'm interested, I have some concerns about the pricing.",
      "Thanks for following up. I've had a chance to look over everything, but I'm struggling with the cost justification.",
    ],
    questions: [
      "Can you show me some concrete examples of ROI that other companies have seen?",
      "What's the minimum commitment? We're a growing company and need flexibility.",
      "Are there any additional costs I should be aware of beyond what's quoted?",
    ],
    priceObjection: [
      "This is really stretching our budget. Is there a more basic package we could start with?",
      "I love the features, but the price is just too high for us right now. What can we do?",
      "We're a small company. This represents a significant investment for us. Help me make the business case.",
    ],
    hesitation: [
      "I want to move forward, but I need to get approval from our board. What information do they need?",
      "The solution looks great, but the timing might not be right. When would we need to decide?",
      "I'm interested, but I need to see if we can make the numbers work. Can you give me some time?",
    ],
    competition: [
      "We've been quoted much lower by another vendor. Why should we pay more for your solution?",
      "What makes you worth the premium compared to the other options we're considering?",
    ],
    general: [
      "That's helpful. What would implementation look like for a company our size?",
      "I understand. Can you walk me through the onboarding process?",
      "That makes sense. What kind of support do you provide after implementation?",
    ],
  },
  default: {
    greeting: [
      "Hello! Thanks for reaching out. I'm interested to hear what you have to offer.",
      "Hi there! I appreciate you taking the time to connect with me today.",
    ],
    questions: [
      "Can you tell me more about that?",
      "How does that work exactly?",
      "What would that look like for our company?",
    ],
    priceObjection: [
      "That's more than we were expecting to spend. What are our options?",
      "The price seems high. Can you help me understand the value?",
    ],
    hesitation: [
      "I need to think about this. What's the next step?",
      "Let me discuss this with my team and get back to you.",
    ],
    competition: [
      "How do you compare to other solutions in the market?",
      "What makes you different from the competition?",
    ],
    general: [
      "That's interesting. Tell me more.",
      "I see. What else should I know?",
      "That makes sense. What would be the next steps?",
    ],
  },
}

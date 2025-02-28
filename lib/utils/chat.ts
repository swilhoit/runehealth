import type { Message } from "ai"

export function formatLabResultsForAI(labResults: any) {
  if (!labResults) return "No lab results available."

  let formattedResults = "Lab Results:\n"

  // Format biomarkers
  if (labResults.biomarkers) {
    formattedResults += "\nBiomarkers:\n"
    for (const [key, value] of Object.entries(labResults.biomarkers)) {
      formattedResults += `${key}: ${value}\n`
    }
  }

  // Format insights
  if (labResults.insights) {
    formattedResults += "\nInsights:\n"
    for (const insight of labResults.insights) {
      formattedResults += `- ${insight}\n`
    }
  }

  return formattedResults
}

export function createInitialMessage(labResults: any): Message {
  return {
    id: "init",
    role: "assistant",
    content: labResults
      ? "I've analyzed your lab results. What would you like to know about them?"
      : "Welcome! Upload your lab results and I can help you understand them better.",
  }
}


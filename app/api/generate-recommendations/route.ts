import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { v4 as uuidv4 } from "uuid"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Set the maximum duration to 60 seconds
export const maxDuration = 60

// Add proper error handling and response formatting
export async function POST(request: NextRequest) {
  console.log("Received POST request to /api/generate-recommendations")

  try {
    // Verify OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key is not configured",
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Parse request body
    const surveyData = await request.json()
    console.log("Received survey data:", JSON.stringify(surveyData, null, 2))

    // Validate required fields
    if (!surveyData || !surveyData.name || !surveyData.age || !surveyData.symptoms || !surveyData.healthGoals) {
      return NextResponse.json(
        {
          error: "Invalid survey data",
          details: "Missing required fields",
          receivedData: surveyData,
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const prompt = `Based on the following health survey data, provide detailed and personalized nutrition, lifestyle, meal, and activity recommendations:

Name: ${surveyData.name}
Age: ${surveyData.age}
Gender: ${surveyData.gender || "Not specified"}
Height: ${surveyData.height ? surveyData.height + " cm" : "Not provided"}
Weight: ${surveyData.weight ? surveyData.weight + " kg" : "Not provided"}
Symptoms: ${surveyData.symptoms.join(", ")}
Health Goals: ${surveyData.healthGoals.join(", ")}
Dietary Habits: ${surveyData.dietaryHabits?.join(", ") || "Not specified"}
Sleep Quality (1-10): ${surveyData.sleepQuality || "Not specified"}
Stress Level (1-10): ${surveyData.stressLevel || "Not specified"}
Exercise Frequency (days/week): ${surveyData.exerciseFrequency || "Not specified"}
Water Intake (glasses/day): ${surveyData.waterIntake || "Not specified"}
Additional Information: ${surveyData.additionalInfo || "None provided"}

Please provide recommendations in the following JSON format:
{
  "nutritionRecommendations": ["Recommendation 1", "Recommendation 2"],
  "lifestyleRecommendations": ["Recommendation 1", "Recommendation 2"],
  "mealIdeas": ["Meal idea 1", "Meal idea 2"],
  "activityIdeas": ["Activity idea 1", "Activity idea 2"],
  "supplementSuggestions": ["Supplement 1", "Supplement 2"],
  "summary": "A detailed summary of the overall recommendations",
  "weeklyPlan": "A brief outline of a weekly plan"
}`

    console.log("Sending request to OpenAI")
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that always responds in valid JSON format.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const recommendations = completion.choices[0].message.content

    if (!recommendations) {
      throw new Error("No recommendations generated")
    }

    try {
      let parsedRecommendations
      try {
        parsedRecommendations = JSON.parse(recommendations)
      } catch (initialParseError) {
        console.log("Initial parse failed, attempting to extract JSON from response")
        const jsonMatch = recommendations.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedRecommendations = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("Could not extract valid JSON from OpenAI response")
        }
      }

      const id = uuidv4()
      const response = {
        id,
        recommendations: parsedRecommendations,
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json(response)
    } catch (parseError) {
      console.error("Error parsing recommendations:", parseError)
      return NextResponse.json(
        {
          error: "Failed to parse recommendations",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        message: error instanceof Error ? error.message : "Unknown error",
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}


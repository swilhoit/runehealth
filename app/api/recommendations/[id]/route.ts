import { type NextRequest, NextResponse } from "next/server"

// This is a mock database. In a real application, you would use a proper database.
const mockRecommendations: Record<string, any> = {}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  // In a real application, you would fetch this data from a database
  if (id in mockRecommendations) {
    return NextResponse.json(mockRecommendations[id])
  }

  // If the ID doesn't exist, generate mock data
  const mockData = {
    id,
    recommendations: {
      nutritionRecommendations: [
        "Increase intake of leafy greens and colorful vegetables",
        "Consume lean proteins such as fish, chicken, and legumes",
        "Incorporate healthy fats like avocados, nuts, and olive oil",
        "Reduce processed food and added sugar consumption",
        "Stay hydrated with at least 8 glasses of water daily",
      ],
      lifestyleRecommendations: [
        "Aim for 7-9 hours of quality sleep each night",
        "Practice stress-reduction techniques like meditation or deep breathing",
        "Engage in regular physical activity, at least 150 minutes per week",
        "Take breaks and stretch regularly if you have a sedentary job",
        "Limit screen time before bedtime for better sleep quality",
      ],
      mealIdeas: [
        "Grilled salmon with quinoa and roasted vegetables",
        "Vegetarian lentil soup with whole grain bread",
        "Greek yogurt parfait with berries and nuts",
        "Spinach and feta omelette with whole grain toast",
        "Chicken stir-fry with brown rice and mixed vegetables",
      ],
      activityIdeas: [
        "30-minute brisk walking or jogging",
        "Yoga or Pilates class",
        "Swimming laps for low-impact cardio",
        "Strength training with bodyweight exercises or light weights",
        "Cycling or using a stationary bike",
      ],
      supplementSuggestions: [
        "Vitamin D3 for bone health and immune function",
        "Omega-3 fatty acids for heart and brain health",
        "Magnesium for muscle and nerve function",
        "Probiotics for gut health",
      ],
      summary:
        "Based on your health profile, we recommend focusing on a balanced diet rich in nutrients, regular physical activity, stress management, and quality sleep. These recommendations aim to improve your overall well-being, energy levels, and long-term health outcomes.",
      weeklyPlan:
        "Monday: Start with a nutritious breakfast and 30-min walk\nTuesday: Try a new healthy recipe and do strength training\nWednesday: Practice meditation and enjoy a swim or yoga class\nThursday: Meal prep day and 30-min cardio session\nFriday: Try a new physical activity and have a balanced dinner\nWeekend: Rest, meal plan for next week, and engage in enjoyable physical activities",
    },
  }

  // Store the mock data for future requests
  mockRecommendations[id] = mockData

  return NextResponse.json(mockData)
}


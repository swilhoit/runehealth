import { NavBar } from "@/components/nav-bar"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-sand-900">About Rune</h1>
        <p className="text-xl mb-8">
          Rune is an AI-powered platform that helps you understand your blood test results and provides personalized
          health recommendations.
        </p>
        {/* Add more content about your company, mission, team, etc. */}
      </main>
    </div>
  )
}


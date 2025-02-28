import { NavBar } from "@/components/nav-bar"
import { PatientSurvey } from "@/components/patient-survey"

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-sand-900">Get Started</h1>
        <p className="text-xl mb-8">Take our health survey to receive personalized recommendations.</p>
        <PatientSurvey />
      </main>
    </div>
  )
}


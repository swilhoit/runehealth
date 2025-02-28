"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ClipboardList } from "lucide-react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

const symptoms = [
  "Fatigue",
  "Headaches",
  "Digestive issues",
  "Joint pain",
  "Sleep problems",
  "Anxiety or mood changes",
  "Weight changes",
  "Skin issues",
  "Shortness of breath",
  "Muscle weakness",
  "Memory issues",
  "Frequent infections",
]

const healthGoals = [
  "Improve energy levels",
  "Better sleep",
  "Weight management",
  "Stress reduction",
  "Improve digestion",
  "Enhance mental clarity",
  "Boost immune system",
  "Optimize physical performance",
  "Improve cardiovascular health",
  "Balance hormones",
  "Reduce inflammation",
  "Improve skin health",
]

const dietaryHabits = ["Vegetarian", "Vegan", "Pescatarian", "Omnivore", "Keto", "Paleo", "Gluten-free", "Dairy-free"]

export interface SurveyData {
  name: string;
  age: string;
  gender: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  symptoms: string[];
  healthGoals: string[];
  dietaryHabits: string[];
  sleepQuality: number;
  stressLevel: number;
  exerciseFrequency: number;
  waterIntake: number;
  [key: string]: any;
}

export function PatientSurvey({ onComplete }: { onComplete?: (data: SurveyData) => void }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [surveyData, setSurveyData] = useState<SurveyData>({
    name: "",
    age: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    symptoms: [] as string[],
    healthGoals: [] as string[],
    dietaryHabits: [] as string[],
    sleepQuality: 5,
    stressLevel: 5,
    exerciseFrequency: 3,
    waterIntake: 5,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSurveyData({ ...surveyData, [e.target.name]: e.target.value })
  }

  const handleCheckboxChange = (category: "symptoms" | "healthGoals" | "dietaryHabits", item: string) => {
    setSurveyData((prev) => ({
      ...prev,
      [category]: prev[category].includes(item) ? prev[category].filter((i) => i !== item) : [...prev[category], item],
    }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setSurveyData({ ...surveyData, [name]: value[0] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("handleSubmit called, currentStep:", currentStep, "steps.length:", steps.length)

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setError(null)
      setIsSubmitting(true)

      try {
        // Convert height to cm and weight to kg
        const heightCm =
          surveyData.heightFeet && surveyData.heightInches
            ? (Number(surveyData.heightFeet) * 30.48 + Number(surveyData.heightInches) * 2.54).toFixed(2)
            : ""
        const weightKg = surveyData.weight ? (Number(surveyData.weight) * 0.453592).toFixed(2) : ""

        const dataToSubmit = {
          ...surveyData,
          height: heightCm,
          weight: weightKg,
        }

        console.log("Data to submit:", dataToSubmit)

        // Call onComplete callback if provided
        if (onComplete) {
          onComplete(dataToSubmit);
          return;
        }

        // If no callback, proceed with default behavior (redirect)
        const redirectUrl = `/generating-recommendations?data=${encodeURIComponent(JSON.stringify(dataToSubmit))}`
        console.log("Redirecting to:", redirectUrl)
        router.push(redirectUrl)
      } catch (error) {
        console.error("Error submitting survey:", error)
        setError("An error occurred while submitting the survey. Please try again.")
        setIsSubmitting(false)
      }
    }
  }

  const steps = [
    {
      title: "Personal Information",
      description: "Let's start with some basic information about you.",
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="name" className="text-xl">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={surveyData.name}
              onChange={handleInputChange}
              required
              className="text-lg p-6"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="age" className="text-xl">
              Age
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={surveyData.age}
              onChange={handleInputChange}
              required
              className="text-lg p-6"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="gender" className="text-xl">
              Gender
            </Label>
            <select
              id="gender"
              name="gender"
              value={surveyData.gender}
              onChange={handleInputChange}
              required
              className="w-full text-lg p-6 border rounded-md"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-4">
            <Label htmlFor="heightFeet" className="text-xl">
              Height (optional)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="heightFeet"
                name="heightFeet"
                type="number"
                placeholder="Feet"
                value={surveyData.heightFeet}
                onChange={handleInputChange}
                className="text-lg p-6 w-1/2"
              />
              <Input
                id="heightInches"
                name="heightInches"
                type="number"
                placeholder="Inches"
                value={surveyData.heightInches}
                onChange={handleInputChange}
                className="text-lg p-6 w-1/2"
              />
            </div>
          </div>
          <div className="space-y-4">
            <Label htmlFor="weight" className="text-xl">
              Weight (optional)
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              placeholder="Pounds"
              value={surveyData.weight}
              onChange={handleInputChange}
              className="text-lg p-6"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Symptoms",
      description: "Select any symptoms you've been experiencing recently.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {symptoms.map((symptom) => (
            <div key={symptom} className="flex items-center space-x-4">
              <input
                type="checkbox"
                id={symptom}
                checked={surveyData.symptoms.includes(symptom)}
                onChange={() => handleCheckboxChange("symptoms", symptom)}
                className="form-checkbox h-6 w-6 text-terra-600 transition duration-150 ease-in-out"
              />
              <label htmlFor={symptom} className="text-xl font-medium text-sand-700">
                {symptom}
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Health Goals",
      description: "What health goals are most important to you?",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthGoals.map((goal) => (
            <div key={goal} className="flex items-center space-x-4">
              <input
                type="checkbox"
                id={goal}
                checked={surveyData.healthGoals.includes(goal)}
                onChange={() => handleCheckboxChange("healthGoals", goal)}
                className="form-checkbox h-6 w-6 text-terra-600 transition duration-150 ease-in-out"
              />
              <label htmlFor={goal} className="text-xl font-medium text-sand-700">
                {goal}
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Dietary Habits",
      description: "Select any dietary habits that apply to you.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dietaryHabits.map((habit) => (
            <div key={habit} className="flex items-center space-x-4">
              <input
                type="checkbox"
                id={habit}
                checked={surveyData.dietaryHabits.includes(habit)}
                onChange={() => handleCheckboxChange("dietaryHabits", habit)}
                className="form-checkbox h-6 w-6 text-terra-600 transition duration-150 ease-in-out"
              />
              <label htmlFor={habit} className="text-xl font-medium text-sand-700">
                {habit}
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Lifestyle Factors",
      description: "Rate the following aspects of your lifestyle.",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="sleepQuality" className="text-xl">
              Sleep Quality (1-10)
            </Label>
            <Slider
              id="sleepQuality"
              min={1}
              max={10}
              step={1}
              value={[surveyData.sleepQuality]}
              onValueChange={(value) => handleSliderChange("sleepQuality", value)}
            />
            <p className="text-sand-700">Current value: {surveyData.sleepQuality}</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="stressLevel" className="text-xl">
              Stress Level (1-10)
            </Label>
            <Slider
              id="stressLevel"
              min={1}
              max={10}
              step={1}
              value={[surveyData.stressLevel]}
              onValueChange={(value) => handleSliderChange("stressLevel", value)}
            />
            <p className="text-sand-700">Current value: {surveyData.stressLevel}</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="exerciseFrequency" className="text-xl">
              Exercise Frequency (days per week)
            </Label>
            <Slider
              id="exerciseFrequency"
              min={0}
              max={7}
              step={1}
              value={[surveyData.exerciseFrequency]}
              onValueChange={(value) => handleSliderChange("exerciseFrequency", value)}
            />
            <p className="text-sand-700">Current value: {surveyData.exerciseFrequency} days</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="waterIntake" className="text-xl">
              Daily Water Intake (glasses per day)
            </Label>
            <Slider
              id="waterIntake"
              min={0}
              max={12}
              step={1}
              value={[surveyData.waterIntake]}
              onValueChange={(value) => handleSliderChange("waterIntake", value)}
            />
            <p className="text-sand-700">Current value: {surveyData.waterIntake} glasses</p>
          </div>
        </div>
      ),
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <>
      <div className="flex justify-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => {
              console.log("Survey button clicked")
              setIsOpen(true)
            }}
            className="bg-terra-600 hover:bg-terra-700 text-white px-6 py-3 rounded-md transition-colors text-lg flex items-center"
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Take Survey
          </Button>
        </motion.div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gradient-to-br from-sage-50 via-sand-50 to-terra-50 max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <Progress value={progress} className="mb-4" />
              <DialogTitle className="text-3xl font-bold mb-2">{steps[currentStep].title}</DialogTitle>
              <DialogDescription className="text-xl">{steps[currentStep].description}</DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].content}
              </motion.div>
              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="text-lg">Error</AlertTitle>
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="flex justify-between p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0 || isSubmitting}
                className="text-lg px-6 py-3"
              >
                Previous
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-lg px-6 py-3">
                {currentStep === steps.length - 1
                  ? isSubmitting
                    ? "Generating Recommendations..."
                    : "Get Recommendations"
                  : "Next"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}


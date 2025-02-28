"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PatientSurvey } from "@/components/patient-survey"

export function SurveyPopup() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white text-sand-800 hover:bg-sand-100">
          Take Health Survey
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Health Survey</DialogTitle>
          <DialogDescription>Help us understand your health better by completing this short survey.</DialogDescription>
        </DialogHeader>
        <PatientSurvey onComplete={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}


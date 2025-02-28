"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const disclaimerShown = localStorage.getItem("disclaimerShown")
    if (disclaimerShown) {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("disclaimerShown", "true")
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-terra-100 text-terra-800 px-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-8"
        >
          <div className="flex items-center justify-between max-w-4xl w-full">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="text-sm">
                This is a beta version using AI. Use as a guide only and consult a medical professional for accurate
                advice.
              </p>
            </div>
            <button onClick={handleClose} className="text-terra-800 hover:text-terra-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


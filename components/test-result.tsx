"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface RangeData {
  min: number
  max: number
  value: number
  unit: string
  optimal?: {
    min: number
    max: number
  }
}

interface TestResultProps {
  title: string
  data: RangeData
  description?: string
}

export function TestResult({ title, data, description }: TestResultProps) {
  const { min, max, value, unit, optimal } = data
  const range = max - min
  const percentage = ((value - min) / range) * 100
  const optimalStart = optimal ? ((optimal.min - min) / range) * 100 : 0
  const optimalWidth = optimal ? ((optimal.max - optimal.min) / range) * 100 : 0

  const getStatus = () => {
    if (value < min) return "low"
    if (value > max) return "high"
    if (optimal && value >= optimal.min && value <= optimal.max) return "optimal"
    return "normal"
  }

  const status = getStatus()
  const statusConfig = {
    low: {
      color: "bg-terra-500",
      icon: AlertTriangle,
      text: "Low",
      bgColor: "bg-terra-100",
      textColor: "text-terra-700",
    },
    high: {
      color: "bg-terra-500",
      icon: AlertCircle,
      text: "High",
      bgColor: "bg-terra-100",
      textColor: "text-terra-700",
    },
    optimal: {
      color: "bg-sage-500",
      icon: CheckCircle,
      text: "Optimal",
      bgColor: "bg-sage-100",
      textColor: "text-sage-700",
    },
    normal: {
      color: "bg-sand-500",
      icon: CheckCircle,
      text: "Normal",
      bgColor: "bg-sand-100",
      textColor: "text-sand-700",
    },
  }

  const StatusIcon = statusConfig[status].icon

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-sand-900">{title}</span>
            <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${statusConfig[status].bgColor}`}>
              <StatusIcon className={`h-3 w-3 ${statusConfig[status].textColor}`} />
              <span className={`text-xs font-medium ${statusConfig[status].textColor}`}>
                {statusConfig[status].text}
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-sand-900">
            {value.toFixed(1)} {unit}
          </span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          {optimal && (
            <div
              className="absolute h-full bg-sage-200 rounded-full"
              style={{ left: `${optimalStart}%`, width: `${optimalWidth}%` }}
            ></div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`absolute w-1 h-4 -top-1 rounded-full ${statusConfig[status].color}`}
                style={{ left: `calc(${percentage}% - 2px)` }}
              ></div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">
                  Current value: {value.toFixed(1)} {unit}
                </p>
                <p>
                  Range: {min.toFixed(1)} - {max.toFixed(1)} {unit}
                </p>
                {optimal && (
                  <p>
                    Optimal: {optimal.min.toFixed(1)} - {optimal.max.toFixed(1)} {unit}
                  </p>
                )}
                {description && <p className="text-sm text-sand-600">{description}</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex justify-between text-xs text-sand-600 mt-1">
          <span>{min.toFixed(1)}</span>
          <span>
            {max.toFixed(1)} {unit}
          </span>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}


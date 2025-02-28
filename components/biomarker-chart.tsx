"use client"

import { type BiomarkerData, getBiomarkerStatus } from "@/lib/biomarker-ranges"
import { TestResult } from "@/components/test-result"

interface BiomarkerChartProps {
  data: BiomarkerData
}

export function BiomarkerChart({ data }: BiomarkerChartProps) {
  const status = getBiomarkerStatus(data)

  // Add null checks
  if (!data || typeof data.value !== "number" || typeof data.min !== "number" || typeof data.max !== "number") {
    return null // or return a placeholder component
  }

  return (
    <TestResult
      title={data.name}
      data={{
        min: data.min,
        max: data.max,
        value: data.value,
        unit: data.unit,
        optimal: {
          min: (data.min + data.max) / 2 - (data.max - data.min) * 0.2,
          max: (data.min + data.max) / 2 + (data.max - data.min) * 0.2,
        },
      }}
      description={`Status: ${status}`}
    />
  )
}


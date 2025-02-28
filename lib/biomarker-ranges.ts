export const biomarkerCategories = {
  lipid_panel: ["cholesterol", "triglycerides", "hdl", "ldl"],
  metabolic_panel: ["glucose", "sodium"],
  vitamin_panel: ["vitaminD"],
  thyroid_panel: ["tsh"],
}

export interface BiomarkerRange {
  min: number
  max: number
  unit: string
}

export interface BiomarkerData extends BiomarkerRange {
  value: number
}

export const biomarkerRanges: Record<string, BiomarkerRange> = {
  // Lipid Panel
  cholesterol: { min: 125, max: 200, unit: "mg/dL" },
  triglycerides: { min: 0, max: 150, unit: "mg/dL" },
  hdl: { min: 40, max: 60, unit: "mg/dL" },
  ldl: { min: 0, max: 100, unit: "mg/dL" },

  // Blood Cell Counts
  rbc: { min: 4.5, max: 5.9, unit: "M/uL" },
  rdw: { min: 11.5, max: 14.5, unit: "%" },

  // Metabolic Panel
  glucose: { min: 70, max: 100, unit: "mg/dL" },
  sodium: { min: 135, max: 145, unit: "mEq/L" },

  // Liver Function
  bilirubin: { min: 0.3, max: 1.2, unit: "mg/dL" },

  // Hormones
  testosterone: { min: 300, max: 1000, unit: "ng/dL" },
  tsh: { min: 0.4, max: 4.0, unit: "mIU/L" },
  vitaminD: { min: 30, max: 100, unit: "ng/mL" },

  // Cardiovascular
  apolipoproteinB: { min: 0, max: 100, unit: "mg/dL" },
}

export function getBiomarkerStatus(data: BiomarkerData): "normal" | "high" | "low" {
  if (data.value < data.min) return "low"
  if (data.value > data.max) return "high"
  return "normal"
}


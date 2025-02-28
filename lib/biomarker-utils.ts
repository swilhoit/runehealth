// Utility functions for biomarker handling

/**
 * Normalizes a biomarker code to a consistent format
 * @param code The biomarker code to normalize
 * @returns Normalized biomarker code
 */
export function normalizeBiomarkerCode(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9]/g, "")
}

/**
 * Maps common biomarker name variations to their normalized codes
 */
export const biomarkerCodeMap: Record<string, string> = {
  "vitamin d": "vitamind",
  "vitamin d3": "vitamind",
  "vitamin-d": "vitamind",
  "vit d": "vitamind",
  "vit-d": "vitamind",
  vitd: "vitamind",
  "total cholesterol": "cholesterol",
  "cholesterol total": "cholesterol",
  "hdl-c": "hdl",
  "hdl cholesterol": "hdl",
  "ldl-c": "ldl",
  "ldl cholesterol": "ldl",
  tsh: "tsh",
  "thyroid stimulating hormone": "tsh",
  "glucose fasting": "glucose",
  "fasting glucose": "glucose",
  "blood glucose": "glucose",
}

/**
 * Finds the normalized biomarker code from various input formats
 * @param input The biomarker name or code to normalize
 * @returns The normalized biomarker code
 */
export function findBiomarkerCode(input: string): string {
  const normalized = normalizeBiomarkerCode(input)
  return biomarkerCodeMap[normalized] || normalized
}

/**
 * Validates if a biomarker code exists in our definitions
 * @param code The biomarker code to validate
 * @param definitions Array of biomarker definitions
 * @returns true if the code exists in definitions
 */
export function isValidBiomarkerCode(code: string, definitions: any[]): boolean {
  const normalized = normalizeBiomarkerCode(code)
  return definitions.some((def) => normalizeBiomarkerCode(def.code) === normalized)
}


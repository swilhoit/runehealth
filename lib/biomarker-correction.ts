import { normalizeBiomarkerCode, segmentWords, calculateSimilarity, biomarkerCodeMap, knownBiomarkerCodes } from './biomarker-utils';

export interface SuggestedCorrection {
  original: string;
  suggested: string;
  code: string;
  confidence: number; // 0-1
}

/**
 * Analyzes a biomarker name and suggests corrections if it appears malformed
 * @param biomarkerName The potentially malformed biomarker name
 * @returns Array of suggested corrections, sorted by confidence
 */
export function suggestBiomarkerCorrections(biomarkerName: string): SuggestedCorrection[] {
  const normalized = biomarkerName.toLowerCase().trim();
  const suggestions: SuggestedCorrection[] = [];
  
  // Try word segmentation first
  const segmented = segmentWords(normalized);
  if (segmented !== normalized) {
    // Check if segmented version matches any known biomarker
    for (const [name, code] of Object.entries(biomarkerCodeMap)) {
      const similarity = calculateSimilarity(segmented, name);
      if (similarity > 0.7) {
        suggestions.push({
          original: biomarkerName,
          suggested: name,
          code,
          confidence: similarity
        });
      }
    }
  }
  
  // Try direct fuzzy matching
  for (const [name, code] of Object.entries(biomarkerCodeMap)) {
    const similarity = calculateSimilarity(normalized, name);
    if (similarity > 0.6) {
      // Check if this suggestion already exists
      const existingSuggestion = suggestions.find(s => s.code === code);
      if (existingSuggestion) {
        // Replace if this one has higher confidence
        if (similarity > existingSuggestion.confidence) {
          existingSuggestion.suggested = name;
          existingSuggestion.confidence = similarity;
        }
      } else {
        suggestions.push({
          original: biomarkerName,
          suggested: name,
          code,
          confidence: similarity
        });
      }
    }
  }
  
  // Sort by confidence score (descending)
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Checks a list of biomarkers for potential issues and offers suggestions
 * @param biomarkerNames List of biomarker names to analyze
 * @returns Map of original names to their suggested corrections
 */
export function analyzeLabReport(biomarkerNames: string[]): Map<string, SuggestedCorrection[]> {
  const correctionMap = new Map<string, SuggestedCorrection[]>();
  
  for (const name of biomarkerNames) {
    // Only analyze potentially problematic biomarkers
    // Look for patterns that suggest parsing issues
    if (
      name.length > 15 || 
      name.includes('lessthan') || 
      !name.includes(' ') ||
      /^a[a-z]/i.test(name)
    ) {
      const suggestions = suggestBiomarkerCorrections(name);
      if (suggestions.length > 0) {
        correctionMap.set(name, suggestions);
      }
    }
  }
  
  return correctionMap;
}

/**
 * Automatically corrects malformed biomarker names
 * @param biomarkerName The biomarker name to auto-correct
 * @returns The corrected name or the original if no high-confidence match
 */
export function autoCorrectBiomarker(biomarkerName: string): string {
  const suggestions = suggestBiomarkerCorrections(biomarkerName);
  
  // Only auto-correct if we have a high-confidence match
  if (suggestions.length > 0 && suggestions[0].confidence > 0.85) {
    return suggestions[0].suggested;
  }
  
  // Otherwise return the original
  return biomarkerName;
} 
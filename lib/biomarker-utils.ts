// Utility functions for biomarker handling
import { supabase } from "./supabase/client";

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
  // Vitamins
  "vitamin d": "vitamind",
  "vitamin d3": "vitamind",
  "vitamin-d": "vitamind",
  "vit d": "vitamind",
  "vit-d": "vitamind",
  "25-hydroxyvitamin d": "vitamind",
  "25-oh vitamin d": "vitamind",
  "25(oh)d": "vitamind",
  vitd: "vitamind",
  "vitamin b12": "vitaminb12",
  "vit b12": "vitaminb12", 
  "b12": "vitaminb12",
  "folate": "folate",
  "folic acid": "folate",

  // Cholesterol panel
  "total cholesterol": "cholesterol",
  "cholesterol total": "cholesterol", 
  "cholesterol": "cholesterol",
  "hdl-c": "hdl",
  "hdl cholesterol": "hdl",
  "high density lipoprotein": "hdl",
  "ldl-c": "ldl",
  "ldl cholesterol": "ldl",
  "calculated ldl-c": "ldl",
  "low density lipoprotein": "ldl",
  "triglycerides": "triglycerides",
  "trig": "triglycerides",
  
  // Thyroid panel
  "tsh": "tsh",
  "thyroid stimulating hormone": "tsh",
  "free t4": "freet4", 
  "free t3": "freet3",
  "t3": "t3",
  "t4": "t4",
  
  // Blood sugar
  "glucose fasting": "glucose",
  "fasting glucose": "glucose",
  "blood glucose": "glucose",
  "hba1c": "hba1c",
  "a1c": "hba1c",
  "hemoglobin a1c": "hba1c",
  "glycated hemoglobin": "hba1c",
  
  // CBC
  "hemoglobin": "hemoglobin",
  "hgb": "hemoglobin",
  "hematocrit": "hematocrit",
  "hct": "hematocrit",
  "wbc": "wbc",
  "white blood cell count": "wbc", 
  "white blood cells": "wbc",
  "rbc": "rbc",
  "red blood cell count": "rbc",
  "red blood cells": "rbc",
  "platelets": "platelets",
  "plt": "platelets",
  
  // Liver panel
  "alt": "alt",
  "alanine aminotransferase": "alt",
  "sgpt": "alt",
  "ast": "ast", 
  "aspartate aminotransferase": "ast",
  "sgot": "ast",
  "alp": "alp",
  "alkaline phosphatase": "alp",
  "ggt": "ggt",
  "gamma glutamyl transferase": "ggt",
  "bilirubin": "bilirubin",
  "total bilirubin": "bilirubin",
  
  // Kidney panel
  "bun": "bun",
  "blood urea nitrogen": "bun",
  "creatinine": "creatinine",
  "egfr": "egfr",
  "estimated gfr": "egfr",
  "uric acid": "uricacid",
  
  // Electrolytes
  "sodium": "sodium",
  "na": "sodium",
  "potassium": "potassium",
  "k": "potassium", 
  "chloride": "chloride",
  "cl": "chloride",
  "co2": "co2",
  "calcium": "calcium",
  "ca": "calcium",
  "magnesium": "magnesium",
  "mg": "magnesium",
  "phosphorus": "phosphorus",
}

/**
 * Finds the normalized biomarker code from various input formats
 * @param input The biomarker name or code to normalize
 * @param logger Optional logger for debug info
 * @returns The normalized biomarker code
 */
export function findBiomarkerCode(input: string, logger?: any): string {
  const originalInput = input;
  const normalized = input.toLowerCase().trim();
  
  // Try direct match in the map first
  if (biomarkerCodeMap[normalized]) {
    if (logger) {
      logger.debug(`Direct biomarker match found for "${originalInput}"`, {
        input: originalInput,
        normalized: normalized,
        matchedCode: biomarkerCodeMap[normalized]
      });
    }
    return biomarkerCodeMap[normalized];
  }
  
  // If not found, normalize and try again
  const fullyNormalized = normalizeBiomarkerCode(input);
  
  // Log the process
  if (logger) {
    logger.debug(`Looking up biomarker code for "${originalInput}"`, {
      input: originalInput,
      normalized: normalized,
      fullyNormalized: fullyNormalized,
      resultCode: biomarkerCodeMap[fullyNormalized] || fullyNormalized
    });
  }
  
  return biomarkerCodeMap[fullyNormalized] || fullyNormalized;
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

/**
 * A list of known valid biomarker codes
 * This is used to validate biomarkers extracted from PDFs
 */
export const knownBiomarkerCodes = new Set([
  // Generate from biomarkerCodeMap values
  ...Object.values(biomarkerCodeMap),
  // Add standard biomarker codes from our reference list
  "wbc", "rbc", "hemoglobin", "hematocrit", "mcv", "mch", "mchc", "rdw", "platelets",
  "neutrophils", "lymphocytes", "monocytes", "eosinophils", "basophils",
  "glucose", "bun", "creatinine", "egfr", "sodium", "potassium", "chloride", "co2", 
  "calcium", "protein", "albumin", "globulin", "bilirubin", "alp", "ast", "alt",
  "cholesterol", "triglycerides", "hdl", "vldl", "ldl", "testosterone", "hba1c",
  "t4", "folate", "dheas", "cortisol", "tsh", "vitamind", "crp", "homocysteine",
  "ggt", "iron", "t3", "vitaminb12", "magnesium", "insulin", "ferritin"
]);

// Store a cached copy of the biomarker references from the database
let cachedBiomarkerReferences: Record<string, any> = {};
let cacheExpiration = 0;
const CACHE_LIFETIME_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get biomarker references from the database
 * Caches results to avoid excessive database calls
 */
export async function getBiomarkerReferences(): Promise<Record<string, any>> {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (Object.keys(cachedBiomarkerReferences).length > 0 && now < cacheExpiration) {
    return cachedBiomarkerReferences;
  }
  
  try {
    // Fetch from database
    const { data, error } = await supabase
      .from('biomarker_references')
      .select('*');
      
    if (error) {
      console.error('Error fetching biomarker references:', error);
      return {}; // Return empty object on error
    }
    
    // Transform into a map of normalized code -> biomarker data
    const references: Record<string, any> = {};
    for (const biomarker of data) {
      const normalized = normalizeBiomarkerCode(biomarker.code);
      references[normalized] = biomarker;
    }
    
    // Update cache
    cachedBiomarkerReferences = references;
    cacheExpiration = now + CACHE_LIFETIME_MS;
    
    return references;
  } catch (err) {
    console.error('Exception fetching biomarker references:', err);
    return {}; // Return empty object on error
  }
}

/**
 * Checks if a biomarker name is a valid biomarker or a false positive
 * Uses checks against known biomarker names and patterns
 * 
 * @param biomarkerName Raw biomarker name to check
 * @param logger Optional logger for debug info
 * @returns boolean indicating if this is a valid biomarker
 */
export async function isValidBiomarkerName(biomarkerName: string, logger?: any): Promise<boolean> {
  // Skip very long strings - they're likely sentences or paragraphs, not biomarker names
  if (biomarkerName.length > 50) {
    if (logger) {
      logger.debug(`Rejected biomarker - too long: "${biomarkerName}"`);
    }
    return false;
  }

  // Normalize the name
  const normalized = biomarkerName.toLowerCase().trim();
  
  // Check common false positives like dates, patient IDs, etc.
  const falseBiomarkerPatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/, // Date patterns: MM/DD/YYYY
    /\d{1,2}-\d{1,2}-\d{2,4}/,  // Date patterns: MM-DD-YYYY
    /patient id/i,              // Patient ID labels
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i, // Month names
    /reference\s+lab/i,         // Reference lab text
    /\breport\b/i,              // Report text
    /\bpage\b.*\d+/i,           // Page numbers
    /\bfax\b/i,                 // Fax mentions
    /\bphone\b/i,               // Phone mentions
    /\bspecimen\b/i,            // Specimen mentions
    /\baddress\b/i,             // Address mentions
    /\bmodern\b/i,              // Common false positive
    /\blegacy\b/i,              // Common false positive
    /\blaborator(y|ies)\b/i,    // Laboratory mentions
    /\bcollected\b/i,           // Collected dates
    /\breceived\b/i,            // Received dates
    /\breported\b/i,            // Reported dates
    /\bmethod\b/i,              // Test method descriptions
    /\bssn\b/i,                 // Social security number
    /\bage\b/i,                 // Age mentions
    /\bgender\b/i,              // Gender mentions
    /\bdate\s+of\s+birth\b/i,   // DOB mentions
    /\bdob\b/i,                 // DOB abbreviation
    /\bheight\b/i,              // Height mentions (unless specifically measuring height)
    /\bweight\b/i,              // Weight mentions (unless specifically measuring weight)
    /\bdr\.?\b/i,               // Doctor mentions
    /\bm\.?d\.?\b/i,            // MD mentions
  ];
  
  // Check if the name matches any false positive patterns
  for (const pattern of falseBiomarkerPatterns) {
    if (pattern.test(normalized)) {
      if (logger) {
        logger.debug(`Rejected biomarker - matches false pattern: "${biomarkerName}" (pattern: ${pattern})`);
      }
      return false;
    }
  }
  
  // First, check if we have this biomarker in our known hardcoded list (fastest check)
  const code = findBiomarkerCode(normalized, logger);
  if (knownBiomarkerCodes.has(code)) {
    if (logger) {
      logger.debug(`Validated biomarker - found in known list: "${biomarkerName}" (code: ${code})`);
    }
    return true;
  }
  
  // If not in hardcoded list, check database reference table (slower but more comprehensive)
  try {
    const references = await getBiomarkerReferences();
    const normalizedInput = normalizeBiomarkerCode(normalized);
    
    // Direct check against our reference database
    for (const [refCode, biomarker] of Object.entries(references)) {
      // Check if the normalized input contains the biomarker code or name
      if (
        normalizedInput === refCode || 
        normalizedInput.includes(refCode) ||
        normalizedInput.includes(normalizeBiomarkerCode(biomarker.name))
      ) {
        if (logger) {
          logger.debug(`Validated biomarker - found in database: "${biomarkerName}" (matched: ${biomarker.name})`);
        }
        return true;
      }
    }
  } catch (err) {
    console.error('Error checking biomarker against database:', err);
    // Fall back to pattern matching if database check fails
  }
  
  // If it's not a direct match, check if it has characteristics of a biomarker name
  // Most biomarker names have specific patterns
  const likelyBiomarkerPatterns = [
    /\b(a|ab|hla|hdl|ldl|vldl|apolipoprotein)\b/i,  // Common prefixes
    /\b(vitamin|vit)\s+[a-e]\d*/i,                  // Vitamins
    /\bimmunoglobulin\b/i,                          // Immunoglobulins
    /\blipid\b/i,                                   // Lipid related
    /\bhormone\b/i,                                 // Hormone related
    /\bantibod(y|ies)\b/i,                          // Antibody tests
    /\bantigen\b/i,                                 // Antigen tests
    /\bratio\b/i                                    // Ratio measurements
  ];
  
  // Check if name matches any biomarker-like patterns
  for (const pattern of likelyBiomarkerPatterns) {
    if (pattern.test(normalized)) {
      if (logger) {
        logger.debug(`Validated biomarker - matches likely pattern: "${biomarkerName}" (pattern: ${pattern})`);
      }
      return true;
    }
  }
  
  // Not in our known list and doesn't look like a biomarker
  if (logger) {
    logger.debug(`Rejected biomarker - not in known list and doesn't match patterns: "${biomarkerName}"`);
  }
  return false;
}

/**
 * Synchronous version of isValidBiomarkerName for cases where async isn't possible
 * Falls back to hardcoded lists only, without database checks
 */
export function isValidBiomarkerNameSync(biomarkerName: string, logger?: any): boolean {
  // Skip very long strings - they're likely sentences or paragraphs, not biomarker names
  if (biomarkerName.length > 50) {
    if (logger) {
      logger.debug(`Rejected biomarker - too long: "${biomarkerName}"`);
    }
    return false;
  }

  // Normalize the name
  const normalized = biomarkerName.toLowerCase().trim();
  
  // Check common false positives like dates, patient IDs, etc.
  const falseBiomarkerPatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/, // Date patterns: MM/DD/YYYY
    /\d{1,2}-\d{1,2}-\d{2,4}/,  // Date patterns: MM-DD-YYYY
    /patient id/i,              // Patient ID labels
    /reference\s+lab/i,         // Reference lab text
    /\breport\b/i,              // Report text
    /\bpage\b.*\d+/i,           // Page numbers
  ];
  
  // Check if the name matches any false positive patterns
  for (const pattern of falseBiomarkerPatterns) {
    if (pattern.test(normalized)) {
      return false;
    }
  }
  
  // Check if we have this biomarker in our known list
  const code = findBiomarkerCode(normalized, logger);
  if (knownBiomarkerCodes.has(code)) {
    return true;
  }
  
  // Check for biomarker-like patterns
  const likelyBiomarkerPatterns = [
    /\b(a|ab|hla|hdl|ldl|vldl|apolipoprotein)\b/i,  // Common prefixes
    /\b(vitamin|vit)\s+[a-e]\d*/i,                  // Vitamins
    /\bimmunoglobulin\b/i,                          // Immunoglobulins
    /\blipid\b/i,                                   // Lipid related
    /\bhormone\b/i,                                 // Hormone related
  ];
  
  // Check if name matches any biomarker-like patterns
  for (const pattern of likelyBiomarkerPatterns) {
    if (pattern.test(normalized)) {
      return true;
    }
  }
  
  return false;
}


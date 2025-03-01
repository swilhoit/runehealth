import { PDFDocument } from "pdf-lib"
import type { Logger } from "@/lib/logger"
import { findBiomarkerCode, isValidBiomarkerName, isValidBiomarkerNameSync, segmentWords } from "@/lib/biomarker-utils"
import PDFParse from "pdf-parse"
import fs from 'fs'
import path from 'path'

export interface ExtractedBiomarker {
  code: string
  value: number
  unit: string
}

// Check if a file exists safely
const fileExists = (filePath: string): boolean => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Preprocesses PDF text to fix common extraction issues
 * @param text Raw text extracted from PDF
 * @returns Processed text with common issues fixed
 */
export function preprocessPdfText(text: string): string {
  // Replace common run-together words with proper spacing
  let processed = text;
  
  // Fix joined words by inserting spaces between patterns
  processed = processed.replace(/([a-z])([A-Z])/g, '$1 $2'); // CamelCase to words
  
  // Fix common biomarker-specific patterns
  const patterns = [
    // Fix common prefix issues
    [/\b(serum|plasma)([a-z]+)/gi, '$1 $2'],
    [/\b(vitamin)([a-z])/gi, '$1 $2'],
    [/\b(total)([a-z]+)/gi, '$1 $2'],
    
    // Fix common suffix issues
    [/([a-z])(concentration)/gi, '$1 $2'],
    [/([a-z])(lessthan)/gi, '$1 less than'],
    [/lessthan\b/gi, 'less than'],
    
    // Fix common test name issues
    [/\bohvitamin([a-z])\b/gi, 'oh vitamin $1'],
    [/\b25ohvitamin([a-z])\b/gi, '25-oh vitamin $1'],
    [/\b25hydroxyvitamin([a-z])\b/gi, '25-hydroxy vitamin $1'],
    
    // Fix common cholesterol pattern issues
    [/\b(hdl|ldl|vldl)cholesterol\b/gi, '$1 cholesterol'],
    [/\b(hdl|ldl|vldl)chol\b/gi, '$1 cholesterol'],
    [/\bldlcalc\b/gi, 'ldl calc'],
    
    // Fix other common joined words
    [/bloodurea/gi, 'blood urea'],
    [/redblood/gi, 'red blood'],
    [/whiteblood/gi, 'white blood'],
  ];
  
  for (const [pattern, replacement] of patterns) {
    processed = processed.replace(pattern, replacement as string);
  }
  
  // Handle cases where "a" is attached to the biomarker
  processed = processed.replace(/\ba(serum|plasma|blood|urine|vitamin|total|folate|calcium|glucose)/gi, 'a $1');
  
  return processed;
}

export async function extractTextFromPDF(pdfBuffer: ArrayBuffer, logger: Logger): Promise<string> {
  try {
    logger.debug("Starting PDF text extraction");
    
    const data = await PDFParse(Buffer.from(pdfBuffer));
    
    // Apply preprocessing to clean up the extracted text
    const processedText = preprocessPdfText(data.text);
    
    logger.debug("PDF text extracted successfully", {
      pageCount: data.numpages,
      textLength: data.text.length,
      processedTextLength: processedText.length
    });
    
    return processedText;
  } catch (error) {
    logger.error("Error extracting text from PDF", error as Error);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function analyzePDFText(text: string, logger: Logger): Promise<ExtractedBiomarker[]> {
  const biomarkers: ExtractedBiomarker[] = []

  // Preprocess the text
  const processedText = preprocessPdfText(text);
  
  logger.debug("Preprocessed PDF text", {
    originalLength: text.length,
    processedLength: processedText.length,
    sample: processedText.substring(0, 200)
  });

  // Common patterns for lab values
  const patterns = [
    // Pattern: "Test Name: 123 mg/dL"
    /([A-Za-z\s\-\(\)]+):\s*(\d+\.?\d*)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L|Highmg\/dL|8\-4108)/g,
    // Pattern: "Test Name 123 mg/dL"
    /([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L|Highmg\/dL|8\-4108)/g,
    // Pattern: "123 mg/dL Test Name"
    /(\d+\.?\d*)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L|Highmg\/dL|8\-4108)\s+([A-Za-z\s\-\(\)]+)/g,
    // Additional pattern for ranges: "Test Name: 123 (70-100) mg/dL"
    /([A-Za-z\s\-\(\)]+):\s*(\d+\.?\d*)\s*\(\d+\.?\d*-\d+\.?\d*\)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L|Highmg\/dL|8\-4108)/g,
    // Additional pattern for ranges: "Test Name 123 (70-100) mg/dL"
    /([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*\(\d+\.?\d*-\d+\.?\d*\)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L|Highmg\/dL|8\-4108)/g,
    // More specific formats with various units
    /([A-Za-z\s\-\(\)]+):\s*(\d+\.?\d*)\s*(mmol\/L|µmol\/L|nmol\/L|pmol\/L|mIU\/L|pg\/mL|mEq\/L)/g,
    /([A-Za-z\s\-\(\)]+)\s+(\d+\.?\d*)\s*(mmol\/L|µmol\/L|nmol\/L|pmol\/L|mIU\/L|pg\/mL|mEq\/L)/g,
    // Patterns with table-like spacing (tab or multiple spaces)
    /([A-Za-z\s\-\(\)]+)\t+(\d+\.?\d*)\t+([A-Za-z\/\s\%]+)/g,
    /([A-Za-z\s\-\(\)]+)\s{2,}(\d+\.?\d*)\s{2,}([A-Za-z\/\s\%]+)/g,
    // Patterns with reference ranges
    /([A-Za-z\s\-\(\)]+)\s*(\d+\.?\d*)\s*Reference Range:\s*[\d\.\-]+\s*([A-Za-z\/\s\%]+)/g,
    // Patterns with "result" keyword
    /([A-Za-z\s\-\(\)]+)\s*Result:\s*(\d+\.?\d*)\s*([A-Za-z\/\s\%]+)/g,
    // Additional patterns for common lab report formats
    /([A-Za-z\s\-\(\)]+)\s*(\d+\.?\d*)\s*(\d+\-\d+|\<\d+|\>\d+)\s*([A-Za-z\/\s\%]+)/g, // Name Value ReferenceRange Unit
    /([A-Za-z\s\-\(\)]+)\s*(\d+\.?\d*)\s*([A-Za-z\/\s\%]+)\s*(\d+\-\d+|\<\d+|\>\d+)/g, // Name Value Unit ReferenceRange
  ];

  logger.debug("Starting PDF text analysis", { 
    textLength: processedText.length,
    textPreview: processedText.substring(0, 300).replace(/\n/g, " ")
  })

  let matchCount = 0
  let potentialBiomarkers = 0
  let validatedBiomarkers = 0
  let invalidBiomarkers = 0

  const pendingValidations = []

  for (const pattern of patterns) {
    logger.debug(`Trying pattern: ${pattern.source}`)
    let match
    // Reset regex lastIndex to ensure we start from the beginning
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(processedText)) !== null) {
      matchCount++
      try {
        let name, value, unit
        if (pattern.source.startsWith("\\d")) {
          // Pattern with value first
          ;[, value, unit, name] = match
        } else {
          // Pattern with name first
          ;[, name, value, unit] = match
        }

        // Clean and normalize the biomarker name
        name = name.trim()
        potentialBiomarkers++
        
        logger.debug(`Potential match found: "${name}" with value ${value} ${unit}`)
        
        // First do a quick sync validation to reject obvious false positives
        if (isValidBiomarkerNameSync(name, logger)) {
          // For valid candidates, collect them for async database validation
          pendingValidations.push({
            name,
            value: Number.parseFloat(value),
            unit
          })
        } else {
          // Try segmenting the name to see if that helps
          const segmented = segmentWords(name);
          if (segmented !== name && isValidBiomarkerNameSync(segmented, logger)) {
            logger.debug(`Segmented biomarker validated: "${name}" -> "${segmented}"`)
            pendingValidations.push({
              name: segmented,
              value: Number.parseFloat(value),
              unit
            })
          } else {
            invalidBiomarkers++
            logger.debug(`Rejected biomarker (sync): "${name}"`)
          }
        }
      } catch (error) {
        logger.warn("Error parsing biomarker match", { error, match: match[0] })
      }
    }
  }

  logger.info(`Initial pattern matching complete`, {
    matchCount,
    potentialBiomarkers,
    pendingValidations: pendingValidations.length,
    invalidBiomarkers
  })

  // Now perform async database validation on all potential candidates
  const validationPromises = pendingValidations.map(async ({ name, value, unit }) => {
    try {
      const isValid = await isValidBiomarkerName(name, logger)
      
      if (isValid) {
        validatedBiomarkers++
        const code = findBiomarkerCode(name, logger)

        if (code) {
          return {
            code,
            value,
            unit,
          }
        } else {
          logger.debug(`No biomarker code found for validated name: "${name}"`)
        }
      } else {
        invalidBiomarkers++
        logger.debug(`Rejected biomarker (async): "${name}"`)
      }
    } catch (error) {
      logger.warn("Error during async biomarker validation", { error, name })
    }
    
    return null
  })

  // Wait for all validations to complete
  const validatedResults = await Promise.all(validationPromises)
  
  // Filter out null results and add to biomarkers list
  validatedResults.forEach(result => {
    if (result) {
      biomarkers.push(result)
    }
  })

  logger.info("PDF analysis complete", {
    potentialBiomarkers,
    validatedBiomarkers,
    invalidBiomarkers,
    extractedBiomarkers: biomarkers.length
  })

  return biomarkers
}

export async function validatePDF(buffer: ArrayBuffer, logger: Logger): Promise<boolean> {
  try {
    logger.debug("Starting PDF validation")
    const pdf = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    })
    const pageCount = pdf.getPageCount()

    logger.debug("PDF validation successful", { pageCount })
    return true
  } catch (error) {
    logger.error("PDF validation failed", error)
    return false
  }
}


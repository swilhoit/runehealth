import { PDFDocument } from "pdf-lib"
import type { Logger } from "@/lib/logger"
import { findBiomarkerCode } from "@/lib/biomarker-utils"

export interface ExtractedBiomarker {
  code: string
  value: number
  unit: string
}

export async function extractTextFromPDF(buffer: ArrayBuffer, logger: Logger): Promise<string> {
  try {
    logger.debug("Starting PDF extraction with pdf-lib")
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    })

    let text = ""
    const pages = pdfDoc.getPages()

    for (let i = 0; i < pages.length; i++) {
      try {
        const page = pages[i]
        // Get text content directly from the page
        const pageText = await page.getTextContent()
        if (pageText) {
          text += pageText + "\n"
        }
      } catch (pageError) {
        logger.warn(`Failed to extract text from page ${i + 1}`, {
          error: pageError instanceof Error ? pageError.message : String(pageError),
        })
        continue
      }
    }

    if (!text.trim()) {
      throw new Error("No text content extracted from PDF")
    }

    logger.debug("Successfully extracted text", {
      textLength: text.length,
      pageCount: pages.length,
    })

    return text
  } catch (error) {
    logger.error("PDF extraction failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    throw new Error("Failed to extract text from PDF")
  }
}

export async function analyzePDFText(text: string, logger: Logger): Promise<ExtractedBiomarker[]> {
  const biomarkers: ExtractedBiomarker[] = []

  // Common patterns for lab values
  const patterns = [
    // Pattern: "Test Name: 123 mg/dL"
    /([A-Za-z\s]+):\s*(\d+\.?\d*)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L)/g,
    // Pattern: "Test Name 123 mg/dL"
    /([A-Za-z\s]+)\s+(\d+\.?\d*)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L)/g,
    // Pattern: "123 mg/dL Test Name"
    /(\d+\.?\d*)\s*(mg\/dL|ng\/mL|g\/dL|%|U\/L)\s+([A-Za-z\s]+)/g,
  ]

  logger.debug("Starting PDF text analysis", { textLength: text.length })

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
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
        const code = findBiomarkerCode(name)

        if (code) {
          biomarkers.push({
            code,
            value: Number.parseFloat(value),
            unit,
          })

          logger.debug("Extracted biomarker", {
            originalName: name,
            code,
            value,
            unit,
          })
        }
      } catch (error) {
        logger.warn("Failed to process match", {
          match: match[0],
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  logger.info("PDF analysis complete", {
    biomarkersFound: biomarkers.length,
    biomarkers: biomarkers.map((b) => b.code),
  })

  return biomarkers
}

export async function validatePDF(buffer: ArrayBuffer, logger: Logger): Promise<boolean> {
  try {
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


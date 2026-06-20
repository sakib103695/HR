// Extract plain text from an uploaded CV buffer for scoring/search.
// PDF via pdf-parse, DOCX via mammoth. Images are stored but not OCR'd in the MVP
// (scored on form data only) — OCR (tesseract) is a documented follow-up.

export async function extractText(buffer, filename = '', mime = '') {
  const name = (filename || '').toLowerCase()
  try {
    if (name.endsWith('.pdf') || mime.includes('pdf')) {
      // require the lib entry directly to avoid pdf-parse's debug index shim
      const pdf = require('pdf-parse/lib/pdf-parse.js')
      const data = await pdf(buffer)
      return (data.text || '').trim()
    }
    if (name.endsWith('.docx') || mime.includes('officedocument')) {
      const mammoth = require('mammoth')
      const { value } = await mammoth.extractRawText({ buffer })
      return (value || '').trim()
    }
  } catch (e) {
    // Don't fail the application on a bad parse; score on form data instead.
    console.error('extractText failed for', filename, e.message)
  }
  return ''
}

// Parse messy salary input ("30k", "30000", "25", "35,000 BDT", paragraphs) into a number.
export function parseSalary(raw) {
  if (raw == null) return null
  const s = String(raw).toLowerCase().replace(/,/g, '')
  const km = s.match(/(\d+(?:\.\d+)?)\s*k\b/)
  if (km) return Math.round(parseFloat(km[1]) * 1000)
  const nums = s.match(/\d{2,7}/g)
  if (!nums) return null
  // pick the largest plausible monthly figure
  const candidate = Math.max(...nums.map(Number).filter((n) => n >= 1000))
  return Number.isFinite(candidate) && candidate > 0 ? candidate : null
}

// Parse "2.5 years", "8.0", "9" -> decimal years
export function parseYears(raw) {
  if (raw == null) return 0
  const m = String(raw).match(/\d+(?:\.\d+)?/)
  return m ? parseFloat(m[0]) : 0
}

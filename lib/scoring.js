// Explainable scoring engine. Every point traces to matched evidence.
import { getRubric, EXPERIENCE_CURVE } from './rubrics'

function countOccurrences(haystack, needle) {
  if (!needle) return 0
  let count = 0
  let idx = 0
  const n = needle.toLowerCase()
  while ((idx = haystack.indexOf(n, idx)) !== -1) {
    count++
    idx += n.length
  }
  return count
}

function uniqueUrls(text) {
  const urls = text.match(/https?:\/\/[^\s)"'<>]+/gi) || []
  return [...new Set(urls.map((u) => u.replace(/[.,)]+$/, '').toLowerCase()))]
}

function experiencePoints(years) {
  const y = Number(years) || 0
  for (const band of EXPERIENCE_CURVE) {
    if (y >= band.min) return band.points
  }
  return 1
}

/**
 * Score an application.
 * @param {object} app - { roleKey, extractedText, roleAnswer, portfolioUrls[], yearsExperience }
 * @returns {{ total, dimensions: [{dimension, points, max, evidence}] }}
 */
export function scoreApplication(app) {
  const rubric = getRubric(app.roleKey)
  const corpus = [
    app.extractedText || '',
    app.roleAnswer || '',
    (app.portfolioUrls || []).join(' '),
  ].join(' \n ').toLowerCase()

  // --- Depth ---
  let heavyPts = 0
  const heavyHits = []
  for (const term of rubric.heavy.terms) {
    if (corpus.includes(term.toLowerCase())) {
      heavyPts += rubric.heavy.points
      heavyHits.push(term)
    }
  }
  heavyPts = Math.min(heavyPts, rubric.heavy.cap)

  let medPts = 0
  const medHits = []
  for (const term of rubric.medium.terms) {
    if (corpus.includes(term.toLowerCase())) {
      medPts += rubric.medium.points
      medHits.push(term)
    }
  }
  medPts = Math.min(medPts, rubric.medium.cap)

  // Form/answer bonus: substantive role answer with a URL (cap 6)
  let formBonus = 0
  const answer = (app.roleAnswer || '').toLowerCase()
  if (answer.length > 80) formBonus += 3
  if (uniqueUrls(answer).length > 0) formBonus += 3
  formBonus = Math.min(formBonus, 6)

  let depth = Math.min(heavyPts + medPts + formBonus, rubric.depthMax)
  // Fresher penalty: no heavy signals at all
  if (heavyHits.length === 0) depth = Math.max(0, depth - 3)

  // --- Proof / Portfolio ---
  const urls = uniqueUrls(corpus)
  let urlBreadth = Math.min(urls.length * 1.5, 8)

  let signalPts = 0
  const signalHits = []
  for (const sig of rubric.proofSignals) {
    const occ = countOccurrences(corpus, sig.match)
    if (occ > 0) {
      signalPts += sig.points
      signalHits.push(sig.match)
    }
  }
  signalPts = Math.min(signalPts, 18)

  // Live (non-social, non-marketplace) project URLs
  const liveUrls = urls.filter(
    (u) =>
      !/(facebook|instagram|tiktok|linkedin|twitter|youtube|behance|dribbble|github|wordpress\.org|themeforest|codecanyon|envato|upwork|fiverr|stackoverflow)/.test(
        u
      )
  )
  const liveProject = Math.min(liveUrls.length * 2, 6)

  const proof = Math.min(urlBreadth + signalPts + liveProject, rubric.proofMax)

  // --- Experience ---
  const exp = experiencePoints(app.yearsExperience)

  const total = Math.round((depth + proof + exp) * 10) / 10

  return {
    total,
    dimensions: [
      {
        dimension: 'technical_depth',
        points: Math.round(depth * 10) / 10,
        max: rubric.depthMax,
        evidence: { heavy: heavyHits, medium: medHits, formBonus },
      },
      {
        dimension: 'portfolio',
        points: Math.round(proof * 10) / 10,
        max: rubric.proofMax,
        evidence: { signals: signalHits, uniqueUrls: urls.length, liveProjects: liveUrls.length },
      },
      {
        dimension: 'experience',
        points: exp,
        max: rubric.expMax,
        evidence: { years: Number(app.yearsExperience) || 0 },
      },
    ],
  }
}

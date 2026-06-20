import ExcelJS from 'exceljs'
import { applications } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'
import { getRubric } from '../../../lib/rubrics'

// GET /api/admin/export?job=slug&stage=applied -> XLSX download
async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const { job, stage } = req.query
    const filter = {}
    if (job) filter.jobSlug = job
    if (stage) filter.stage = stage

    const col = await applications()
    const list = await col
      .find(filter, { projection: { extractedText: 0 } })
      .sort({ autoScore: -1, createdAt: -1 })
      .toArray()

    const wb = new ExcelJS.Workbook()
    wb.creator = 'Instaquirk Hiring Platform'

    // --- Ranking sheet ---
    const ws = wb.addWorksheet('Ranking')
    ws.columns = [
      { header: 'Rank', key: 'rank', width: 6 },
      { header: 'Name', key: 'name', width: 26 },
      { header: 'Score /100', key: 'score', width: 11 },
      { header: 'Depth /50', key: 'depth', width: 10 },
      { header: 'Portfolio /30', key: 'portfolio', width: 12 },
      { header: 'Exp /20', key: 'exp', width: 9 },
      { header: 'Years', key: 'years', width: 8 },
      { header: 'Expected Salary', key: 'salary', width: 16 },
      { header: 'Stage', key: 'stage', width: 16 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Current Position', key: 'position', width: 22 },
      { header: 'Portfolio Links', key: 'links', width: 40 },
      { header: 'CV File', key: 'cv', width: 26 },
      { header: 'Applied At', key: 'applied', width: 20 },
    ]
    ws.getRow(1).font = { bold: true }

    const dim = (a, name) => (a.scoreBreakdown || []).find((d) => d.dimension === name)?.points ?? ''
    list.forEach((a, i) => {
      ws.addRow({
        rank: i + 1,
        name: a.fullName,
        score: a.autoScore,
        depth: dim(a, 'technical_depth'),
        portfolio: dim(a, 'portfolio'),
        exp: dim(a, 'experience'),
        years: a.yearsExperience,
        salary: a.expectedSalaryRaw || a.expectedSalaryAmount || '',
        stage: a.stage,
        email: a.email,
        phone: a.phone,
        position: a.currentPosition,
        links: (a.portfolioUrls || []).join('  '),
        cv: a.cvFilename || '',
        applied: a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 16).replace('T', ' ') : '',
      })
    })

    // --- Methodology sheet (self-documenting, from the rubric) ---
    const roleKey = list[0]?.roleKey || 'wordpress'
    const rubric = getRubric(roleKey)
    const ms = wb.addWorksheet('Scoring Methodology')
    ms.getColumn(1).width = 100
    const lines = [
      `Scoring Methodology — ${rubric.label}`,
      '',
      'Each candidate is scored 0–100, computed automatically from CV text + form answers + portfolio links.',
      '',
      `Technical / Domain Depth: 0–${rubric.depthMax}`,
      `  Heavy signals (${rubric.heavy.points} pts each, cap ${rubric.heavy.cap}): ${rubric.heavy.terms.join(', ')}`,
      `  Medium signals (${rubric.medium.points} pts each, cap ${rubric.medium.cap}): ${rubric.medium.terms.join(', ')}`,
      '  Form bonus (cap 6): substantive role answer with a URL.',
      '  Small penalty if no heavy signals appear.',
      '',
      `Portfolio / Proof: 0–${rubric.proofMax}`,
      '  Up to 8 for breadth of unique URLs.',
      `  Strong-signal bonuses (cap 18): ${rubric.proofSignals.map((s) => `${s.match} (+${s.points})`).join(', ')}`,
      '  Up to 6 for live (non-marketplace, non-social) project URLs.',
      '',
      'Years of Experience: 0–20 (7+ → 20, 5–6 → 16, 4 → 13, 3 → 10, 2 → 7, 1 → 4, <1 → 1).',
      '',
      'Note: CV keyword scoring is a coarse shortlist filter. The story-driven round provides the real signal.',
    ]
    lines.forEach((l) => ms.addRow([l]))

    const buf = await wb.xlsx.writeBuffer()
    const fname = `instaquirk-${job || 'all'}-${stage || 'all'}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
    res.send(Buffer.from(buf))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export default requireAdmin(handler)

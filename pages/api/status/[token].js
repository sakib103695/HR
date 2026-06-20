import { applications } from '../../../lib/db'

const STAGE_LABELS = {
  applied: 'Application received',
  screened: 'Under review',
  round_invited: 'Invited to the Instaquirk Challenge',
  round_submitted: 'Challenge submitted — under review',
  interview: 'Invited to interview',
  offer: 'Offer extended',
  hired: 'Hired 🎉',
  rejected: 'Not moving forward this time',
  withdrawn: 'Withdrawn',
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const col = await applications()
    const app = await col.findOne(
      { statusToken: req.query.token },
      { projection: { fullName: 1, jobTitle: 1, stage: 1, createdAt: 1 } }
    )
    if (!app) return res.status(404).json({ error: 'Not found' })
    res.json({
      fullName: app.fullName,
      jobTitle: app.jobTitle,
      stage: app.stage,
      stageLabel: STAGE_LABELS[app.stage] || app.stage,
      appliedAt: app.createdAt,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

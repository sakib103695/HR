import { jobs } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const col = await jobs()
    const job = await col.findOne({ slug: req.query.slug })
    if (!job) return res.status(404).json({ error: 'Job not found' })
    res.json({ job: { ...job, _id: job._id.toString() } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

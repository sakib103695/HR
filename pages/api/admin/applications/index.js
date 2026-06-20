import { applications } from '../../../../lib/db'
import { requireAdmin } from '../../../../lib/auth'

// GET /api/admin/applications?job=&stage=&q=&sort=&page=&pageSize=
async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const { job, stage, q, sort } = req.query
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const pageSize = Math.min(500, Math.max(1, parseInt(req.query.pageSize, 10) || 25))

    const filter = {}
    if (job) filter.jobSlug = job
    if (stage) filter.stage = stage
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { extractedText: { $regex: q, $options: 'i' } },
      ]
    }

    const sortSpec = sort === 'recent' ? { createdAt: -1 } : { autoScore: -1, createdAt: -1 }

    const col = await applications()
    const total = await col.countDocuments(filter)
    const skip = (page - 1) * pageSize
    const list = await col
      .find(filter, { projection: { extractedText: 0 } })
      .sort(sortSpec)
      .skip(skip)
      .limit(pageSize)
      .toArray()

    res.json({
      count: list.length,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      applications: list.map((a, i) => ({
        ...a,
        _id: a._id.toString(),
        rank: skip + i + 1,
      })),
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export default requireAdmin(handler)

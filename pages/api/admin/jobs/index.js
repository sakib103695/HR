import { jobs, applications, slugify, JOB_STATUSES } from '../../../../lib/db'
import { requireAdmin } from '../../../../lib/auth'

function toDateOrNull(v) {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

async function uniqueSlug(col, base) {
  let slug = base || 'job'
  let n = 1
  while (await col.findOne({ slug })) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}

async function handler(req, res) {
  const col = await jobs()

  if (req.method === 'GET') {
    const list = await col.find({}).sort({ createdAt: -1 }).toArray()
    const appCol = await applications()
    const counts = await appCol.aggregate([{ $group: { _id: '$jobSlug', n: { $sum: 1 } } }]).toArray()
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.n]))
    return res.json({
      jobs: list.map((j) => ({ ...j, _id: j._id.toString(), applicantCount: countMap[j.slug] || 0 })),
    })
  }

  if (req.method === 'POST') {
    const b = req.body || {}
    if (!b.title || !b.roleKey) {
      return res.status(400).json({ error: 'Title and role type are required.' })
    }
    const status = JOB_STATUSES.includes(b.status) ? b.status : 'draft'
    const slug = await uniqueSlug(col, b.slug ? slugify(b.slug) : slugify(b.title))
    const now = new Date()
    const doc = {
      slug,
      title: b.title,
      roleKey: b.roleKey,
      hook: b.hook || '',
      employmentType: b.employmentType || 'Full-time',
      locationMode: b.locationMode || 'Remote',
      salaryRange: b.salaryRange || '',
      roleAnswerLabel: b.roleAnswerLabel || 'Tell us why you’re a great fit for this role.',
      descriptionMd: b.descriptionMd || '',
      status,
      publishAt: toDateOrNull(b.publishAt),
      closeAt: toDateOrNull(b.closeAt),
      createdAt: now,
      updatedAt: now,
    }
    const result = await col.insertOne(doc)
    return res.status(201).json({ ok: true, id: result.insertedId.toString(), slug })
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

import { ObjectId } from 'mongodb'
import { jobs, applications, slugify, JOB_STATUSES } from '../../../../lib/db'
import { requireAdmin } from '../../../../lib/auth'

function toDateOrNull(v) {
  if (v === '' || v == null) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

const EDITABLE = [
  'title', 'roleKey', 'hook', 'employmentType', 'locationMode',
  'salaryRange', 'roleAnswerLabel', 'descriptionMd',
]

async function handler(req, res) {
  let _id
  try {
    _id = new ObjectId(req.query.id)
  } catch {
    return res.status(400).json({ error: 'Bad id' })
  }
  const col = await jobs()

  if (req.method === 'GET') {
    const job = await col.findOne({ _id })
    if (!job) return res.status(404).json({ error: 'Not found' })
    const appCol = await applications()
    const applicantCount = await appCol.countDocuments({ jobSlug: job.slug })
    return res.json({ job: { ...job, _id: job._id.toString(), applicantCount } })
  }

  if (req.method === 'PUT') {
    const b = req.body || {}
    const job = await col.findOne({ _id })
    if (!job) return res.status(404).json({ error: 'Not found' })

    const set = { updatedAt: new Date() }
    for (const k of EDITABLE) if (k in b) set[k] = b[k]
    if ('status' in b && JOB_STATUSES.includes(b.status)) set.status = b.status
    if ('publishAt' in b) set.publishAt = toDateOrNull(b.publishAt)
    if ('closeAt' in b) set.closeAt = toDateOrNull(b.closeAt)
    // Optional slug change (kept unique). Applications reference jobSlug, so warn-only in UI.
    if (b.slug && slugify(b.slug) !== job.slug) {
      const newSlug = slugify(b.slug)
      const clash = await col.findOne({ slug: newSlug, _id: { $ne: _id } })
      if (clash) return res.status(409).json({ error: 'That slug is already in use.' })
      set.slug = newSlug
    }

    await col.updateOne({ _id }, { $set: set })
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const job = await col.findOne({ _id })
    if (!job) return res.status(404).json({ error: 'Not found' })
    const appCol = await applications()
    const n = await appCol.countDocuments({ jobSlug: job.slug })
    if (n > 0 && req.query.force !== '1') {
      return res.status(409).json({ error: `This job has ${n} applicant(s). Re-send with force to delete.` , applicantCount: n })
    }
    await col.deleteOne({ _id })
    return res.json({ ok: true })
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

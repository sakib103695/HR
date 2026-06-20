import fs from 'fs'
import crypto from 'crypto'
import formidable from 'formidable'
import { jobs, applications, ensureIndexes, isJobLive } from '../../../lib/db'
import { getBucket } from '../../../lib/mongodb'
import { extractText, parseSalary, parseYears } from '../../../lib/extract'
import { scoreApplication } from '../../../lib/scoring'

export const config = { api: { bodyParser: false } }

const ALLOWED = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg']

function first(v) {
  return Array.isArray(v) ? v[0] : v
}

function splitUrls(text) {
  if (!text) return []
  return [...new Set(String(text).split(/[\s,;\n]+/).map((s) => s.trim()).filter(Boolean))]
}

async function uploadToGridFS(filepath, filename, mimetype) {
  const bucket = await getBucket()
  return new Promise((resolve, reject) => {
    const upload = bucket.openUploadStream(filename, { contentType: mimetype })
    fs.createReadStream(filepath)
      .pipe(upload)
      .on('error', reject)
      .on('finish', () => resolve(upload.id))
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    await ensureIndexes()
    const form = formidable({ maxFileSize: 12 * 1024 * 1024, keepExtensions: true })
    const [fields, files] = await form.parse(req)

    const slug = first(fields.jobSlug)
    const fullName = first(fields.fullName)
    const email = first(fields.email)
    if (!slug || !fullName || !email) {
      return res.status(400).json({ error: 'Missing required fields (name, email, job).' })
    }

    const jobCol = await jobs()
    const job = await jobCol.findOne({ slug })
    if (!job || !isJobLive(job)) {
      return res.status(404).json({ error: 'This job is not accepting applications.' })
    }

    // Handle CV file
    const cvFile = first(files.cv)
    let cvFileId = null
    let cvFilename = null
    let extractedText = ''
    if (cvFile && cvFile.filepath) {
      const orig = cvFile.originalFilename || 'cv'
      const ext = '.' + (orig.split('.').pop() || '').toLowerCase()
      if (!ALLOWED.includes(ext)) {
        return res.status(400).json({ error: 'CV must be PDF, DOCX, PNG, or JPG.' })
      }
      const buffer = fs.readFileSync(cvFile.filepath)
      extractedText = await extractText(buffer, orig, cvFile.mimetype || '')
      cvFileId = await uploadToGridFS(cvFile.filepath, orig, cvFile.mimetype || '')
      cvFilename = orig
      try { fs.unlinkSync(cvFile.filepath) } catch {}
    }

    const yearsExperience = parseYears(first(fields.yearsExperience))
    const expectedSalaryAmount = parseSalary(first(fields.expectedSalary))
    const portfolioUrls = splitUrls(first(fields.portfolio))
    const roleAnswer = first(fields.roleAnswer) || ''

    const scored = scoreApplication({
      roleKey: job.roleKey,
      extractedText,
      roleAnswer,
      portfolioUrls,
      yearsExperience,
    })

    const statusToken = crypto.randomBytes(16).toString('hex')
    const now = new Date()
    const doc = {
      jobSlug: slug,
      jobTitle: job.title,
      roleKey: job.roleKey,
      fullName,
      email: String(email).toLowerCase(),
      phone: first(fields.phone) || '',
      currentOrg: first(fields.currentOrg) || '',
      currentPosition: first(fields.currentPosition) || '',
      yearsExperience,
      expectedSalaryAmount,
      expectedSalaryRaw: first(fields.expectedSalary) || '',
      portfolioUrls,
      roleAnswer,
      cvFileId,
      cvFilename,
      extractedText,
      autoScore: scored.total,
      scoreBreakdown: scored.dimensions,
      stage: 'applied',
      statusToken,
      source: first(fields.source) || 'direct',
      stageEvents: [{ from: null, to: 'applied', actor: 'candidate', at: now }],
      createdAt: now,
      updatedAt: now,
    }

    const appCol = await applications()
    const result = await appCol.insertOne(doc)

    res.status(201).json({
      ok: true,
      applicationId: result.insertedId.toString(),
      statusToken,
      score: scored.total,
    })
  } catch (e) {
    console.error('application submit error', e)
    res.status(500).json({ error: e.message || 'Submission failed' })
  }
}

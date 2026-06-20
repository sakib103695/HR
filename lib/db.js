// Thin data-access helpers over MongoDB collections.
import { getDb } from './mongodb'

export const STAGES = [
  'applied',
  'screened',
  'round_invited',
  'round_submitted',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
]

// Forward-only: an application may advance one stage at a time, or jump to a terminal state.
export const STAGE_FLOW = {
  applied: 'screened',
  screened: 'round_invited',
  round_invited: 'round_submitted',
  round_submitted: 'interview',
  interview: 'offer',
  offer: 'hired',
}

export const TERMINAL = ['rejected', 'withdrawn', 'hired']

export async function jobs() {
  return (await getDb()).collection('jobs')
}

export async function applications() {
  return (await getDb()).collection('applications')
}

// Ensure helpful indexes exist (idempotent).
export async function ensureIndexes() {
  const j = await jobs()
  await j.createIndex({ slug: 1 }, { unique: true })
  const a = await applications()
  await a.createIndex({ jobSlug: 1, stage: 1 })
  await a.createIndex({ statusToken: 1 }, { unique: true })
  await a.createIndex({ email: 1, jobSlug: 1 })
}

export const JOB_STATUSES = ['draft', 'open', 'paused', 'closed']

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Mongo filter for jobs the public should see: status open AND inside the publish/close window.
// (Legacy jobs without publishAt/closeAt fields are treated as always-in-window.)
export function publicJobQuery(now = new Date()) {
  return {
    status: 'open',
    $and: [
      { $or: [{ publishAt: null }, { publishAt: { $exists: false } }, { publishAt: { $lte: now } }] },
      { $or: [{ closeAt: null }, { closeAt: { $exists: false } }, { closeAt: { $gte: now } }] },
    ],
  }
}

// Is this single job doc live (publicly visible + accepting applications) right now?
export function isJobLive(job, now = new Date()) {
  if (!job || job.status !== 'open') return false
  if (job.publishAt && new Date(job.publishAt) > now) return false
  if (job.closeAt && new Date(job.closeAt) < now) return false
  return true
}

// Human-friendly lifecycle label for the admin UI.
export function jobLifecycle(job, now = new Date()) {
  if (job.status === 'draft') return 'Draft'
  if (job.status === 'paused') return 'Paused'
  if (job.status === 'closed') return 'Closed'
  // status === 'open'
  if (job.publishAt && new Date(job.publishAt) > now) return 'Scheduled'
  if (job.closeAt && new Date(job.closeAt) < now) return 'Deadline passed'
  return 'Live'
}

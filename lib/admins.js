// Admin accounts stored in MongoDB with scrypt-hashed passwords (no external dep).
import crypto from 'crypto'
import { getDb } from './mongodb'
import config from './config'

export async function admins() {
  const col = (await getDb()).collection('admins')
  await col.createIndex({ email: 1 }, { unique: true })
  return col
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function checkPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const computed = crypto.scryptSync(password, salt, 64).toString('hex')
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(computed, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function upsertAdmin(email, password) {
  const col = await admins()
  const e = String(email).toLowerCase().trim()
  await col.updateOne(
    { email: e },
    {
      $set: { email: e, passwordHash: hashPassword(password), updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  )
  return e
}

export async function verifyAdmin(email, password) {
  const e = String(email || '').toLowerCase().trim()
  if (!e || !password) return false

  const col = await admins()
  const admin = await col.findOne({ email: e })
  if (admin && checkPassword(password, admin.passwordHash)) return true

  // Bootstrap fallback: the fixed config credentials work even before
  // `npm run create-admin` is run, so you can never lock yourself out.
  const cfgEmail = (config.ADMIN_EMAIL || '').toLowerCase().trim()
  const cfgPw = config.ADMIN_PASSWORD
  if (cfgEmail && cfgPw && e === cfgEmail && password === cfgPw) return true

  return false
}

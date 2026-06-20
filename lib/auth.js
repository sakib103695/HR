// Minimal admin session: a signed cookie (HMAC). No external auth dependency for the MVP.
import crypto from 'crypto'
import config from './config'

const SECRET = config.ADMIN_SESSION_SECRET || 'dev-secret-change-me'
const COOKIE = 'hr_admin'
const MAX_AGE = 60 * 60 * 12 // 12h

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex')
}

export function makeToken() {
  const issued = String(Date.now())
  return `${issued}.${sign(issued)}`
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false
  const [issued, sig] = token.split('.')
  if (!issued || !sig) return false
  if (sign(issued) !== sig) return false
  if (Date.now() - Number(issued) > MAX_AGE * 1000) return false
  return true
}

export function setAuthCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}`
  )
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
}

function readCookie(req) {
  const raw = req.headers.cookie || ''
  const match = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`))
  return match ? match.slice(COOKIE.length + 1) : null
}

export function isAuthed(req) {
  return verifyToken(readCookie(req))
}

// Wrap an API handler so it 401s unless authed.
export function requireAdmin(handler) {
  return async (req, res) => {
    if (!isAuthed(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return handler(req, res)
  }
}

import { makeToken, setAuthCookie } from '../../../lib/auth'
import { verifyAdmin } from '../../../lib/admins'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  try {
    const ok = await verifyAdmin(email, password)
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password' })
    setAuthCookie(res, makeToken())
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

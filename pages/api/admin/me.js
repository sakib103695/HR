import { isAuthed } from '../../../lib/auth'

export default function handler(req, res) {
  res.json({ authed: isAuthed(req) })
}

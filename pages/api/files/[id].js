import { ObjectId } from 'mongodb'
import { getBucket } from '../../../lib/mongodb'
import { isAuthed } from '../../../lib/auth'

// Stream a CV from GridFS. Admin-only (CVs are PII).
export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' })
  let _id
  try {
    _id = new ObjectId(req.query.id)
  } catch {
    return res.status(400).json({ error: 'Bad id' })
  }
  try {
    const bucket = await getBucket()
    const files = await bucket.find({ _id }).toArray()
    if (!files.length) return res.status(404).json({ error: 'File not found' })
    const file = files[0]
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`)
    bucket
      .openDownloadStream(_id)
      .on('error', () => res.status(500).end())
      .pipe(res)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

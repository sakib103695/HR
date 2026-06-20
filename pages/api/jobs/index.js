import { jobs, publicJobQuery } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const col = await jobs()
    const list = await col
      .find(publicJobQuery(), { projection: { descriptionMd: 0 } })
      .sort({ createdAt: 1 })
      .toArray()
    res.json({ jobs: list.map((j) => ({ ...j, _id: j._id.toString() })) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

import { ObjectId } from 'mongodb'
import { applications, STAGE_FLOW, STAGES } from '../../../../lib/db'
import { requireAdmin } from '../../../../lib/auth'

async function handler(req, res) {
  let _id
  try {
    _id = new ObjectId(req.query.id)
  } catch {
    return res.status(400).json({ error: 'Bad id' })
  }
  const col = await applications()

  if (req.method === 'GET') {
    const app = await col.findOne({ _id })
    if (!app) return res.status(404).json({ error: 'Not found' })
    return res.json({ application: { ...app, _id: app._id.toString() } })
  }

  if (req.method === 'POST') {
    const { action, reason, toStage } = req.body || {}
    const app = await col.findOne({ _id }, { projection: { stage: 1 } })
    if (!app) return res.status(404).json({ error: 'Not found' })

    let next
    if (action === 'advance') {
      next = STAGE_FLOW[app.stage]
      if (!next) return res.status(400).json({ error: `Cannot advance from ${app.stage}` })
    } else if (action === 'reject') {
      next = 'rejected'
    } else if (action === 'set' && STAGES.includes(toStage)) {
      next = toStage
    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }

    const now = new Date()
    await col.updateOne(
      { _id },
      {
        $set: { stage: next, updatedAt: now },
        $push: {
          stageEvents: { from: app.stage, to: next, actor: 'admin', reason: reason || null, at: now },
        },
      }
    )
    return res.json({ ok: true, stage: next })
  }

  return res.status(405).end()
}

export default requireAdmin(handler)

// Seed the 5 launch jobs into MongoDB. Run: npm run seed
// Self-contained CommonJS (no Next webpack) — reads .env.local manually.
const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

function loadEnv() {
  const p = path.join(__dirname, '..', '.env.local')
  const env = {}
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) env[m[1]] = m[2].trim()
    }
  }
  return { ...env, ...process.env }
}

async function main() {
  const env = loadEnv()
  const uri = env.MONGODB_URI
  const dbName = env.MONGODB_DB_NAME || 'hr_instaquirk'
  if (!uri) throw new Error('MONGODB_URI not set')

  const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'jobs.json'), 'utf8'))
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const db = client.db(dbName)
  const col = db.collection('jobs')

  await col.createIndex({ slug: 1 }, { unique: true })
  await db.collection('applications').createIndex({ jobSlug: 1, stage: 1 })
  await db.collection('applications').createIndex({ statusToken: 1 }, { unique: true })

  const now = new Date()
  for (const job of jobs) {
    await col.updateOne(
      { slug: job.slug },
      { $set: { ...job, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    )
    console.log('  upserted:', job.slug)
  }

  const count = await col.countDocuments()
  console.log(`Done. ${count} jobs in '${dbName}'.`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

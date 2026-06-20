// Create or reset an admin account. Run: npm run create-admin
//   - defaults to ADMIN_EMAIL / ADMIN_PASSWORD from .env.local
//   - or pass on the CLI:  node scripts/create-admin.js you@email.com YourPassword
// Self-contained CommonJS (no Next webpack).
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  const env = loadEnv()
  const email = (process.argv[2] || env.ADMIN_EMAIL || '').toLowerCase().trim()
  const password = process.argv[3] || env.ADMIN_PASSWORD
  if (!email || !password) {
    console.error('Need an email and password. Set ADMIN_EMAIL/ADMIN_PASSWORD in .env.local, or:')
    console.error('  node scripts/create-admin.js you@email.com YourPassword')
    process.exit(1)
  }
  const uri = env.MONGODB_URI
  const dbName = env.MONGODB_DB_NAME || 'hr_instaquirk'
  if (!uri) throw new Error('MONGODB_URI not set')

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const col = client.db(dbName).collection('admins')
  await col.createIndex({ email: 1 }, { unique: true })

  const existing = await col.findOne({ email })
  await col.updateOne(
    { email },
    {
      $set: { email, passwordHash: hashPassword(password), updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  )

  console.log(`${existing ? 'Updated' : 'Created'} admin account:`)
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)
  console.log('Sign in at  http://localhost:3000/admin')
  await client.close()
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})

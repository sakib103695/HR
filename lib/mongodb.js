// Cached MongoDB connection so Next.js dev hot-reload doesn't open a new pool every time.
import { MongoClient, GridFSBucket } from 'mongodb'
import config from './config'

const uri = config.MONGODB_URI
const dbName = config.MONGODB_DB_NAME || 'hr_instaquirk'

if (!uri) {
  throw new Error('Missing MONGODB_URI in lib/config.js')
}

let cached = global._mongo
if (!cached) {
  cached = global._mongo = { client: null, promise: null }
}

export async function getClient() {
  if (cached.client) return cached.client
  if (!cached.promise) {
    cached.promise = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    }).connect()
  }
  cached.client = await cached.promise
  return cached.client
}

export async function getDb() {
  const client = await getClient()
  return client.db(dbName)
}

export async function getBucket() {
  const db = await getDb()
  return new GridFSBucket(db, { bucketName: 'cvs' })
}

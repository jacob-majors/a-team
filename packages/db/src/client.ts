import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

let _db: DrizzleDb | null = null

export function getDb(): DrizzleDb {
  if (_db) return _db
  const raw = process.env['DATABASE_URL']
  if (!raw) throw new Error('DATABASE_URL is not set')
  const connectionString = raw.replace(/^["']|["']$/g, '')
  const client = postgres(connectionString, { prepare: false })
  _db = drizzle(client, { schema })
  return _db
}

export const db = new Proxy({} as DrizzleDb, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getDb() as any)[prop]
  },
})

export type DB = typeof db

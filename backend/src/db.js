import { createClient } from '@libsql/client'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCHEMA_SQL } from './schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const url =
  process.env.TURSO_DATABASE_URL ||
  `file:${path.join(__dirname, '..', 'data', 'market.sqlite')}`

if (url.startsWith('file:')) {
  fs.mkdirSync(path.dirname(url.slice('file:'.length)), { recursive: true })
}

export const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

await db.execute(SCHEMA_SQL)

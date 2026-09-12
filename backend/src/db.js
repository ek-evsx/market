import { createClient } from '@libsql/client'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCHEMA_STATEMENTS } from './schema.js'

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

for (const statement of SCHEMA_STATEMENTS) {
  await db.execute(statement)
}

// Lightweight migration: add columns introduced after a table already existed
// (CREATE TABLE IF NOT EXISTS is a no-op on an existing table).
async function ensureColumn(table, column, definition) {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  } catch (err) {
    if (!/duplicate column name/i.test(err.message)) throw err
  }
}

await ensureColumn('carts', 'user_id', 'TEXT REFERENCES users(id)')
await ensureColumn('items', 'specs', 'TEXT')

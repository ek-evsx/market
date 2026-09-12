import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCHEMA_STATEMENTS } from '../src/schema.js'
import { buildItems } from './seed-data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const TABLES_NEWEST_FIRST = ['order_items', 'orders', 'cart_items', 'carts', 'items']

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function buildSql() {
  const items = buildItems()

  const values = items
    .map(
      (item) =>
        `  (${sqlString(item.name)}, ${sqlString(item.title)}, ${sqlString(item.description)}, ` +
        `${sqlString(item.category)}, ${item.price}, ${sqlString(item.currency)}, ` +
        `${sqlString(item.imageUrl)}, ${item.available}, ${sqlString(JSON.stringify(item.specs))})`
    )
    .join(',\n')

  const drops = TABLES_NEWEST_FIRST.map((t) => `DROP TABLE IF EXISTS ${t};`).join('\n')
  const creates = SCHEMA_STATEMENTS.map(
    (stmt) => `${stmt.trim().replace('CREATE TABLE IF NOT EXISTS', 'CREATE TABLE')};`
  ).join('\n\n')

  return `${drops}

${creates}

INSERT INTO items (name, title, description, category, price, currency, image_url, available, specs) VALUES
${values};
`
}

const outputPath = path.join(__dirname, 'seed.sql')
fs.writeFileSync(outputPath, buildSql())
console.log(`Wrote ${outputPath}`)

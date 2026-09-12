import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCHEMA_SQL } from '../src/schema.js'
import { buildItems } from './seed-data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
        `${sqlString(item.imageUrl)}, ${item.available})`
    )
    .join(',\n')

  return `DROP TABLE IF EXISTS items;

${SCHEMA_SQL.trim().replace('CREATE TABLE IF NOT EXISTS', 'CREATE TABLE')};

INSERT INTO items (name, title, description, category, price, currency, image_url, available) VALUES
${values};
`
}

const outputPath = path.join(__dirname, 'seed.sql')
fs.writeFileSync(outputPath, buildSql())
console.log(`Wrote ${outputPath}`)

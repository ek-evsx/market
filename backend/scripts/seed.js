import { db } from '../src/db.js'
import { SCHEMA_SQL } from '../src/schema.js'
import { buildItems } from './seed-data.js'

async function seed() {
  await db.execute('DROP TABLE IF EXISTS items')
  await db.execute(SCHEMA_SQL)

  const items = buildItems()

  for (const item of items) {
    await db.execute({
      sql: `INSERT INTO items (name, title, description, category, price, currency, image_url, available)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.name,
        item.title,
        item.description,
        item.category,
        item.price,
        item.currency,
        item.imageUrl,
        item.available,
      ],
    })
  }

  console.log(`Seeded ${items.length} items.`)
}

seed()

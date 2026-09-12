import { db } from '../src/db.js'
import { SCHEMA_STATEMENTS } from '../src/schema.js'
import { buildItems } from './seed-data.js'

async function seed() {
  await db.execute('DROP TABLE IF EXISTS order_items')
  await db.execute('DROP TABLE IF EXISTS orders')
  await db.execute('DROP TABLE IF EXISTS cart_items')
  await db.execute('DROP TABLE IF EXISTS carts')
  await db.execute('DROP TABLE IF EXISTS items')

  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement)
  }

  const items = buildItems()

  for (const item of items) {
    await db.execute({
      sql: `INSERT INTO items (name, title, description, category, price, currency, image_url, available, specs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.name,
        item.title,
        item.description,
        item.category,
        item.price,
        item.currency,
        item.imageUrl,
        item.available,
        JSON.stringify(item.specs),
      ],
    })
  }

  console.log(`Seeded ${items.length} items (carts and orders reset).`)
}

seed()

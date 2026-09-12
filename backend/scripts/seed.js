import { db, SCHEMA_SQL } from '../src/db.js'

const CATEGORIES = [
  {
    key: 'phones',
    label: 'Mobile Phones',
    color: '4F46E5',
    brands: ['Zenith', 'Orion', 'Nimbus', 'Solace', 'Vertex'],
    priceRange: [299, 1299],
    count: 9,
  },
  {
    key: 'earphones',
    label: 'Earphones',
    color: '059669',
    brands: ['EchoBuds', 'SoundWave', 'AudioLite', 'PulseAudio'],
    priceRange: [19, 249],
    count: 8,
  },
  {
    key: 'laptops',
    label: 'Laptops',
    color: '2563EB',
    brands: ['StreamBook', 'CoreBook', 'FlexBook', 'ProBook'],
    priceRange: [499, 2499],
    count: 9,
  },
  {
    key: 'tablets',
    label: 'Tablets',
    color: '9333EA',
    brands: ['TabLine', 'PadPro', 'SlateX'],
    priceRange: [199, 999],
    count: 8,
  },
  {
    key: 'tvs',
    label: 'TVs',
    color: 'DC2626',
    brands: ['VisionTV', 'ClearView', 'UltraScreen'],
    priceRange: [299, 1999],
    count: 8,
  },
  {
    key: 'smartwatches',
    label: 'Smartwatches',
    color: 'D97706',
    brands: ['PulseWatch', 'TimeFit', 'ChronoWear'],
    priceRange: [49, 499],
    count: 8,
  },
]

const DESCRIPTORS = ['Brand New', 'Like New', 'Great Condition', 'Open Box', 'Certified Refurbished']
const FEATURES = [
  'long battery life',
  'premium build quality',
  'fast performance',
  'crisp display',
  'great value for money',
  'latest generation hardware',
  'sleek, lightweight design',
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

function buildItems() {
  const items = []

  for (const cat of CATEGORIES) {
    for (let i = 0; i < cat.count; i++) {
      const brand = pick(cat.brands)
      const model = randomInt(1, 15)
      const descriptor = pick(DESCRIPTORS)
      const name = `${brand} ${model}`
      const title = `${name} - ${descriptor}`
      const description = `${name} in ${descriptor.toLowerCase()} condition, with ${pick(FEATURES)} and ${pick(FEATURES)}.`
      const [min, max] = cat.priceRange
      const price = Number((randomInt(min * 100, max * 100) / 100).toFixed(2))
      const available = randomInt(0, 40)
      const imageUrl = `https://placehold.co/600x400/${cat.color}/ffffff?text=${encodeURIComponent(name)}`

      items.push({
        name,
        title,
        description,
        category: cat.key,
        price,
        currency: 'USD',
        imageUrl,
        available,
      })
    }
  }

  return items
}

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

const CATEGORIES = [
  {
    key: 'phones',
    label: 'Mobile Phones',
    brands: ['Zenith', 'Orion', 'Nimbus', 'Solace', 'Vertex'],
    priceRange: [299, 1299],
    count: 9,
    photos: [
      '1592890288564-76628a30a657',
      '1511707171634-5f897ff02aa9',
      '1598327105666-5b89351aff97',
      '1523206489230-c012c64b2b48',
      '1580910051074-3eb694886505',
      '1512428559087-560fa5ceab42',
    ],
  },
  {
    key: 'earphones',
    label: 'Earphones',
    brands: ['EchoBuds', 'SoundWave', 'AudioLite', 'PulseAudio'],
    priceRange: [19, 249],
    count: 8,
    photos: [
      '1572569511254-d8f925fe2cbb',
      '1590658268037-6bf12165a8df',
      '1606741965326-cb990ae01bb2',
      '1600294037681-c80b4cb5b434',
      '1580477371194-4593e3c7c6cf',
      '1610438235354-a6ae5528385c',
    ],
  },
  {
    key: 'laptops',
    label: 'Laptops',
    brands: ['StreamBook', 'CoreBook', 'FlexBook', 'ProBook'],
    priceRange: [499, 2499],
    count: 9,
    photos: [
      '1541807084-5c52b6b3adef',
      '1525547719571-a2d4ac8945e2',
      '1486312338219-ce68d2c6f44d',
      '1499914485622-a88fac536970',
      '1498050108023-c5249f4df085',
      '1515378791036-0648a3ef77b2',
    ],
  },
  {
    key: 'tablets',
    label: 'Tablets',
    brands: ['TabLine', 'PadPro', 'SlateX'],
    priceRange: [199, 999],
    count: 8,
    photos: [
      '1561154464-82e9adf32764',
      '1542751110-97427bbecf20',
      '1577375729152-4c8b5fcda381',
      '1557825835-70d97c4aa567',
      '1585790050230-5dd28404ccb9',
      '1612367990403-73ef3e67bc4f',
    ],
  },
  {
    key: 'tvs',
    label: 'TVs',
    brands: ['VisionTV', 'ClearView', 'UltraScreen'],
    priceRange: [299, 1999],
    count: 8,
    photos: [
      '1560169897-fc0cdbdfa4d5',
      '1509281373149-e957c6296406',
      '1584905066893-7d5c142ba4e1',
      '1567690187548-f07b1d7bf5a9',
      '1573399054516-90665ecc44be',
      '1461151304267-38535e780c79',
    ],
  },
  {
    key: 'smartwatches',
    label: 'Smartwatches',
    brands: ['PulseWatch', 'TimeFit', 'ChronoWear'],
    priceRange: [49, 499],
    count: 8,
    photos: [
      '1579586337278-3befd40fd17a',
      '1546868871-7041f2a55e12',
      '1508685096489-7aacd43bd3b1',
      '1434493789847-2f02dc6ca35d',
      '1551816230-ef5deaed4a26',
      '1461141346587-763ab02bced9',
    ],
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

export function buildItems() {
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
      const imageUrl = `https://images.unsplash.com/photo-${pick(cat.photos)}?w=600&h=400&fit=crop&q=80`

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

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
    specs: () => ({
      'Screen Size': pick(['5.8"', '6.1"', '6.5"', '6.7"']),
      Storage: pick(['64GB', '128GB', '256GB', '512GB']),
      RAM: pick(['4GB', '6GB', '8GB', '12GB']),
      Battery: pick(['3000mAh', '3500mAh', '4000mAh', '4500mAh', '5000mAh']),
      'Rear Camera': pick(['12MP', '48MP', '50MP', '108MP']),
      Processor: pick(['Octa-core 2.8GHz', 'Octa-core 3.1GHz', 'Hexa-core 2.4GHz']),
      'Operating System': pick(['Android 14', 'Android 15', 'NovaOS 3']),
      Weight: `${randomInt(150, 220)}g`,
      Connectivity: pick(['5G', '4G LTE']),
      Color: pick(['Midnight Black', 'Ocean Blue', 'Silver', 'Rose Gold']),
    }),
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
    specs: () => ({
      'Battery Life': pick(['6 hours', '8 hours', '10 hours', '24 hours with case']),
      'Bluetooth Version': pick(['5.0', '5.2', '5.3']),
      'Noise Cancellation': pick(['Active', 'Passive', 'None']),
      'Water Resistance': pick(['IPX4', 'IPX5', 'IPX7']),
      'Driver Size': pick(['8mm', '10mm', '12mm']),
      Weight: `${randomInt(4, 60)}g`,
      'Charging Case': pick(['USB-C', 'Wireless', 'USB-C + Wireless']),
      Microphone: pick(['Built-in', 'Dual Mic', 'Beamforming Mic']),
      Controls: pick(['Touch', 'Button', 'Touch + Voice']),
      Color: pick(['Black', 'White', 'Navy']),
    }),
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
    specs: () => ({
      'Screen Size': pick(['13.3"', '14"', '15.6"', '16"']),
      Processor: pick(['Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7']),
      RAM: pick(['8GB', '16GB', '32GB']),
      Storage: pick(['256GB SSD', '512GB SSD', '1TB SSD']),
      Graphics: pick(['Integrated', 'Dedicated 4GB', 'Dedicated 6GB']),
      'Battery Life': pick(['Up to 8 hours', 'Up to 10 hours', 'Up to 14 hours']),
      Weight: `${(randomInt(12, 22) / 10).toFixed(1)}kg`,
      'Operating System': pick(['Windows 11', 'macOS', 'ChromeOS']),
      Ports: pick(['2x USB-C, 1x USB-A', '2x USB-C, HDMI', '3x USB-A, HDMI']),
      Color: pick(['Space Gray', 'Silver', 'Black']),
    }),
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
    specs: () => ({
      'Screen Size': pick(['8"', '10.2"', '11"', '12.9"']),
      Storage: pick(['64GB', '128GB', '256GB']),
      RAM: pick(['4GB', '6GB', '8GB']),
      Battery: pick(['6000mAh', '7000mAh', '8000mAh', '9000mAh']),
      'Rear Camera': pick(['8MP', '12MP']),
      'Operating System': pick(['Android 14', 'iPadOS', 'NovaOS 3']),
      Weight: `${randomInt(400, 650)}g`,
      Connectivity: pick(['Wi-Fi', 'Wi-Fi + Cellular']),
      Processor: pick(['Octa-core 2.2GHz', 'Hexa-core 2.0GHz']),
      Color: pick(['Space Gray', 'Silver', 'Starlight']),
    }),
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
    specs: () => ({
      'Screen Size': pick(['43"', '50"', '55"', '65"', '75"']),
      Resolution: pick(['1080p', '4K UHD', '8K']),
      'Refresh Rate': pick(['60Hz', '120Hz']),
      HDR: pick(['HDR10', 'Dolby Vision', 'HDR10+']),
      'Smart Platform': pick(['NovaTV OS', 'Google TV', 'Roku TV']),
      Ports: pick(['3x HDMI, 2x USB', '4x HDMI, 2x USB']),
      Speakers: pick(['2x 10W', '2x 15W', '20W Soundbar built-in']),
      Weight: `${randomInt(8, 25)}kg`,
      'Panel Type': pick(['LED', 'QLED', 'OLED']),
      Connectivity: pick(['Wi-Fi + Bluetooth', 'Wi-Fi + Ethernet + Bluetooth']),
    }),
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
    specs: () => ({
      Display: pick(['1.4" AMOLED', '1.6" AMOLED', '1.9" Retina']),
      'Battery Life': pick(['18 hours', '2 days', '7 days']),
      'Water Resistance': pick(['5 ATM', 'IP68', '50m']),
      Sensors: pick(['Heart Rate, SpO2', 'Heart Rate, SpO2, ECG']),
      Connectivity: pick(['Bluetooth', 'Bluetooth + Wi-Fi', 'Bluetooth + LTE']),
      Compatibility: pick(['Android + iOS', 'Android only', 'iOS only']),
      Storage: pick(['4GB', '8GB', '32GB']),
      Weight: `${randomInt(25, 55)}g`,
      'Strap Material': pick(['Silicone', 'Leather', 'Metal']),
      GPS: pick(['Built-in', 'Connected (via phone)']),
    }),
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

export function buildItems() {
  const items = []

  for (const cat of CATEGORIES) {
    for (let i = 0; i < cat.count; i++) {
      const brand = pick(cat.brands)
      const model = randomInt(1, 15)
      const descriptor = pick(DESCRIPTORS)
      const name = `${brand} ${model}`
      const title = `${name} - ${descriptor}`
      const description =
        `${name} in ${descriptor.toLowerCase()} condition, with ${pick(FEATURES)} and ${pick(FEATURES)}. ` +
        `A reliable choice in the ${cat.label.toLowerCase()} lineup, backed by ${pick(FEATURES)}.`
      const [min, max] = cat.priceRange
      const price = Number((randomInt(min * 100, max * 100) / 100).toFixed(2))
      const available = randomInt(0, 40)
      const imageUrl = `https://images.unsplash.com/photo-${pick(cat.photos)}?w=600&h=400&fit=crop&q=80`
      const specs = cat.specs()

      items.push({
        name,
        title,
        description,
        category: cat.key,
        price,
        currency: 'USD',
        imageUrl,
        available,
        specs,
      })
    }
  }

  return items
}

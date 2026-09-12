export const CATEGORIES = [
  { key: 'phones', label: 'Mobile Phones' },
  { key: 'earphones', label: 'Earphones' },
  { key: 'laptops', label: 'Laptops' },
  { key: 'tablets', label: 'Tablets' },
  { key: 'tvs', label: 'TVs' },
  { key: 'smartwatches', label: 'Smartwatches' },
]

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

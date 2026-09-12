import { useState } from 'react'
import { categoryLabel } from '../categories.js'
import { useCart } from '../CartContext.jsx'

function formatPrice(price, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

function ItemCard({ item }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const inStock = item.available > 0

  async function handleAddToCart() {
    setAdding(true)
    await addItem(item.id, 1)
    setAdding(false)
  }

  return (
    <div className="card">
      <img className="card-image" src={item.image_url} alt={item.name} loading="lazy" />
      <div className="card-body">
        <span className="chip">{categoryLabel(item.category)}</span>
        <h3 className="card-title">{item.title}</h3>
        <p className="card-description">{item.description}</p>
        <div className="card-footer">
          <span className="card-price">{formatPrice(item.price, item.currency)}</span>
          <span className={`stock ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock ? `${item.available} available` : 'Out of stock'}
          </span>
        </div>
        <button
          className="add-to-cart-button"
          onClick={handleAddToCart}
          disabled={!inStock || adding}
        >
          {inStock ? (adding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}

export default ItemCard

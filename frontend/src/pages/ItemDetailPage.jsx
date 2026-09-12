import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { useCart } from '../CartContext.jsx'
import { categoryLabel } from '../categories.js'

function formatPrice(price, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

function ItemDetailPage({ itemId, onBack }) {
  const { apiFetch } = useAuth()
  const { addItem } = useCart()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(false)

    apiFetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then((data) => {
        if (!ignore) setItem(data)
      })
      .catch(() => {
        if (!ignore) setError(true)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [itemId])

  async function handleAddToCart() {
    setAdding(true)
    await addItem(item.id, 1)
    setAdding(false)
  }

  return (
    <main className="app-main">
      <button className="back-link" onClick={onBack}>
        &larr; Back to results
      </button>

      {loading && <p className="status-text">Loading...</p>}
      {error && <p className="status-text error">Could not load this item.</p>}

      {!loading && !error && item && (
        <div className="detail">
          <img className="detail-image" src={item.image_url} alt={item.name} />

          <div className="detail-body">
            <span className="chip">{categoryLabel(item.category)}</span>
            <h2 className="detail-title">{item.title}</h2>
            <div className="detail-price-row">
              <span className="detail-price">{formatPrice(item.price, item.currency)}</span>
              <span className={`stock ${item.available > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {item.available > 0 ? `${item.available} available` : 'Out of stock'}
              </span>
            </div>

            <p className="detail-description">{item.description}</p>

            <button
              className="add-to-cart-button detail-add-button"
              onClick={handleAddToCart}
              disabled={item.available <= 0 || adding}
            >
              {item.available > 0 ? (adding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
            </button>

            {Object.keys(item.specs || {}).length > 0 && (
              <>
                <h3 className="detail-specs-title">Technical characteristics</h3>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(item.specs).map(([key, value]) => (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default ItemDetailPage

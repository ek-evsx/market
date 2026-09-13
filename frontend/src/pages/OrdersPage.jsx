import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

function formatPrice(price, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

function OrdersPage() {
  const { apiFetch } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(false)

    apiFetch('/api/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then((data) => {
        if (!ignore) setOrders(data.orders)
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
  }, [])

  return (
    <main className="app-main">
      <h2 className="page-title">My Orders</h2>

      {loading && <p className="status-text">Loading...</p>}
      {error && <p className="status-text error">Could not load your orders. Please try again.</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="status-text">You haven't placed any orders yet.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{order.id.slice(0, 8)}</div>
                  <div className="order-meta">
                    {order.name} &middot; {order.email} &middot; {order.createdAt}
                  </div>
                </div>
                <div className="order-total">{formatPrice(order.total, order.currency)}</div>
              </div>

              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.itemId}>
                    <span>
                      {item.name} &times; {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity, item.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default OrdersPage

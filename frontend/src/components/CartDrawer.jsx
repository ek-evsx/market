import { useState } from 'react'
import { useCart } from '../CartContext.jsx'

function formatPrice(price, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

function CartDrawer({ open, onClose, onViewOrders }) {
  const { cart, updateQuantity, removeItem, checkout } = useCart()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successOrderId, setSuccessOrderId] = useState(null)

  if (!open) return null

  function handleClose() {
    setError('')
    setSuccessOrderId(null)
    onClose()
  }

  async function handleBuy(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const orderId = await checkout({ name, email })
      setSuccessOrderId(orderId)
      setName('')
      setEmail('')
    } catch (err) {
      const conflictText = err.conflicts
        ? ` (${err.conflicts.map((c) => `${c.name}: wanted ${c.requested}, only ${c.available} left`).join('; ')})`
        : ''
      setError(`${err.message}${conflictText}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Your Cart</h2>
          <button className="drawer-close" onClick={handleClose} aria-label="Close cart">
            &times;
          </button>
        </div>

        {successOrderId ? (
          <div className="cart-success">
            <p>Order placed! Your order id is:</p>
            <p className="cart-success-id">{successOrderId}</p>
            <button
              className="primary-button"
              onClick={() => {
                handleClose()
                onViewOrders()
              }}
            >
              View My Orders
            </button>
          </div>
        ) : (
          <>
            {cart.items.length === 0 ? (
              <p className="status-text">Your cart is empty.</p>
            ) : (
              <ul className="cart-items">
                {cart.items.map((item) => (
                  <li className="cart-item" key={item.itemId}>
                    <img className="cart-item-image" src={item.imageUrl} alt={item.name} />
                    <div className="cart-item-body">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">{formatPrice(item.price, item.currency)}</div>
                      <div className="cart-item-controls">
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          &minus;
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                          disabled={item.quantity >= item.available}
                        >
                          +
                        </button>
                        <button className="cart-item-remove" onClick={() => removeItem(item.itemId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-line-total">{formatPrice(item.lineTotal, item.currency)}</div>
                  </li>
                ))}
              </ul>
            )}

            {cart.items.length > 0 && (
              <>
                <div className="cart-total">
                  <span>Total</span>
                  <span>{formatPrice(cart.total, cart.currency)}</span>
                </div>

                <form className="checkout-form" onSubmit={handleBuy}>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {error && <p className="status-text error">{error}</p>}
                  <button className="primary-button" type="submit" disabled={submitting}>
                    {submitting ? 'Placing order...' : 'Buy'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CartDrawer

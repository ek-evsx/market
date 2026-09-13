import { useCart } from '../CartContext.jsx'

function CartButton({ onClick }) {
  const { cart } = useCart()
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <button className="cart-button" onClick={onClick} aria-label="Open cart">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H5.3" />
      </svg>
      {count > 0 && <span className="cart-badge">{count}</span>}
    </button>
  )
}

export default CartButton

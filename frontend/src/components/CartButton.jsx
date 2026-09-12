import { useCart } from '../CartContext.jsx'

function CartButton({ onClick }) {
  const { cart } = useCart()
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <button className="cart-button" onClick={onClick}>
      Cart
      {count > 0 && <span className="cart-badge">{count}</span>}
    </button>
  )
}

export default CartButton

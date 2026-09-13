import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

const CART_ID_KEY = 'market_cart_id'

const emptyCart = { items: [], total: 0, currency: 'USD' }

export function CartProvider({ children }) {
  const { apiFetch } = useAuth()
  const [cartId, setCartId] = useState(null)
  const [cart, setCart] = useState(emptyCart)
  const [loading, setLoading] = useState(true)

  function persistCartId(id) {
    localStorage.setItem(CART_ID_KEY, id)
    setCartId(id)
  }

  async function createCart() {
    const res = await apiFetch('/api/carts', { method: 'POST' })
    const data = await res.json()
    persistCartId(data.id)
    setCart(data)
    return data
  }

  async function loadCart(id) {
    const res = await apiFetch(`/api/carts/${id}`)
    if (res.status === 404) {
      await createCart()
      return
    }
    const data = await res.json()
    setCartId(id)
    setCart(data)
  }

  useEffect(() => {
    const storedId = localStorage.getItem(CART_ID_KEY)
    const init = storedId ? loadCart(storedId) : createCart()
    init.finally(() => setLoading(false))
  }, [])

  async function addItem(itemId, quantity = 1) {
    const res = await apiFetch(`/api/carts/${cartId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    })
    if (res.ok) setCart(await res.json())
  }

  async function updateQuantity(itemId, quantity) {
    const res = await apiFetch(`/api/carts/${cartId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (res.ok) setCart(await res.json())
  }

  async function removeItem(itemId) {
    const res = await apiFetch(`/api/carts/${cartId}/items/${itemId}`, { method: 'DELETE' })
    if (res.ok) setCart(await res.json())
  }

  async function checkout(contact) {
    const res = await apiFetch(`/api/carts/${cartId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    })
    const data = await res.json()

    if (!res.ok) {
      const err = new Error(data.error || 'Checkout failed')
      err.conflicts = data.conflicts
      throw err
    }

    persistCartId(data.cart.id)
    setCart(data.cart)
    return data.orderId
  }

  const value = { cart, loading, addItem, updateQuantity, removeItem, checkout }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}

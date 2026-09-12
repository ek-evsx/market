import { useState } from 'react'
import { CartProvider } from './CartContext.jsx'
import CartButton from './components/CartButton.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ShopPage from './pages/ShopPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'

function App() {
  const [view, setView] = useState('shop')
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="app">
        <header className="app-header">
          <div className="app-header-inner">
            <h1>Market</h1>
            <nav className="app-nav">
              <button
                className={`nav-link ${view === 'shop' ? 'active' : ''}`}
                onClick={() => setView('shop')}
              >
                Shop
              </button>
              <button
                className={`nav-link ${view === 'orders' ? 'active' : ''}`}
                onClick={() => setView('orders')}
              >
                My Orders
              </button>
              <CartButton onClick={() => setCartOpen(true)} />
            </nav>
          </div>
        </header>

        {view === 'shop' ? <ShopPage /> : <OrdersPage />}

        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onViewOrders={() => setView('orders')}
        />
      </div>
    </CartProvider>
  )
}

export default App

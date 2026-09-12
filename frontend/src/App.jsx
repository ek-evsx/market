import { useState } from 'react'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import { CartProvider } from './CartContext.jsx'
import CartButton from './components/CartButton.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ShopPage from './pages/ShopPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

function MarketApp() {
  const { logout } = useAuth()
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
              <button className="nav-link" onClick={logout}>
                Log Out
              </button>
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

function AuthGate() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <MarketApp /> : <LoginPage />
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App

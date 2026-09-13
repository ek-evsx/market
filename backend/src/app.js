import express from 'express'
import { requireAuth } from './middleware/requireAuth.js'
import authRouter from './routes/auth.js'
import itemsRouter from './routes/items.js'
import cartRouter from './routes/cart.js'
import ordersRouter from './routes/orders.js'
import chatRouter from './routes/chat.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)

app.use('/api/items', requireAuth, itemsRouter)
app.use('/api/carts', requireAuth, cartRouter)
app.use('/api/orders', requireAuth, ordersRouter)
app.use('/api/chat', requireAuth, chatRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app

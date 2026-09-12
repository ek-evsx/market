import express from 'express'
import itemsRouter from './routes/items.js'
import cartRouter from './routes/cart.js'
import ordersRouter from './routes/orders.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/items', itemsRouter)
app.use('/api/carts', cartRouter)
app.use('/api/orders', ordersRouter)

export default app

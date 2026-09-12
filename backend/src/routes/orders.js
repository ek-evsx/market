import express from 'express'
import { db } from '../db.js'

const router = express.Router()

router.get('/:id', async (req, res) => {
  const orderResult = await db.execute({
    sql: 'SELECT id, name, email, total, currency, created_at AS createdAt FROM orders WHERE id = ?',
    args: [req.params.id],
  })

  if (orderResult.rows.length === 0) {
    return res.status(404).json({ error: 'Order not found' })
  }

  const itemsResult = await db.execute({
    sql: 'SELECT item_id AS itemId, name, price, currency, quantity FROM order_items WHERE order_id = ?',
    args: [req.params.id],
  })

  res.json({ ...orderResult.rows[0], items: itemsResult.rows })
})

export default router

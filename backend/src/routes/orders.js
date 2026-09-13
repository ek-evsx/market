import express from 'express'
import { asyncHandler } from '../asyncHandler.js'
import { db } from '../db.js'

const router = express.Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const ordersResult = await db.execute({
      sql: `SELECT id, name, email, total, currency, created_at AS createdAt
            FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      args: [req.user.sub],
    })

    const orders = ordersResult.rows
    if (orders.length === 0) return res.json({ orders: [] })

    const placeholders = orders.map(() => '?').join(', ')
    const itemsResult = await db.execute({
      sql: `SELECT order_id AS orderId, item_id AS itemId, name, price, currency, quantity
            FROM order_items WHERE order_id IN (${placeholders})`,
      args: orders.map((o) => o.id),
    })

    const itemsByOrder = new Map()
    for (const item of itemsResult.rows) {
      if (!itemsByOrder.has(item.orderId)) itemsByOrder.set(item.orderId, [])
      itemsByOrder.get(item.orderId).push(item)
    }

    res.json({
      orders: orders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) || [] })),
    })
  })
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const orderResult = await db.execute({
      sql: `SELECT id, name, email, total, currency, created_at AS createdAt
            FROM orders WHERE id = ? AND user_id = ?`,
      args: [req.params.id, req.user.sub],
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
)

export default router

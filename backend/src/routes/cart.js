import express from 'express'
import { randomUUID } from 'node:crypto'
import { asyncHandler } from '../asyncHandler.js'
import { db } from '../db.js'

const router = express.Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function loadCart(cartId, userId) {
  const cartResult = await db.execute({
    sql: 'SELECT id FROM carts WHERE id = ? AND user_id = ?',
    args: [cartId, userId],
  })
  if (cartResult.rows.length === 0) return null

  const itemsResult = await db.execute({
    sql: `SELECT ci.item_id AS itemId, ci.quantity AS quantity,
                 i.name AS name, i.title AS title, i.price AS price,
                 i.currency AS currency, i.image_url AS imageUrl, i.available AS available
          FROM cart_items ci
          JOIN items i ON i.id = ci.item_id
          WHERE ci.cart_id = ?
          ORDER BY i.id`,
    args: [cartId],
  })

  const items = itemsResult.rows.map((row) => ({
    ...row,
    lineTotal: Number((row.price * row.quantity).toFixed(2)),
  }))

  const total = Number(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2))
  const currency = items[0]?.currency || 'USD'

  return { id: cartId, items, total, currency }
}

router.post('/', asyncHandler(async (req, res) => {
  const id = randomUUID()
  await db.execute({
    sql: 'INSERT INTO carts (id, user_id) VALUES (?, ?)',
    args: [id, req.user.sub],
  })
  res.status(201).json({ id, items: [], total: 0, currency: 'USD' })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const cart = await loadCart(req.params.id, req.user.sub)
  if (!cart) return res.status(404).json({ error: 'Cart not found' })
  res.json(cart)
}))

router.post('/:id/items', asyncHandler(async (req, res) => {
  const cartId = req.params.id
  const itemId = Number(req.body.itemId)
  const requestedQty = Math.max(1, Number(req.body.quantity) || 1)

  const cart = await loadCart(cartId, req.user.sub)
  if (!cart) return res.status(404).json({ error: 'Cart not found' })

  const itemResult = await db.execute({ sql: 'SELECT available FROM items WHERE id = ?', args: [itemId] })
  if (itemResult.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
  const available = itemResult.rows[0].available

  const currentQty = cart.items.find((i) => i.itemId === itemId)?.quantity || 0
  const newQty = Math.min(currentQty + requestedQty, available)

  if (newQty > 0) {
    if (currentQty > 0) {
      await db.execute({
        sql: 'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND item_id = ?',
        args: [newQty, cartId, itemId],
      })
    } else {
      await db.execute({
        sql: 'INSERT INTO cart_items (cart_id, item_id, quantity) VALUES (?, ?, ?)',
        args: [cartId, itemId, newQty],
      })
    }
  }

  res.json(await loadCart(cartId, req.user.sub))
}))

router.patch('/:id/items/:itemId', asyncHandler(async (req, res) => {
  const cartId = req.params.id
  const itemId = Number(req.params.itemId)
  const quantity = Number(req.body.quantity)

  const cart = await loadCart(cartId, req.user.sub)
  if (!cart) return res.status(404).json({ error: 'Cart not found' })

  if (!Number.isFinite(quantity) || quantity <= 0) {
    await db.execute({
      sql: 'DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?',
      args: [cartId, itemId],
    })
    return res.json(await loadCart(cartId, req.user.sub))
  }

  const itemResult = await db.execute({ sql: 'SELECT available FROM items WHERE id = ?', args: [itemId] })
  if (itemResult.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
  const clamped = Math.min(quantity, itemResult.rows[0].available)

  const existingQty = cart.items.find((i) => i.itemId === itemId)?.quantity || 0

  if (existingQty > 0) {
    await db.execute({
      sql: 'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND item_id = ?',
      args: [clamped, cartId, itemId],
    })
  } else if (clamped > 0) {
    await db.execute({
      sql: 'INSERT INTO cart_items (cart_id, item_id, quantity) VALUES (?, ?, ?)',
      args: [cartId, itemId, clamped],
    })
  }

  res.json(await loadCart(cartId, req.user.sub))
}))

router.delete('/:id/items/:itemId', asyncHandler(async (req, res) => {
  const cartId = req.params.id
  const itemId = Number(req.params.itemId)

  const cart = await loadCart(cartId, req.user.sub)
  if (!cart) return res.status(404).json({ error: 'Cart not found' })

  await db.execute({
    sql: 'DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?',
    args: [cartId, itemId],
  })

  res.json(await loadCart(cartId, req.user.sub))
}))

router.post('/:id/checkout', asyncHandler(async (req, res) => {
  const cartId = req.params.id
  const name = (req.body.name || '').trim()
  const email = (req.body.email || '').trim()

  if (!name || !email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid name and email are required' })
  }

  const cart = await loadCart(cartId, req.user.sub)
  if (!cart) return res.status(404).json({ error: 'Cart not found' })
  if (cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' })

  const conflicts = cart.items.filter((item) => item.quantity > item.available)
  if (conflicts.length > 0) {
    return res.status(409).json({
      error: 'Some items are no longer available in the requested quantity',
      conflicts: conflicts.map((c) => ({
        itemId: c.itemId,
        name: c.name,
        requested: c.quantity,
        available: c.available,
      })),
    })
  }

  const orderId = randomUUID()
  const newCartId = randomUUID()

  const statements = [
    {
      sql: 'INSERT INTO orders (id, user_id, name, email, total, currency) VALUES (?, ?, ?, ?, ?, ?)',
      args: [orderId, req.user.sub, name, email, cart.total, cart.currency],
    },
    ...cart.items.map((item) => ({
      sql: 'INSERT INTO order_items (order_id, item_id, name, price, currency, quantity) VALUES (?, ?, ?, ?, ?, ?)',
      args: [orderId, item.itemId, item.name, item.price, item.currency, item.quantity],
    })),
    ...cart.items.map((item) => ({
      sql: 'UPDATE items SET available = available - ? WHERE id = ?',
      args: [item.quantity, item.itemId],
    })),
    { sql: 'DELETE FROM cart_items WHERE cart_id = ?', args: [cartId] },
    { sql: 'DELETE FROM carts WHERE id = ?', args: [cartId] },
    { sql: 'INSERT INTO carts (id, user_id) VALUES (?, ?)', args: [newCartId, req.user.sub] },
  ]

  await db.batch(statements, 'write')

  res.status(201).json({
    orderId,
    cart: { id: newCartId, items: [], total: 0, currency: cart.currency },
  })
}))

export default router

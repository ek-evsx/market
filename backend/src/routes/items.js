import express from 'express'
import { db } from '../db.js'

const router = express.Router()
const PAGE_SIZE = 15

const CATEGORIES = ['phones', 'earphones', 'laptops', 'tablets', 'tvs', 'smartwatches']

router.get('/', async (req, res) => {
  const { search, category } = req.query
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)

  const conditions = []
  const args = []

  if (category && CATEGORIES.includes(category)) {
    conditions.push('category = ?')
    args.push(category)
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`
    conditions.push('(name LIKE ? OR title LIKE ? OR description LIKE ?)')
    args.push(term, term, term)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) AS count FROM items ${where}`,
    args,
  })
  const total = Number(countResult.rows[0].count)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const itemsResult = await db.execute({
    sql: `SELECT * FROM items ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
    args: [...args, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  })

  res.json({
    items: itemsResult.rows,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
  })
})

export default router

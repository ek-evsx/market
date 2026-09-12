import express from 'express'
import { db } from './db.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/items', async (req, res) => {
  const result = await db.execute('SELECT * FROM items ORDER BY id DESC')
  res.json(result.rows)
})

app.post('/api/items', async (req, res) => {
  const { title, description, price } = req.body

  if (!title || typeof price !== 'number') {
    return res.status(400).json({ error: 'title and numeric price are required' })
  }

  const inserted = await db.execute({
    sql: 'INSERT INTO items (title, description, price) VALUES (?, ?, ?)',
    args: [title, description || '', price],
  })

  const item = await db.execute({
    sql: 'SELECT * FROM items WHERE id = ?',
    args: [inserted.lastInsertRowid],
  })

  res.status(201).json(item.rows[0])
})

app.delete('/api/items/:id', async (req, res) => {
  await db.execute({
    sql: 'DELETE FROM items WHERE id = ?',
    args: [req.params.id],
  })
  res.status(204).end()
})

export default app

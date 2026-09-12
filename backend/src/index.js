import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = process.env.PUBLIC_DIR || path.join(__dirname, '..', 'public')

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items ORDER BY id DESC').all()
  res.json(items)
})

app.post('/api/items', (req, res) => {
  const { title, description, price } = req.body

  if (!title || typeof price !== 'number') {
    return res.status(400).json({ error: 'title and numeric price are required' })
  }

  const result = db
    .prepare('INSERT INTO items (title, description, price) VALUES (?, ?, ?)')
    .run(title, description || '', price)

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(item)
})

app.delete('/api/items/:id', (req, res) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

app.use(express.static(publicDir))

app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Frontend build not found. Run `npm run build` in frontend/.')
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

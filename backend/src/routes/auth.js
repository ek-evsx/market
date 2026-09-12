import express from 'express'
import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { hashPassword, signToken, verifyPassword } from '../auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  const username = (req.body.username || '').trim()
  const password = req.body.password || ''

  if (!username || password.length < 8) {
    return res.status(400).json({ error: 'Username and a password of at least 8 characters are required' })
  }

  const countResult = await db.execute('SELECT COUNT(*) AS count FROM users')
  if (Number(countResult.rows[0].count) > 0) {
    return res.status(403).json({ error: 'Registration is closed' })
  }

  const passwordHash = await hashPassword(password)
  const id = randomUUID()

  try {
    await db.execute({
      sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
      args: [id, username, passwordHash],
    })
  } catch {
    return res.status(409).json({ error: 'Username already taken' })
  }

  res.status(201).json({ id, username })
})

router.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim()
  const password = req.body.password || ''

  const result = await db.execute({
    sql: 'SELECT id, username, password_hash AS passwordHash FROM users WHERE username = ?',
    args: [username],
  })
  const user = result.rows[0]

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const token = signToken(user)
  res.json({ token, expiresIn: 900 })
})

export default router

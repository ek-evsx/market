import express from 'express'
import { asyncHandler } from '../asyncHandler.js'
import { db } from '../db.js'
import { signToken, verifyPassword } from '../auth.js'

const router = express.Router()

router.post('/login', asyncHandler(async (req, res) => {
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
}))

export default router

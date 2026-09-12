import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const TOKEN_TTL = '15m'

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? (() => {
        throw new Error('JWT_SECRET must be set in production')
      })()
    : 'dev-only-insecure-secret')

export function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

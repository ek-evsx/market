import { randomUUID } from 'node:crypto'
import { db } from '../src/db.js'
import { hashPassword } from '../src/auth.js'

async function createUser() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password || password.length < 8) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD (min. 8 chars) env vars.')
    console.error('Example: ADMIN_USERNAME=admin ADMIN_PASSWORD=supersecret1 npm run create-user --workspace backend')
    console.error('(Note: plain USERNAME is a reserved/read-only shell var on macOS — don\'t use that name.)')
    process.exit(1)
  }

  const countResult = await db.execute('SELECT COUNT(*) AS count FROM users')
  if (Number(countResult.rows[0].count) > 0) {
    console.error('A user already exists. This app supports exactly one account.')
    process.exit(1)
  }

  const passwordHash = await hashPassword(password)
  const id = randomUUID()

  await db.execute({
    sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
    args: [id, username, passwordHash],
  })

  console.log(`Created user "${username}" (${id}).`)
}

createUser()

import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { asyncHandler } from '../asyncHandler.js'
import { buildTools } from '../chat/tools.js'
import { SYSTEM_PROMPT } from '../chat/systemPrompt.js'

const router = express.Router()

const MODEL = 'claude-haiku-4-5'
const MAX_TOKENS = 1024
const MAX_ITERATIONS = 8

// Lazy so a missing ANTHROPIC_API_KEY only fails /api/chat requests, not the
// whole server at boot (new Anthropic() throws immediately if unresolvable).
let client
function getClient() {
  if (!client) client = new Anthropic()
  return client
}

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const message = (req.body.message || '').trim()
    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }

    const cartId = req.body.cartId
    if (!cartId) {
      return res.status(400).json({ error: 'cartId is required' })
    }

    const history = Array.isArray(req.body.history) ? req.body.history : []
    const token = req.headers.authorization.split(' ')[1]
    const cartRef = { current: cartId }

    const runner = getClient().beta.messages.toolRunner({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: buildTools({ token, cartRef }),
      messages: [...history, { role: 'user', content: message }],
      max_iterations: MAX_ITERATIONS,
    })

    const finalMessage = await runner

    const reply =
      finalMessage.stop_reason === 'tool_use'
        ? "Sorry, that took too many steps — could you rephrase or simplify your request?"
        : finalMessage.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('\n')

    res.json({ reply, history: runner.params.messages, cartId: cartRef.current })
  })
)

export default router

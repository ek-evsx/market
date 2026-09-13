import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { useCart } from '../CartContext.jsx'

const GREETING =
  "Hi! I'm your shopping assistant. I can help you find products, manage your cart, " +
  'check out, and look up past orders. What are you looking for?'

function ChatWidget() {
  const { apiFetch } = useAuth()
  const { cartId, syncFromChat } = useCart()

  const [open, setOpen] = useState(false)
  const [displayMessages, setDisplayMessages] = useState([{ role: 'assistant', text: GREETING }])
  const [apiHistory, setApiHistory] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages, sending, open])

  function toggleChat() {
    setOpen((o) => !o)
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !cartId) return

    setDisplayMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setSending(true)

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: apiHistory, cartId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setDisplayMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || 'Something went wrong.' },
        ])
        return
      }

      setApiHistory(data.history)
      setDisplayMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
      await syncFromChat(data.cartId)
    } catch {
      setDisplayMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, I couldn't reach the server. Please try again." },
      ])
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  return (
    <>
      <button
        className={`launcher ${open ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle assistant"
      >
        <span className="icon-chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </span>
        <span className="icon-close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      </button>

      <div className={`chat-overlay ${open ? 'open' : ''}`} onClick={toggleChat}>
        <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
          <div className="chat-header">
            <div className="chat-header-left">
              <span className="chat-avatar">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z" />
                </svg>
              </span>
              <span className="chat-title">Assistant</span>
            </div>
          </div>

          <div className="chat-messages">
            {displayMessages.map((m, i) => (
              <div className={`msg ${m.role}`} key={i}>
                {m.text}
              </div>
            ))}
            {sending && <div className="msg assistant pending">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <textarea
              className="chat-textarea"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="chat-send"
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default ChatWidget

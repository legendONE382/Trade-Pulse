import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Sparkles } from 'lucide-react'
import { chatWithAI } from '../services/aiService'
import ChatMessage from '../components/ChatMessage'
import { PageHeader, Button, LoadingSpinner } from '../components/ui'

const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || ''

const SUGGESTIONS = [
  'How much did I make this month?',
  'What are my top selling products?',
  'How much do I have in pending debts?',
  'What is my profit margin?',
  'Which products are low on stock?',
  'Show me my recent orders',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    const question = text || input.trim()
    if (!question || loading) return

    const userMessage = { role: 'user', content: question }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatWithAI(
        [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        AI_API_KEY
      )
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="AI Assistant"
        description="Ask questions about your business data"
      />

      {!AI_API_KEY && (
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>AI not configured.</strong> Add <code>VITE_AI_API_KEY</code> to your <code>.env</code> file with your OpenAI API key to enable the AI assistant.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 card min-h-0">
        {messages.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask about your business</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              I can help you understand your sales, expenses, profits, inventory, and more.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your business..."
          className="input-field flex-1"
          disabled={loading}
        />
        <Button onClick={() => handleSend()} disabled={!input.trim() || loading} icon={Send}>
          Send
        </Button>
      </div>
    </div>
  )
}

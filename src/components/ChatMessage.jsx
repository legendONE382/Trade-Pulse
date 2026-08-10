import { Bot, User } from 'lucide-react'

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary-600" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-primary-600 text-white rounded-br-md'
          : 'bg-gray-100 text-gray-900 rounded-bl-md'
      }`}>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  )
}

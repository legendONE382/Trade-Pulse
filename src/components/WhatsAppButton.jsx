import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import Button from './ui/Button'
import { generateWhatsAppUrl, normalizePhoneNumber } from '../utils/whatsapp'

export default function WhatsAppButton({
  phoneNumber,
  message,
  label = 'WhatsApp',
  variant = 'success',
  size = 'sm',
  icon: Icon = MessageCircle,
  className = '',
  disabled = false,
  requirePhone = false,
  ...props
}) {
  const [feedback, setFeedback] = useState('')

  const handleClick = () => {
    const url = generateWhatsAppUrl(phoneNumber, message, { requirePhone })
    if (!url) {
      setFeedback('Invalid phone number')
      setTimeout(() => setFeedback(''), 3000)
      return
    }
    const normalized = normalizePhoneNumber(phoneNumber)
    if (requirePhone && !normalized) {
      setFeedback('Add a valid phone number first')
      setTimeout(() => setFeedback(''), 3000)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    setFeedback('Opening WhatsApp...')
    setTimeout(() => setFeedback(''), 2500)
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        variant={variant}
        size={size}
        icon={Icon}
        onClick={handleClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {label}
      </Button>
      {feedback && <span className="text-xs text-gray-500">{feedback}</span>}
    </span>
  )
}

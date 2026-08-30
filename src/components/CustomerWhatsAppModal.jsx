import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { generateWhatsAppUrl, normalizePhoneNumber } from '../utils/whatsapp'

export default function CustomerWhatsAppModal({ isOpen, onClose, customer }) {
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState('')

  const normalized = customer?.phone ? normalizePhoneNumber(customer.phone) : null
  const charCount = message.length

  const handleOpen = () => {
    if (!message.trim()) {
      setFeedback('Please enter a message')
      return
    }
    const url = generateWhatsAppUrl(customer?.phone, message)
    if (!url) {
      setFeedback('Invalid phone number')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    setFeedback('Opening WhatsApp...')
    setTimeout(() => {
      setFeedback('')
      onClose()
      setMessage('')
    }, 800)
  }

  const handleClose = () => {
    setFeedback('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send WhatsApp Message">
      <div className="space-y-4">
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
          <p className="text-sm text-gray-500">To</p>
          <p className="font-semibold text-gray-900">{customer?.name || 'Customer'}</p>
          <p className="text-sm text-gray-600 mt-1">
            {customer?.phone || 'No phone number'}
            {normalized && <span className="text-gray-400"> → {normalized}</span>}
          </p>
          {!normalized && customer?.phone && (
            <p className="text-xs text-amber-600 mt-1">Invalid number — WhatsApp will open without a recipient; you can pick a contact.</p>
          )}
          {!customer?.phone && (
            <p className="text-xs text-amber-600 mt-1">No phone on file — WhatsApp will open so you can choose a contact.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Type your message..."
            className="input-field resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">{charCount} characters</span>
            {feedback && <span className="text-xs text-primary-600">{feedback}</span>}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button icon={MessageCircle} onClick={handleOpen} className="flex-1">
            Open WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  )
}

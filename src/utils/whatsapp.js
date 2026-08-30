// TradePulse WhatsApp Click-to-Chat utilities (Phase 1)
// Transport abstraction: generateWhatsAppUrl is the single wa.me entry point.
// Future Phase 2 can swap transport without touching message builders.

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Normalize Nigerian phone numbers to wa.me-compatible international format (without +).
 * Accepts: 08012345678, +2348012345678, 2348012345678, with spaces/dashes/parens.
 * Returns: "2348012345678" or null if invalid.
 */
export function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return null
  const digits = phone.replace(/[^0-9+]/g, '')
  // Remove leading + for processing
  const withoutPlus = digits.startsWith('+') ? digits.slice(1) : digits
  // Strip leading 00 international prefix
  const cleaned = withoutPlus.startsWith('00') ? withoutPlus.slice(2) : withoutPlus

  if (!cleaned) return null

  // Already international Nigerian: 234 + 10 digits (total 13)
  if (cleaned.startsWith('234')) {
    if (cleaned.length === 13 && /^234[789]\d{9}$/.test(cleaned)) return cleaned
    // Allow 234 + 10 digits with any leading digit after 234 (be permissive)
    if (cleaned.length >= 12 && cleaned.length <= 14) return cleaned
    return cleaned.length >= 10 ? cleaned : null
  }

  // Local Nigerian: 0 + 10 digits => 234 + 10
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const withoutZero = cleaned.slice(1)
    return `234${withoutZero}`
  }

  // 10 digits without leading 0 (e.g. 8012345678) => 234 + 10
  if (cleaned.length === 10 && /^[789]\d{9}$/.test(cleaned)) {
    return `234${cleaned}`
  }

  // Fallback: if 11 digits starting with 0 handled above, otherwise if reasonable length return as-is
  if (cleaned.length >= 10 && cleaned.length <= 15) return cleaned

  return null
}

export function isValidPhone(phone) {
  return normalizePhoneNumber(phone) !== null
}

export function getBusinessName(user) {
  if (!user) return 'TradePulse'
  const meta = user.user_metadata || {}
  return meta.business_name || meta.businessName || meta.owner_name || user.email?.split('@')[0] || 'TradePulse'
}

/**
 * Generate wa.me Click-to-Chat URL. Returns null if phone is invalid and no fallback.
 * If phone is empty/invalid, returns wa.me/?text=... (lets user pick contact).
 * Pass { requirePhone: true } to return null instead when phone invalid.
 */
export function generateWhatsAppUrl(phone, message, opts = {}) {
  const { requirePhone = false } = opts
  const encoded = encodeURIComponent(message || '')
  const normalized = phone ? normalizePhoneNumber(phone) : null
  if (!normalized) {
    if (requirePhone) return null
    return `https://wa.me/?text=${encoded}`
  }
  return `https://wa.me/${normalized}?text=${encoded}`
}

export function openWhatsApp(phone, message, opts) {
  const url = generateWhatsAppUrl(phone, message, opts)
  if (!url) return { ok: false, error: 'Invalid phone number' }
  window.open(url, '_blank', 'noopener,noreferrer')
  return { ok: true, url }
}

// ---- Message builders (reusable, transport-agnostic) ----

export function buildGreetingMessage(customer, businessName) {
  const name = customer?.name || 'there'
  return `Hello ${name}, this is ${businessName}.`
}

export function buildInvoiceMessage(invoice, customer, businessName) {
  const invNumber = `INV-${String(invoice.id).toUpperCase().slice(-6)}`
  const name = customer?.name || 'there'
  const lines = [
    `Hello ${name} \uD83D\uDC4B`,
    '',
    `Here is your invoice from ${businessName}.`,
    '',
    `Invoice: ${invNumber}`,
    `Amount: ${formatCurrency(invoice.total)}`,
    `Date: ${formatDate(invoice.created_at)}`,
  ]
  if (invoice.due_date) lines.push(`Due: ${formatDate(invoice.due_date)}`)
  if (invoice.items?.length) {
    lines.push('', 'Items:')
    invoice.items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.description} x${item.quantity} = ${formatCurrency(item.quantity * item.price)}`)
    })
  }
  if (invoice.notes) lines.push('', `Notes: ${invoice.notes}`)
  lines.push('', 'Thank you for your business.')
  return lines.join('\n')
}

export function buildReceiptMessage(sale, customer, businessName) {
  const name = customer?.name || 'there'
  const receiptNo = `REC-${String(sale.id).toUpperCase().slice(-6)}`
  return [
    `Hello ${name} \uD83D\uDC4B`,
    '',
    'Payment received \u2705',
    '',
    `Amount paid: ${formatCurrency(sale.amount)}`,
    `Receipt: ${receiptNo}`,
    `Date: ${formatDate(sale.date || sale.created_at)}`,
    sale.description ? `For: ${sale.description}` : '',
    '',
    `From ${businessName}. Thank you.`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildDebtReminderMessage(customer, debtOrBalance, businessName) {
  const name = customer?.name || 'there'
  const amount = typeof debtOrBalance === 'number' ? debtOrBalance : debtOrBalance?.amount
  const dueDate = typeof debtOrBalance === 'object' ? debtOrBalance?.due_date : null
  const lines = [
    `Hello ${name} \uD83D\uDC4B`,
    '',
    `This is a friendly reminder about your outstanding balance with ${businessName}.`,
    '',
    `Outstanding balance: ${formatCurrency(amount || 0)}`,
  ]
  if (dueDate) lines.push(`Due date: ${formatDate(dueDate)}`)
  if (typeof debtOrBalance === 'object' && debtOrBalance?.description) {
    lines.push(`For: ${debtOrBalance.description}`)
  }
  lines.push('', 'Please let us know when you are able to make the payment.', '', 'Thank you.')
  return lines.join('\n')
}

// Legacy exports for backward compat
export const shareViaWhatsApp = (phone, message) => {
  openWhatsApp(phone, message)
}

export const formatInvoiceForWhatsApp = (invoice, customer, invoiceNumber) => {
  // invoiceNumber param was previously passed in; prefer builder but keep compat
  const businessName = 'your business'
  const msg = buildInvoiceMessage(invoice, customer, businessName)
  // If caller provided a preformatted number, replace the generated one
  if (invoiceNumber && invoiceNumber !== `INV-${String(invoice.id).toUpperCase().slice(-6)}`) {
    return msg.replace(/INV-[A-Z0-9]{6}/, invoiceNumber)
  }
  return msg
}

export const formatReminderForWhatsApp = (reminder, customer) => {
  const lines = [
    '*REMINDER* \uD83D\uDD14',
    '━━━━━━━━━━━━━━━━━━━━',
    `\uD83D\uDCCB ${reminder.title}`,
    `\uD83D\uDCC5 Date: ${formatDate(reminder.date)}`,
    reminder.description ? `\uD83D\uDCDD ${reminder.description}` : '',
    customer ? `\uD83D\uDC64 Customer: ${customer.name}` : '',
    customer?.phone ? `\uD83D\uDCF1 ${customer.phone}` : '',
    'Please follow up on this.',
  ]
  return lines.filter(Boolean).join('\n')
}

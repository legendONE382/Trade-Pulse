// WhatsApp sharing utility functions

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount)
}

export const shareViaWhatsApp = (phone, message) => {
  const encodedMessage = encodeURIComponent(message)
  const url = phone 
    ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`
  window.open(url, '_blank')
}

export const formatInvoiceForWhatsApp = (invoice, customer, invoiceNumber) => {
  const message = `
*INVOICE ${invoiceNumber}*
━━━━━━━━━━━━━━━━━━━━
📅 Date: ${invoice.date}
👤 Customer: ${customer.name}
${customer.phone ? `📱 Phone: ${customer.phone}` : ''}

*Items:*
${invoice.items.map((item, i) => 
  `${i + 1}. ${item.description}
   Qty: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.quantity * item.price)}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
*TOTAL: ${formatCurrency(invoice.total)}*

${invoice.notes ? `📝 Notes: ${invoice.notes}` : ''}
${invoice.dueDate ? `⏰ Due: ${invoice.dueDate}` : ''}

Thank you for your business! 🙏
  `.trim()

  return message
}

export const formatReminderForWhatsApp = (reminder, customer) => {
  const message = `
*REMINDER* 🔔
━━━━━━━━━━━━━━━━━━━━
📋 ${reminder.title}
📅 Date: ${reminder.date}

${reminder.description ? `📝 ${reminder.description}` : ''}

${customer ? `👤 Customer: ${customer.name}` : ''}
${customer?.phone ? `📱 ${customer.phone}` : ''}

Please follow up on this.
  `.trim()

  return message
}

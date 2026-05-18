import { useState, useEffect } from 'react'
import { Plus, Download, Trash2, Share2, FileText } from 'lucide-react'
import { getInvoices, addInvoice, updateInvoice, deleteInvoice, getCustomers, formatCurrency, formatDate } from '../utils/supabaseStorage'
import { shareViaWhatsApp, formatInvoiceForWhatsApp, generateInvoiceNumber } from '../utils/whatsapp'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: '',
    dueDate: '',
  })
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    loadInvoices()
    loadCustomers()
  }, [])

  const loadInvoices = async () => {
    const data = await getInvoices()
    setInvoices(data)
  }

  const loadCustomers = async () => {
    const data = await getCustomers()
    setCustomers(data)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }],
    })
  }

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setFormData({ ...formData, items: updatedItems })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    await addInvoice({
      ...formData,
      total: calculateTotal(),
    })

    setFormData({
      customerId: '',
      items: [{ description: '', quantity: 1, price: 0 }],
      notes: '',
      dueDate: '',
    })
    setShowForm(false)
    loadInvoices()
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id)
      loadInvoices()
    }
  }

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown'
  }

  const generateInvoiceNumber = (id) => {
    return `INV-${id.toUpperCase().slice(-6)}`
  }

  const downloadInvoice = (invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId)
    const text = `
INVOICE
${generateInvoiceNumber(invoice.id)}
Date: ${formatDate(invoice.createdAt)}
Due: ${invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}

BILL TO:
${customer ? customer.name : 'Unknown'}
${customer?.phone || ''}
${customer?.email || ''}

ITEMS:
${invoice.items.map((item, i) => 
  `${i + 1}. ${item.description}
   Qty: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.quantity * item.price)}`
).join('\n\n')}

TOTAL: ${formatCurrency(invoice.total)}

NOTES:
${invoice.notes || 'None'}
    `.trim()

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generateInvoiceNumber(invoice.id)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareInvoiceViaWhatsApp = (invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId)
    const message = formatInvoiceForWhatsApp(invoice, customer, generateInvoiceNumber(invoice.id))
    shareViaWhatsApp(customer?.phone, message)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">Create and manage invoices</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              customerId: '',
              items: [{ description: '', quantity: 1, price: 0 }],
              notes: '',
              dueDate: '',
            })
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Invoice</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="input-field"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="input-field w-20"
                  />
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                    className="input-field w-28"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Additional notes or payment terms"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Create Invoice</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No invoices created yet</p>
          <p className="text-sm text-gray-400 mt-2">Click "Create Invoice" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.slice().reverse().map((invoice) => (
            <div key={invoice.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {generateInvoiceNumber(invoice.id)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getCustomerName(invoice.customerId)} • {formatDate(invoice.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadInvoice(invoice)}
                    className="btn-secondary flex items-center gap-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => shareInvoiceViaWhatsApp(invoice)}
                    className="btn-secondary flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.description} (×{item.quantity})
                    </span>
                    <span className="text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

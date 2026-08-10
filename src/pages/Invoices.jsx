import { useState } from 'react'
import { Plus, Download, Trash2, Share2, FileText } from 'lucide-react'
import { invoicesService } from '../services/invoicesService'
import { customersService } from '../services/customersService'
import useAsyncData from '../hooks/useAsyncData'
import { formatCurrency, formatDate } from '../utils/supabaseStorage'
import { shareViaWhatsApp, formatInvoiceForWhatsApp } from '../utils/whatsapp'
import { PageHeader, Button, Modal, EmptyState, ConfirmDialog, LoadingSpinner } from '../components/ui'

const initialFormData = {
  customer_id: '',
  items: [{ description: '', quantity: 1, price: 0 }],
  notes: '',
  due_date: '',
}

export default function Invoices() {
  const { data: invoices, loading: invoicesLoading, error: invoicesError, reload: loadInvoices } = useAsyncData(() => invoicesService.list())
  const { data: customers } = useAsyncData(() => customersService.list())

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown'
  }

  const generateInvoiceNumber = (id) => 'INV-' + id.toUpperCase().slice(-6)

  const calculateTotal = () => formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, price: 0 }] })

  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setFormData({ ...formData, items: updatedItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await invoicesService.create({ ...formData, total: calculateTotal(), status: 'pending' })
      setFormData(initialFormData)
      setShowForm(false)
      loadInvoices()
    } catch (err) {
      alert(err.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await invoicesService.remove(deleteId)
      setDeleteId(null)
      loadInvoices()
    } catch (err) {
      alert(err.message || 'Failed to delete invoice')
    } finally {
      setDeleteLoading(false)
    }
  }

  const downloadInvoice = (invoice) => {
    const customer = customers.find(c => c.id === invoice.customer_id)
    const invNumber = generateInvoiceNumber(invoice.id)
    const itemLines = invoice.items.map((item, i) =>
      (i + 1) + '. ' + item.description + '\n   Qty: ' + item.quantity + ' x ' + formatCurrency(item.price) + ' = ' + formatCurrency(item.quantity * item.price)
    ).join('\n\n')
    const text =
      'INVOICE\n' + invNumber +
      '\nDate: ' + formatDate(invoice.created_at) +
      '\nDue: ' + (invoice.due_date ? formatDate(invoice.due_date) : 'N/A') +
      '\n\nBILL TO:\n' + (customer ? customer.name : 'Unknown') +
      '\n' + (customer?.phone || '') +
      '\n' + (customer?.email || '') +
      '\n\nITEMS:\n' + itemLines +
      '\n\nTOTAL: ' + formatCurrency(invoice.total) +
      '\n\nNOTES:\n' + (invoice.notes || 'None')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = invNumber + '.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareInvoiceViaWhatsApp = (invoice) => {
    const customer = customers.find(c => c.id === invoice.customer_id)
    const message = formatInvoiceForWhatsApp(invoice, customer, generateInvoiceNumber(invoice.id))
    shareViaWhatsApp(customer?.phone, message)
  }

  if (invoicesLoading) return <LoadingSpinner className="py-20" />
  if (invoicesError) return <div className="text-center py-20 text-red-600">{invoicesError}</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create and manage invoices"
        action={
          <Button icon={Plus} onClick={() => { setFormData(initialFormData); setShowForm(true) }}>
            Create Invoice
          </Button>
        }
      />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Invoice" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select required value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} className="input-field">
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input type="text" required placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="input-field flex-1" />
                <input type="number" required min="1" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} className="input-field w-20" />
                <input type="number" required step="0.01" min="0" placeholder="Price" value={item.price} onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))} className="input-field w-28" />
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800 px-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={addItem}>+ Add Item</Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={3} placeholder="Additional notes or payment terms" />
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={submitting} className="flex-1">Create Invoice</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices created yet" description='Click "Create Invoice" to get started' />
      ) : (
        <div className="space-y-4">
          {invoices.slice().reverse().map((invoice) => (
            <div key={invoice.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{generateInvoiceNumber(invoice.id)}</h3>
                  <p className="text-sm text-gray-500">{getCustomerName(invoice.customer_id)} - {formatDate(invoice.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={Download} onClick={() => downloadInvoice(invoice)}>Download</Button>
                  <Button size="sm" variant="success" icon={Share2} onClick={() => shareInvoiceViaWhatsApp(invoice)}>WhatsApp</Button>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteId(invoice.id)}>Delete</Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.description} (x{item.quantity})</span>
                    <span className="text-gray-900">{formatCurrency(item.quantity * item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?"
        loading={deleteLoading}
      />
    </div>
  )
}

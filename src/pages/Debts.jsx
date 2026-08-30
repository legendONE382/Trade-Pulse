import { useState } from 'react'
import { Plus, CheckCircle, Trash2, Clock, MessageCircle } from 'lucide-react'
import { debtsService } from '../services/debtsService'
import { customersService } from '../services/customersService'
import useAsyncData from '../hooks/useAsyncData'
import { formatCurrency, formatDate } from '../utils/supabaseStorage'
import { buildDebtReminderMessage, getBusinessName, openWhatsApp } from '../utils/whatsapp'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, Button, Modal, Badge, EmptyState, ConfirmDialog, LoadingSpinner } from '../components/ui'

export default function Debts() {
  const { data: debts, loading: debtsLoading, error: debtsError, reload: loadDebts } = useAsyncData(debtsService.list)
  const { data: customers, reload: loadCustomers } = useAsyncData(customersService.list)
  const { user } = useAuth()
  const businessName = getBusinessName(user)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ customer_id: '', amount: '', description: '', due_date: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown'
  }

  const pendingDebts = debts.filter(d => d.status === 'pending')
  const paidDebts = debts.filter(d => d.status === 'paid')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await debtsService.create({
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'pending',
      })
      setFormData({ customer_id: '', amount: '', description: '', due_date: '' })
      setShowForm(false)
      loadDebts()
    } catch (err) {
      alert(err.message || 'Failed to add debt')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await debtsService.update(id, { status: 'paid', paid_at: new Date().toISOString() })
      loadDebts()
    } catch (err) {
      alert(err.message || 'Failed to mark as paid')
    }
  }

  const handleDebtReminder = (debt) => {
    const customer = customers.find(c => c.id === debt.customer_id)
    const message = buildDebtReminderMessage(customer, debt, businessName)
    const result = openWhatsApp(customer?.phone, message)
    if (!result.ok) openWhatsApp(null, message)
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await debtsService.remove(deleteId)
      setDeleteId(null)
      loadDebts()
    } catch (err) {
      alert(err.message || 'Failed to delete debt')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (debtsLoading) return <LoadingSpinner className="py-20" />
  if (debtsError) return <div className="text-center py-20 text-red-600">{debtsError}</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Debts & Credits"
        description="Track customer debts and repayments"
        action={
          <Button icon={Plus} onClick={() => { setFormData({ customer_id: '', amount: '', description: '', due_date: '' }); setShowForm(true) }}>
            Add Debt
          </Button>
        }
      />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Debt">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input type="number" required step="0.01" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" placeholder="What is this debt for?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={submitting} className="flex-1">Add Debt</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Pending Debts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Pending Debts ({pendingDebts.length})
        </h3>
        {pendingDebts.length === 0 ? (
          <EmptyState icon={Clock} title="No pending debts" />
        ) : (
          <div className="space-y-3">
            {pendingDebts.map((debt) => (
              <div key={debt.id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{getCustomerName(debt.customer_id)}</p>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  {debt.description && <p className="text-sm text-gray-600 mt-1">{debt.description}</p>}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-orange-600">{formatCurrency(debt.amount)}</span>
                    {debt.due_date && <span>Due: {formatDate(debt.due_date)}</span>}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="ghost" onClick={() => handleDebtReminder(debt)} icon={MessageCircle} title="Send Debt Reminder via WhatsApp" className="flex-1 sm:flex-none">WhatsApp</Button>
                  <Button size="sm" onClick={() => handleMarkPaid(debt.id)} icon={CheckCircle} className="flex-1 sm:flex-none">Paid</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(debt.id)} icon={Trash2}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Debts */}
      {paidDebts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Paid Debts ({paidDebts.length})
          </h3>
          <div className="space-y-3">
            {paidDebts.map((debt) => (
              <div key={debt.id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-75">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{getCustomerName(debt.customer_id)}</p>
                    <Badge variant="success">Paid</Badge>
                  </div>
                  {debt.description && <p className="text-sm text-gray-600 mt-1">{debt.description}</p>}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-green-600">{formatCurrency(debt.amount)}</span>
                    {debt.paid_at && <span>Paid on: {formatDate(debt.paid_at)}</span>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(debt.id)} icon={Trash2}>Delete</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Debt"
        message="Are you sure you want to delete this debt?"
        loading={deleteLoading}
      />
    </div>
  )
}

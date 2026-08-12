import { useState } from 'react'
import { Plus, Trash2, Share2, Bell, Calendar, CheckCircle } from 'lucide-react'
import { remindersService } from '../services/remindersService'
import { customersService } from '../services/customersService'
import useAsyncData from '../hooks/useAsyncData'
import { formatDate } from '../utils/supabaseStorage'
import { shareViaWhatsApp, formatReminderForWhatsApp } from '../utils/whatsapp'
import { PageHeader, Button, Modal, Badge, EmptyState, ConfirmDialog, LoadingSpinner } from '../components/ui'

export default function Reminders() {
  const { data: reminders, loading: remindersLoading, error: remindersError, reload: loadReminders } = useAsyncData(remindersService.list)
  const { data: customers } = useAsyncData(customersService.list)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', date: '', customer_id: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : null
  }

  const isOverdue = (date) => new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString()
  const isToday = (date) => new Date(date).toDateString() === new Date().toDateString()

  const pendingReminders = reminders.filter(r => r.status === 'pending')
  const completedReminders = reminders.filter(r => r.status === 'completed')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await remindersService.create({ ...formData, status: 'pending' })
      setFormData({ title: '', description: '', date: '', customer_id: '' })
      setShowForm(false)
      loadReminders()
    } catch (err) {
      alert(err.message || 'Failed to add reminder')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await remindersService.remove(deleteId)
      setDeleteId(null)
      loadReminders()
    } catch (err) {
      alert(err.message || 'Failed to delete reminder')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleComplete = async (id) => {
    try {
      await remindersService.update(id, { status: 'completed', completed_at: new Date().toISOString() })
      loadReminders()
    } catch (err) {
      alert(err.message || 'Failed to complete reminder')
    }
  }

  const shareReminderViaWhatsApp = (reminder) => {
    const customer = customers.find(c => c.id === reminder.customer_id)
    const message = formatReminderForWhatsApp(reminder, customer)
    shareViaWhatsApp(customer?.phone, message)
  }

  if (remindersLoading) return <LoadingSpinner className="py-20" />
  if (remindersError) return <div className="text-center py-20 text-red-600">{remindersError}</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders"
        description="Set payment reminders and follow-ups"
        action={
          <Button icon={Plus} onClick={() => { setFormData({ title: '', description: '', date: '', customer_id: '' }); setShowForm(true) }}>
            Add Reminder
          </Button>
        }
      />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Reminder">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="What do you need to remember?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} placeholder="Additional details" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Customer (Optional)</label>
            <select value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} className="input-field">
              <option value="">No specific customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={submitting} className="flex-1">Add Reminder</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Pending Reminders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-600" />
          Pending Reminders ({pendingReminders.length})
        </h3>
        {pendingReminders.length === 0 ? (
          <EmptyState icon={Bell} title="No pending reminders" />
        ) : (
          <div className="space-y-3">
            {pendingReminders
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className={'card flex items-center justify-between ' + (isOverdue(reminder.date) ? 'border-l-4 border-l-red-500' : isToday(reminder.date) ? 'border-l-4 border-l-orange-500' : '')}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{reminder.title}</h4>
                      {isOverdue(reminder.date) && <Badge variant="danger">Overdue</Badge>}
                      {isToday(reminder.date) && <Badge variant="warning">Today</Badge>}
                    </div>
                    {reminder.description && <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(reminder.date)}
                      </span>
                      {getCustomerName(reminder.customer_id) && <span>Customer: {getCustomerName(reminder.customer_id)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" icon={CheckCircle} onClick={() => handleComplete(reminder.id)}>Done</Button>
                    <Button size="sm" variant="success" icon={Share2} onClick={() => shareReminderViaWhatsApp(reminder)}>WhatsApp</Button>
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteId(reminder.id)}>Delete</Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed ({completedReminders.length})
          </h3>
          <div className="space-y-3">
            {completedReminders.slice(-5).reverse().map((reminder) => (
              <div key={reminder.id} className="card flex items-center justify-between opacity-60">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 line-through">{reminder.title}</h4>
                  {reminder.description && <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(reminder.date)}
                    </span>
                    {reminder.completed_at && <span>Completed: {formatDate(reminder.completed_at)}</span>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteId(reminder.id)}>Delete</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder?"
        loading={deleteLoading}
      />
    </div>
  )
}

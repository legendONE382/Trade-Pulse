import { useState, useEffect } from 'react'
import { Plus, Check, X, Pencil, Trash2, Share2, Bell } from 'lucide-react'
import { getReminders, addReminder, updateReminder, deleteReminder, getCustomers, formatDate } from '../utils/supabaseStorage'
import { shareViaWhatsApp, formatReminderForWhatsApp } from '../utils/whatsapp'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    customerId: '',
  })
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    loadReminders()
    loadCustomers()
  }, [])

  const loadReminders = async () => {
    const data = await getReminders()
    setReminders(data)
  }

  const loadCustomers = async () => {
    const data = await getCustomers()
    setCustomers(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    await addReminder({
      ...formData,
      status: 'pending',
    })

    setFormData({
      title: '',
      description: '',
      date: '',
      customerId: '',
    })
    setShowForm(false)
    loadReminders()
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder(id)
      loadReminders()
    }
  }

  const handleComplete = async (id) => {
    await updateReminder(id, { status: 'completed' })
    loadReminders()
  }

  const shareReminderViaWhatsApp = (reminder) => {
    const customer = customers.find(c => c.id === reminder.customerId)
    const message = formatReminderForWhatsApp(reminder, customer)
    shareViaWhatsApp(customer?.phone, message)
  }

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : null
  }

  const pendingReminders = reminders.filter(r => r.status === 'pending')
  const completedReminders = reminders.filter(r => r.status === 'completed')

  const isOverdue = (date) => {
    return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString()
  }

  const isToday = (date) => {
    return new Date(date).toDateString() === new Date().toDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reminders</h2>
          <p className="text-gray-600 mt-1">Set payment reminders and follow-ups</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              date: '',
              customerId: '',
            })
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Reminder
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Reminder</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="What do you need to remember?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Additional details"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Customer (Optional)
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="input-field"
              >
                <option value="">No specific customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Add Reminder</button>
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

      {/* Pending Reminders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-600" />
          Pending Reminders ({pendingReminders.length})
        </h3>
        {pendingReminders.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No pending reminders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReminders
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className={`card flex items-center justify-between ${
                    isOverdue(reminder.date) ? 'border-l-4 border-l-red-500' :
                    isToday(reminder.date) ? 'border-l-4 border-l-orange-500' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{reminder.title}</h4>
                      {isOverdue(reminder.date) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Overdue
                        </span>
                      )}
                      {isToday(reminder.date) && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(reminder.date)}
                      </span>
                      {getCustomerName(reminder.customerId) && (
                        <span>Customer: {getCustomerName(reminder.customerId)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(reminder.id)}
                      className="btn-primary flex items-center gap-1"
                      title="Mark as complete"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Done
                    </button>
                    <button
                      onClick={() => shareReminderViaWhatsApp(reminder)}
                      className="btn-secondary flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                      title="Share via WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                  {reminder.description && (
                    <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(reminder.date)}
                    </span>
                    {reminder.completedAt && (
                      <span>Completed: {formatDate(reminder.completedAt)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react'
import { storage, generateId, formatCurrency, formatDate } from '../utils/storage'

export default function Debts() {
  const [debts, setDebts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    description: '',
    dueDate: '',
  })
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    loadDebts()
    loadCustomers()
  }, [])

  const loadDebts = () => {
    setDebts(storage.get('tradepulse_debts'))
  }

  const loadCustomers = () => {
    setCustomers(storage.get('tradepulse_customers'))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    storage.add('tradepulse_debts', {
      id: generateId(),
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    setFormData({
      customerId: '',
      amount: '',
      description: '',
      dueDate: '',
    })
    setShowForm(false)
    loadDebts()
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this debt?')) {
      storage.delete('tradepulse_debts', id)
      loadDebts()
    }
  }

  const handleMarkPaid = (id) => {
    storage.update('tradepulse_debts', id, { status: 'paid', paidAt: new Date().toISOString() })
    loadDebts()
  }

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown'
  }

  const pendingDebts = debts.filter(d => d.status === 'pending')
  const paidDebts = debts.filter(d => d.status === 'paid')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Debts & Credits</h2>
          <p className="text-gray-600 mt-1">Track customer debts and repayments</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              customerId: '',
              amount: '',
              description: '',
              dueDate: '',
            })
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Debt
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Debt</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="What is this debt for?"
              />
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
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Add Debt</button>
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

      {/* Pending Debts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Pending Debts ({pendingDebts.length})
        </h3>
        {pendingDebts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No pending debts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDebts.map((debt) => (
              <div key={debt.id} className="card flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{getCustomerName(debt.customerId)}</p>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Pending
                    </span>
                  </div>
                  {debt.description && (
                    <p className="text-sm text-gray-600 mt-1">{debt.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(debt.amount)}
                    </span>
                    {debt.dueDate && (
                      <span>Due: {formatDate(debt.dueDate)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkPaid(debt.id)}
                    className="btn-primary flex items-center gap-1"
                    title="Mark as paid"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Paid
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
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

      {/* Paid Debts */}
      {paidDebts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Paid Debts ({paidDebts.length})
          </h3>
          <div className="space-y-3">
            {paidDebts.map((debt) => (
              <div key={debt.id} className="card flex items-center justify-between opacity-75">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{getCustomerName(debt.customerId)}</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Paid
                    </span>
                  </div>
                  {debt.description && (
                    <p className="text-sm text-gray-600 mt-1">{debt.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(debt.amount)}
                    </span>
                    {debt.paidAt && (
                      <span>Paid on: {formatDate(debt.paidAt)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(debt.id)}
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

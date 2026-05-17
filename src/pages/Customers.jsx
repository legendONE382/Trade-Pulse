import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Phone, Mail } from 'lucide-react'
import { storage, generateId } from '../utils/storage'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = () => {
    setCustomers(storage.get('tradepulse_customers'))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingCustomer) {
      storage.update('tradepulse_customers', editingCustomer.id, formData)
      setEditingCustomer(null)
    } else {
      storage.add('tradepulse_customers', {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      })
    }

    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: '',
    })
    setShowForm(false)
    loadCustomers()
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      storage.delete('tradepulse_customers', id)
      loadCustomers()
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      notes: customer.notes || '',
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null)
            setFormData({
              name: '',
              phone: '',
              email: '',
              notes: '',
            })
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="Email address"
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
                placeholder="Additional notes about this customer"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCustomer(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No customers added yet</p>
          <p className="text-sm text-gray-400 mt-2">Click "Add Customer" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div key={customer.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  {customer.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {customer.notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {customer.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

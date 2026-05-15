import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { storage, generateId, formatCurrency, formatDate } from '../utils/storage'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    loadSales()
    loadCustomers()
  }, [])

  const loadSales = () => {
    setSales(storage.get('tradepulse_sales'))
  }

  const loadCustomers = () => {
    setCustomers(storage.get('tradepulse_customers'))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingSale) {
      storage.update('tradepulse_sales', editingSale.id, formData)
      setEditingSale(null)
    } else {
      storage.add('tradepulse_sales', {
        id: generateId(),
        ...formData,
        amount: parseFloat(formData.amount),
      })
    }

    setFormData({
      description: '',
      amount: '',
      customerId: '',
      date: new Date().toISOString().split('T')[0],
    })
    setShowForm(false)
    loadSales()
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      storage.delete('tradepulse_sales', id)
      loadSales()
    }
  }

  const handleEdit = (sale) => {
    setEditingSale(sale)
    setFormData({
      description: sale.description,
      amount: sale.amount,
      customerId: sale.customerId || '',
      date: sale.date,
    })
    setShowForm(true)
  }

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Walk-in'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
          <p className="text-gray-600 mt-1">Track all your sales</p>
        </div>
        <button
          onClick={() => {
            setEditingSale(null)
            setFormData({
              description: '',
              amount: '',
              customerId: '',
              date: new Date().toISOString().split('T')[0],
            })
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Sale
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSale ? 'Edit Sale' : 'Add New Sale'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="What did you sell?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
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
                Customer (Optional)
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="input-field"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingSale ? 'Update Sale' : 'Add Sale'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSale(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {sales.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No sales recorded yet</p>
          <p className="text-sm text-gray-400 mt-2">Click "Add Sale" to get started</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.slice().reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCustomerName(sale.customerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(sale.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

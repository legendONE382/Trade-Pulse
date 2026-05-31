import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getSales, addSale, updateSale, deleteSale, getCustomers, formatCurrency, formatDate } from '../utils/supabaseStorage'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [customers, setCustomers] = useState([])
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadSales()
    loadCustomers()
  }, [])

  const loadSales = async () => {
    const data = await getSales()
    setSales(data)
  }

  const loadCustomers = async () => {
    const data = await getCustomers()
    setCustomers(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      let result
      if (editingSale) {
        result = await updateSale(editingSale.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        })
        if (!result) {
          throw new Error('Unable to update sale. Please try again.')
        }
        setEditingSale(null)
      } else {
        result = await addSale({
          ...formData,
          amount: parseFloat(formData.amount),
        })
        if (!result) {
          throw new Error('Unable to add sale. Please check your values and try again.')
        }
      }

      setFormData({
        description: '',
        amount: '',
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
      })
      setShowForm(false)
      loadSales()
    } catch (error) {
      console.error('Sale submit error:', error)
      setSubmitError(error?.message || 'An unexpected error occurred while saving the sale.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      await deleteSale(id)
      loadSales()
    }
  }

  const handleEdit = (sale) => {
    setEditingSale(sale)
    setFormData({
      description: sale.description,
      amount: sale.amount,
      customer_id: sale.customer_id || '',
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
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
              customer_id: '',
              date: new Date().toISOString().split('T')[0],
            })
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
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
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
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
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary flex-1 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Saving...' : editingSale ? 'Update Sale' : 'Add Sale'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (isSubmitting) return
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
                      {getCustomerName(sale.customer_id)}
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
                        <Pencil className="w-4 h-4" />
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

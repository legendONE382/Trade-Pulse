import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getExpenses, addExpense, updateExpense, deleteExpense, formatCurrency, formatDate } from '../utils/supabaseStorage'

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    const data = await getExpenses()
    setExpenses(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        ...formData,
        amount: parseFloat(formData.amount),
      })
      setEditingExpense(null)
    } else {
      await addExpense({
        ...formData,
        amount: parseFloat(formData.amount),
      })
    }

    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    })
    setShowForm(false)
    loadExpenses()
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id)
      loadExpenses()
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category || '',
      date: expense.date,
    })
    setShowForm(true)
  }

  const categories = [
    'Inventory',
    'Rent',
    'Utilities',
    'Transportation',
    'Marketing',
    'Equipment',
    'Salary',
    'Other',
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
          <p className="text-gray-600 mt-1">Track all your business expenses</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null)
            setFormData({
              description: '',
              amount: '',
              category: '',
              date: new Date().toISOString().split('T')[0],
            })
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
                placeholder="What was this expense for?"
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
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
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingExpense(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No expenses recorded yet</p>
          <p className="text-sm text-gray-400 mt-2">Click "Add Expense" to get started</p>
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
                    Category
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
                {expenses.slice().reverse().map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
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

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import useAsyncData from '../hooks/useAsyncData'
import useForm from '../hooks/useForm'
import { expensesService } from '../services/expensesService'
import { formatCurrency, formatDate } from '../utils/supabaseStorage'
import { PageHeader, Button, Modal, EmptyState, ConfirmDialog, LoadingSpinner } from '../components/ui'

const CATEGORIES = [
  'Inventory',
  'Rent',
  'Utilities',
  'Transportation',
  'Marketing',
  'Equipment',
  'Salary',
  'Other',
]

const EMPTY_FORM = {
  description: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
}

export default function Expenses() {
  const { data: expenses, loading, error, reload } = useAsyncData(expensesService.list)
  const form = useForm(EMPTY_FORM)

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => {
    setEditingExpense(null)
    form.reset()
    setShowForm(true)
  }

  const openEdit = (expense) => {
    setEditingExpense(expense)
    form.setValues({
      description: expense.description,
      amount: expense.amount,
      category: expense.category || '',
      date: expense.date,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingExpense(null)
    form.reset()
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, amount: parseFloat(values.amount) }
    if (editingExpense) {
      await expensesService.update(editingExpense.id, payload)
    } else {
      await expensesService.create(payload)
    }
    closeForm()
    reload()
  })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await expensesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner className="mt-12" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track all your business expenses"
        action={
          <Button icon={Plus} onClick={openCreate} className="w-full sm:w-auto">
            Add Expense
          </Button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {form.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {form.error}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={form.values.description}
              onChange={(e) => form.setValue('description', e.target.value)}
              className="input-field"
              placeholder="What was this expense for?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={form.values.amount}
              onChange={(e) => form.setValue('amount', e.target.value)}
              className="input-field"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.values.category}
              onChange={(e) => form.setValue('category', e.target.value)}
              className="input-field"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.values.date}
              onChange={(e) => form.setValue('date', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={form.isSubmitting} className="flex-1">
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeForm} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteTarget?.description}"? This action cannot be undone.`}
        loading={deleting}
      />

      {!error && expenses.length === 0 ? (
        <EmptyState
          title="No expenses recorded yet"
          description='Click "Add Expense" to get started'
          action={
            <Button icon={Plus} onClick={openCreate}>
              Add Expense
            </Button>
          }
        />
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
                {expenses.map((expense) => (
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
                        onClick={() => openEdit(expense)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(expense)}
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

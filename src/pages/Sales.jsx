import { useState } from 'react'
import { Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react'
import useAsyncData from '../hooks/useAsyncData'
import useForm from '../hooks/useForm'
import { salesService } from '../services/salesService'
import { customersService } from '../services/customersService'
import { formatCurrency, formatDate } from '../utils/supabaseStorage'
import { PageHeader, Button, Modal, EmptyState, ConfirmDialog, Badge, LoadingSpinner } from '../components/ui'

const initialFormValues = {
  description: '',
  amount: '',
  customer_id: '',
  date: new Date().toISOString().split('T')[0],
}

export default function Sales() {
  const sales = useAsyncData(salesService.list)
  const customers = useAsyncData(customersService.list)

  const form = useForm(initialFormValues)
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openCreate = () => {
    setEditingSale(null)
    form.reset()
    setShowForm(true)
  }

  const openEdit = (sale) => {
    setEditingSale(sale)
    form.setValues({
      description: sale.description,
      amount: sale.amount,
      customer_id: sale.customer_id || '',
      date: sale.date,
    })
    setShowForm(true)
  }

  const closeModal = () => {
    setShowForm(false)
    setEditingSale(null)
    form.reset()
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, amount: parseFloat(values.amount) }
    if (editingSale) {
      await salesService.update(editingSale.id, payload)
    } else {
      await salesService.create(payload)
    }
    closeModal()
    sales.reload()
  })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await salesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      sales.reload()
    } catch {
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const getCustomerName = (customerId) => {
    const customer = customers.data.find((c) => c.id === customerId)
    return customer ? customer.name : 'Walk-in'
  }

  if (sales.loading || customers.loading) {
    return <LoadingSpinner size="lg" className="mt-12" />
  }

  if (sales.error || customers.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {sales.error || customers.error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Track all your sales"
        action={
          <Button icon={Plus} onClick={openCreate} className="w-full sm:w-auto">
            Add Sale
          </Button>
        }
      />

      {sales.data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="No sales recorded yet"
            description='Click "Add Sale" to get started'
            action={
              <Button icon={Plus} onClick={openCreate}>
                Add Sale
              </Button>
            }
          />
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
                {sales.data.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCustomerName(sale.customer_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">{formatCurrency(sale.amount)}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(sale)} className="mr-1">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(sale)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={closeModal} title={editingSale ? 'Edit Sale' : 'Add New Sale'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={form.values.description}
              onChange={(e) => form.setValue('description', e.target.value)}
              className="input-field"
              placeholder="What did you sell?"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer (Optional)</label>
            <select
              value={form.values.customer_id}
              onChange={(e) => form.setValue('customer_id', e.target.value)}
              className="input-field"
            >
              <option value="">Walk-in Customer</option>
              {customers.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
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
          {form.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {form.error}
            </div>
          )}
          <div className="flex gap-3">
            <Button type="submit" loading={form.isSubmitting} className="flex-1">
              {editingSale ? 'Update Sale' : 'Add Sale'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={form.isSubmitting} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? This action cannot be undone."
        confirmLabel="Delete"
        loading={isDeleting}
      />
    </div>
  )
}

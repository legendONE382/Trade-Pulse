import { useState } from 'react'
import { Plus, Pencil, Trash2, Phone, Mail, Users } from 'lucide-react'
import { customersService } from '../services/customersService'
import useAsyncData from '../hooks/useAsyncData'
import useForm from '../hooks/useForm'
import {
  PageHeader,
  Button,
  Modal,
  EmptyState,
  ConfirmDialog,
  LoadingSpinner,
} from '../components/ui'

const EMPTY_FORM = { name: '', phone: '', email: '', notes: '' }

export default function Customers() {
  const { data: customers, loading, error, reload } = useAsyncData(() => customersService.list())
  const form = useForm(EMPTY_FORM)

  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const openAdd = () => {
    setEditingCustomer(null)
    form.reset()
    setShowModal(true)
  }

  const openEdit = (customer) => {
    setEditingCustomer(customer)
    form.setValues({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      notes: customer.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCustomer(null)
    form.reset()
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (editingCustomer) {
      await customersService.update(editingCustomer.id, values)
    } else {
      await customersService.create(values)
    }
    closeModal()
    reload()
  })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await customersService.remove(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        action={
          <Button icon={Plus} onClick={openAdd} className="w-full sm:w-auto">
            Add Customer
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner size="lg" className="py-16" />}

      {!loading && customers.length === 0 && (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to get started."
          action={<Button icon={Plus} onClick={openAdd}>Add Customer</Button>}
        />
      )}

      {!loading && customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div key={customer.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                  {customer.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(customer)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(customer)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
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

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={form.values.name}
              onChange={(e) => form.setValue('name', e.target.value)}
              className="input-field"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.values.phone}
              onChange={(e) => form.setValue('phone', e.target.value)}
              className="input-field"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.values.email}
              onChange={(e) => form.setValue('email', e.target.value)}
              className="input-field"
              placeholder="Email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.values.notes}
              onChange={(e) => form.setValue('notes', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Additional notes about this customer"
            />
          </div>

          {form.error && (
            <p className="text-sm text-red-600">{form.error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" loading={form.isSubmitting} className="flex-1">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
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
        title="Delete Customer"
        message={`Are you sure you want to delete ${deleteTarget?.name ?? ''}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}

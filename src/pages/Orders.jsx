import { useState, useMemo } from 'react'
import { Plus, Trash2, ShoppingBag } from 'lucide-react'
import useAsyncData from '../hooks/useAsyncData'
import { orderService } from '../services/orderService'
import { customersService } from '../services/customersService'
import { productsService } from '../services/productsService'
import { inventoryService } from '../services/inventoryService'
import { PageHeader, Button, Modal, EmptyState, ConfirmDialog, Badge, LoadingSpinner } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/supabaseStorage'
import { shareViaWhatsApp } from '../utils/whatsapp'

const ORDER_STATUSES = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

const PAYMENT_STATUSES = {
  unpaid: { label: 'Unpaid', variant: 'danger' },
  partial: { label: 'Partial', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
}

export default function Orders() {
  const { data: orders, loading, error, reload } = useAsyncData(orderService.list)
  const { data: customers } = useAsyncData(customersService.list)
  const { data: products } = useAsyncData(productsService.list)

  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: 1 }],
    discount: '0',
    tax: '0',
    notes: '',
  })

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Walk-in'
  const getProduct = (id) => products.find(p => p.id === id)

  const subtotal = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const product = getProduct(item.product_id)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)
  }, [formData.items, products])

  const total = subtotal - parseFloat(formData.discount || 0) + parseFloat(formData.tax || 0)

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1 }],
    })
  }

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index, field, value) => {
    const updated = [...formData.items]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, items: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const orderItems = formData.items
      .filter(item => item.product_id)
      .map(item => {
        const product = getProduct(item.product_id)
        return {
          product_id: item.product_id,
          product_name: product?.name || '',
          quantity: item.quantity,
          price: product?.price || 0,
        }
      })
    if (orderItems.length === 0) return

    await orderService.create({
      customer_id: formData.customer_id || null,
      items: orderItems,
      subtotal,
      discount: parseFloat(formData.discount || 0),
      tax: parseFloat(formData.tax || 0),
      total,
      notes: formData.notes || null,
    })

    setFormData({
      customer_id: '',
      items: [{ product_id: '', quantity: 1 }],
      discount: '0',
      tax: '0',
      notes: '',
    })
    setShowForm(false)
    reload()
  }

  const handleConfirm = async (id) => {
    const order = orders.find(o => o.id === id)
    if (!order) return
    await orderService.confirm(id)
    for (const item of order.items) {
      try {
        await inventoryService.record({
          productId: item.product_id,
          type: 'sale',
          quantity: -item.quantity,
          referenceId: id,
          referenceType: 'order',
          notes: `Order ${id}`,
        })
      } catch (err) {
        console.error('Failed to record inventory movement:', err)
      }
    }
    reload()
  }

  const handleDeliver = async (id) => {
    await orderService.deliver(id)
    reload()
  }

  const handleCancel = async (id) => {
    await orderService.cancel(id)
    reload()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await orderService.remove(deleteTarget.id)
    setDeleteTarget(null)
    reload()
  }

  const shareOrderWhatsApp = (order) => {
    const customer = customers.find(c => c.id === order.customer_id)
    const items = order.items.map((item, i) =>
      `${i + 1}. ${item.product_name} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
    ).join('\n')
    const msg = `*ORDER ${order.id.slice(-6).toUpperCase()}*\n\n${items}\n\nTotal: ${formatCurrency(order.total)}\nStatus: ${ORDER_STATUSES[order.status]?.label}`
    shareViaWhatsApp(customer?.phone, msg)
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders and track fulfillment"
        action={
          <Button icon={Plus} onClick={() => setShowForm(true)}>
            New Order
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Order" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="input-field"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    required
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="input-field w-20"
                  />
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                + Add Item
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <input type="number" step="0.01" min="0" value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                <input type="number" step="0.01" min="0" value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  className="input-field" placeholder="0.00" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field" rows={2} placeholder="Optional notes" />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">Create Order</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {orders.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Create your first order to start tracking sales"
            action={<Button icon={Plus} onClick={() => setShowForm(true)}>Create Order</Button>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                    <Badge variant={ORDER_STATUSES[order.status]?.variant}>{ORDER_STATUSES[order.status]?.label}</Badge>
                    <Badge variant={PAYMENT_STATUSES[order.payment_status]?.variant}>{PAYMENT_STATUSES[order.payment_status]?.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {getCustomerName(order.customer_id)} &middot; {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product_name} x{item.quantity}</span>
                    <span className="text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                {order.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => handleConfirm(order.id)}>Confirm</Button>
                    <Button size="sm" variant="danger" onClick={() => handleCancel(order.id)}>Cancel</Button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <Button size="sm" variant="success" onClick={() => handleDeliver(order.id)}>Mark Delivered</Button>
                )}
                {order.status !== 'cancelled' && order.payment_status !== 'paid' && (
                  <Button size="sm" variant="ghost" onClick={() => orderService.markPaid(order.id).then(reload)}>
                    Mark Paid
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => shareOrderWhatsApp(order)}>WhatsApp</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(order)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order #${deleteTarget?.id.slice(-6).toUpperCase()}? This action cannot be undone.`}
      />
    </div>
  )
}

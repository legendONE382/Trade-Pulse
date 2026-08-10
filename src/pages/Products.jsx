import { useState } from 'react'
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import { productsService } from '../services/productsService'
import { formatCurrency } from '../utils/supabaseStorage'
import useAsyncData from '../hooks/useAsyncData'
import useForm from '../hooks/useForm'
import { PageHeader, Button, Modal, EmptyState, ConfirmDialog, Badge, LoadingSpinner } from '../components/ui'

const INITIAL_FORM = {
  name: '',
  barcode: '',
  sku: '',
  category: '',
  price: '',
  cost: '',
  stock: '',
  min_stock: '5',
  description: '',
}

const CATEGORIES = [
  'Electronics',
  'Food & Beverages',
  'Clothing',
  'Home & Garden',
  'Health & Beauty',
  'Auto Parts',
  'Office Supplies',
  'Other',
]

export default function Products() {
  const { data: products, loading, error, reload, setData: setProducts } = useAsyncData(productsService.list)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { values: form, setValue, reset: resetForm, isSubmitting, error: formError, setError: setFormError, handleSubmit } = useForm(INITIAL_FORM)

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock)
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)

  const openAddForm = () => {
    setEditingProduct(null)
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingProduct(product)
    setValues(product)
    setShowForm(true)
  }

  const setValues = (product) => {
    Object.entries(INITIAL_FORM).forEach(([key]) => {
      setValue(key, product[key] ?? (key === 'min_stock' ? '5' : ''))
    })
  }

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      price: parseFloat(values.price),
      cost: parseFloat(values.cost),
      stock: parseInt(values.stock),
      min_stock: parseInt(values.min_stock),
    }

    if (editingProduct) {
      await productsService.update(editingProduct.id, payload)
    } else {
      await productsService.create(payload)
    }

    setEditingProduct(null)
    setShowForm(false)
    reload()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } catch {
      setFormError('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const adjustStock = async (id, adjustment) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const newStock = Math.max(0, product.stock + adjustment)
    try {
      await productsService.update(id, { stock: newStock })
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
    } catch {
      setFormError('Failed to update stock')
    }
  }

  if (loading) {
    return <LoadingSpinner className="py-20" />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Products & Inventory" description="Manage your product catalog and stock levels" />
        <div className="card p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Button onClick={reload} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Inventory"
        description="Manage your product catalog and stock levels"
        action={
          <Button icon={Plus} onClick={openAddForm} className="w-full sm:w-auto">
            Add Product
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStockValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="card bg-orange-50 border-orange-200">
          <h3 className="font-semibold text-orange-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alert
          </h3>
          <div className="mt-3 space-y-2">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center text-sm">
                <span className="text-orange-800">{product.name}</span>
                <span className="font-semibold text-orange-900">
                  {product.stock} left (min: {product.min_stock})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingProduct(null) }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setValue('name', e.target.value)}
                className="input-field"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
              <input
                type="text"
                value={form.barcode}
                onChange={(e) => setValue('barcode', e.target.value)}
                className="input-field"
                placeholder="Scan or enter barcode"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setValue('sku', e.target.value)}
                className="input-field"
                placeholder="Stock keeping unit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setValue('category', e.target.value)}
                className="input-field"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setValue('price', e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setValue('cost', e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setValue('stock', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Alert</label>
              <input
                type="number"
                min="0"
                value={form.min_stock}
                onChange={(e) => setValue('min_stock', e.target.value)}
                className="input-field"
                placeholder="5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setValue('description', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Product description"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} className="flex-1">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingProduct(null) }} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product to start managing inventory"
            action={
              <Button icon={Plus} onClick={openAddForm}>Add Product</Button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.barcode && <p className="text-sm text-gray-500">Barcode: {product.barcode}</p>}
                        {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${product.stock <= product.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => adjustStock(product.id, -1)} className="px-2 py-0.5 text-xs">-</Button>
                          <Button size="sm" variant="ghost" onClick={() => adjustStock(product.id, 1)} className="px-2 py-0.5 text-xs">+</Button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={product.stock === 0 ? 'danger' : product.stock <= product.min_stock ? 'warning' : 'success'}>
                        {product.stock === 0 ? 'Out of Stock' : product.stock <= product.min_stock ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="sm" variant="ghost" onClick={() => openEditForm(product)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(product)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

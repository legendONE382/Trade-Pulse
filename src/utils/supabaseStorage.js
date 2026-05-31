import { supabase } from '../lib/supabase'

// Helper function to get current user
const getCurrentUserId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.debug('supabase.getUser -> user id:', user?.id)
    return user?.id
  } catch (err) {
    console.error('Error getting current Supabase user:', err)
    return null
  }
}

// Sales
export const getSales = async () => {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching sales:', error)
    return []
  }
  
  return data || []
}

export const addSale = async (sale) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  // Ensure amount is a finite number and within DECIMAL(10,2) limits
  const MAX_AMOUNT = 99999999.99 // DECIMAL(10,2) max absolute value
  let amt = Number(sale.amount)
  if (!Number.isFinite(amt) || Number.isNaN(amt)) {
    console.warn('addSale: invalid amount, defaulting to 0', sale.amount)
    amt = 0
  }
  // Clamp and round to 2 decimals
  if (Math.abs(amt) > MAX_AMOUNT) {
    console.warn('addSale: amount exceeds max, clamping', amt)
    amt = Math.sign(amt) * MAX_AMOUNT
  }
  amt = Math.round((amt + Number.EPSILON) * 100) / 100

  const payload = { id: generateId(), ...sale, amount: amt, user_id: userId }

  const { data, error } = await supabase
    .from('sales')
    .insert([payload])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding sale:', error)
    return null
  }
  
  return data
}

export const updateSale = async (id, updates) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('sales')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating sale:', error)
    return null
  }
  
  return data
}

export const deleteSale = async (id) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting sale:', error)
    return false
  }
  
  return true
}

// Expenses
export const getExpenses = async () => {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
  
  return data || []
}

export const addExpense = async (expense) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ id: generateId(), ...expense, user_id: userId }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding expense:', error)
    return null
  }
  
  return data
}

export const updateExpense = async (id, updates) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating expense:', error)
    return null
  }
  
  return data
}

export const deleteExpense = async (id) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting expense:', error)
    return false
  }
  
  return true
}

// Customers
export const getCustomers = async () => {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  
  return data || []
}

export const addCustomer = async (customer) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{ id: generateId(), ...customer, user_id: userId }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding customer:', error)
    return null
  }
  
  return data
}

export const updateCustomer = async (id, updates) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating customer:', error)
    return null
  }
  
  return data
}

export const deleteCustomer = async (id) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting customer:', error)
    return false
  }
  
  return true
}

// Debts
export const getDebts = async () => {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching debts:', error)
    return []
  }
  
  return data || []
}

export const addDebt = async (debt) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('debts')
    .insert([{ id: generateId(), ...debt, user_id: userId }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding debt:', error)
    return null
  }
  
  return data
}

export const updateDebt = async (id, updates) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('debts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating debt:', error)
    return null
  }
  
  return data
}

export const deleteDebt = async (id) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting debt:', error)
    return false
  }
  
  return true
}

// Invoices
export const getInvoices = async () => {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
  
  return data || []
}

export const addInvoice = async (invoice) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('invoices')
    .insert([{ id: generateId(), ...invoice, user_id: userId }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding invoice:', error)
    return null
  }
  
  return data
}

export const updateInvoice = async (id, updates) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating invoice:', error)
    return null
  }
  
  return data
}

export const deleteInvoice = async (id) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting invoice:', error)
    return false
  }
  
  return true
}

// Reminders
export const getReminders = async () => {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  
  if (error) {
    console.error('Error fetching reminders:', error)
    return []
  }
  
  return data || []
}

export const addReminder = async (reminder) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('reminders')
    .insert([{ id: generateId(), ...reminder, user_id: userId }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding reminder:', error)
    return null
  }
  
  return data
}

export const updateReminder = async (id, updates) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating reminder:', error)
    return null
  }
  
  return data
}

export const deleteReminder = async (id) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting reminder:', error)
    return false
  }
  
  return true
}

// Products
export const getProducts = async () => {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data || []
}

export const addProduct = async (product) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('products')
    .insert([{ id: generateId(), ...product, user_id: userId }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding product:', error)
    return null
  }
  
  return data
}

export const updateProduct = async (id, updates) => {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating product:', error)
    return null
  }
  
  return data
}

export const deleteProduct = async (id) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting product:', error)
    return false
  }
  
  return true
}

// Utility functions
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount)
}

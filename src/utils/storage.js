// LocalStorage utility functions for data persistence

const STORAGE_KEYS = {
  SALES: 'tradepulse_sales',
  EXPENSES: 'tradepulse_expenses',
  CUSTOMERS: 'tradepulse_customers',
  DEBTS: 'tradepulse_debts',
  INVOICES: 'tradepulse_invoices',
  REMINDERS: 'tradepulse_reminders',
}

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : []
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return []
    }
  },

  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  },

  add: (key, item) => {
    const data = storage.get(key)
    data.push(item)
    storage.set(key, data)
    return data
  },

  update: (key, id, updates) => {
    const data = storage.get(key)
    const index = data.findIndex(item => item.id === id)
    if (index !== -1) {
      data[index] = { ...data[index], ...updates }
      storage.set(key, data)
    }
    return data
  },

  delete: (key, id) => {
    const data = storage.get(key)
    const filtered = data.filter(item => item.id !== id)
    storage.set(key, filtered)
    return filtered
  },
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount)
}

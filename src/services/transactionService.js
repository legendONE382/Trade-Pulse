import { getCurrentUserId } from './helpers'
import { fetchAll, insertOne, deleteOne } from './storage'

const TABLE = 'transactions'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

export const transactionService = {
  async list(filters = {}) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    let all = await fetchAll(TABLE, userId)
    if (filters.type) {
      all = all.filter(t => t.type === filters.type)
    }
    if (filters.from) {
      all = all.filter(t => t.date >= filters.from)
    }
    if (filters.to) {
      all = all.filter(t => t.date <= filters.to)
    }
    return all
  },

  async create(transaction) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = generateId()
    return insertOne(TABLE, { id, ...transaction, user_id: userId })
  },

  async remove(id) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return deleteOne(TABLE, id, userId)
  },

  async getSummary(dateFrom, dateTo) {
    const transactions = await this.list({ from: dateFrom, to: dateTo })
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const refunds = transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    return { income, expenses, refunds, net: income - expenses - refunds }
  },
}

import { getCurrentUserId } from './helpers'
import { fetchAll, insertOne, updateOne, deleteOne } from './storage'

const TABLE = 'sales'

export const salesService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    return fetchAll(TABLE, userId)
  },

  async create(sale) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const MAX_AMOUNT = 99999999.99
    let amt = Number(sale.amount)
    if (!Number.isFinite(amt)) amt = 0
    if (Math.abs(amt) > MAX_AMOUNT) amt = Math.sign(amt) * MAX_AMOUNT
    amt = Math.round((amt + Number.EPSILON) * 100) / 100
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    return insertOne(TABLE, { id, ...sale, amount: amt, user_id: userId })
  },

  async update(id, updates) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return updateOne(TABLE, id, userId, updates)
  },

  async remove(id) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return deleteOne(TABLE, id, userId)
  },
}

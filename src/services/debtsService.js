import { getCurrentUserId } from './helpers'
import { fetchAll, insertOne, updateOne, deleteOne } from './storage'

const TABLE = 'debts'

export const debtsService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    return fetchAll(TABLE, userId)
  },

  async listPending() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    const all = await fetchAll(TABLE, userId)
    return all.filter(d => d.status === 'pending')
  },

  async listPaid() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    const all = await fetchAll(TABLE, userId)
    return all.filter(d => d.status === 'paid')
  },

  async create(debt) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    return insertOne(TABLE, { id, ...debt, user_id: userId })
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

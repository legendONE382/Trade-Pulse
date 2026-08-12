import { getCurrentUserId } from './helpers'
import { fetchAll, insertOne, updateOne, deleteOne } from './storage'

const TABLE = 'expenses'

export const expensesService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    return fetchAll(TABLE, userId)
  },

  async create(expense) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    return insertOne(TABLE, { id, ...expense, user_id: userId })
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

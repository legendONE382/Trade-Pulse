import { getCurrentUserId } from './helpers'
import { fetchAll, insertOne, updateOne, deleteOne } from './storage'

const TABLE = 'orders'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

export const orderService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return fetchAll(TABLE, userId)
  },

  async create(order) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = generateId()
    return insertOne(TABLE, { id, ...order, user_id: userId })
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

  async confirm(id) {
    return this.update(id, { status: 'confirmed' })
  },

  async deliver(id) {
    return this.update(id, { status: 'delivered', payment_status: 'paid' })
  },

  async cancel(id) {
    return this.update(id, { status: 'cancelled' })
  },

  async markPaid(id) {
    return this.update(id, { payment_status: 'paid' })
  },
}

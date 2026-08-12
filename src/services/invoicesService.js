import { getCurrentUserId } from './helpers'
import { fetchAll, insertOne, updateOne, deleteOne } from './storage'

const TABLE = 'invoices'

export const invoicesService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    return fetchAll(TABLE, userId)
  },

  async listPending() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    const all = await fetchAll(TABLE, userId)
    return all.filter(i => i.status === 'pending')
  },

  async listPaid() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    const all = await fetchAll(TABLE, userId)
    return all.filter(i => i.status === 'paid')
  },

  async create(invoice) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    return insertOne(TABLE, { id, ...invoice, user_id: userId })
  },

  async update(id, updates) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return updateOne(TABLE, id, userId, updates)
  },

  async send(id) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return updateOne(TABLE, id, userId, { status: 'sent' })
  },

  async markPaid(id) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return updateOne(TABLE, id, userId, { status: 'paid', payment_status: 'paid' })
  },

  async remove(id) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    return deleteOne(TABLE, id, userId)
  },
}

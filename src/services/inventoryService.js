import { getCurrentUserId } from './helpers'
import { fetchAll, insertOne, updateOne, deleteOne } from './storage'

const TABLE = 'inventory_movements'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

export const inventoryService = {
  async list(productId = null) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const all = await fetchAll(TABLE, userId)
    if (productId) {
      return all.filter(m => m.product_id === productId)
    }
    return all
  },

  async record({ productId, type, quantity, referenceId, referenceType, notes }) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = generateId()
    return insertOne(TABLE, {
      id,
      user_id: userId,
      product_id: productId,
      type,
      quantity,
      reference_id: referenceId || null,
      reference_type: referenceType || null,
      notes: notes || null,
    })
  },

  async getByProduct(productId) {
    return this.list(productId)
  },

  async getSummary() {
    const movements = await this.list()
    const summary = {
      totalPurchases: 0,
      totalSales: 0,
      totalReturns: 0,
      totalAdjustments: 0,
      totalDamage: 0,
    }
    movements.forEach(m => {
      switch (m.type) {
        case 'purchase': summary.totalPurchases += Math.abs(m.quantity); break
        case 'sale': summary.totalSales += Math.abs(m.quantity); break
        case 'return': summary.totalReturns += Math.abs(m.quantity); break
        case 'adjustment': summary.totalAdjustments += Math.abs(m.quantity); break
        case 'damage': summary.totalDamage += Math.abs(m.quantity); break
      }
    })
    return summary
  },
}

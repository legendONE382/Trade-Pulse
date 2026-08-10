import { supabase } from '../lib/supabase'

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

export const inventoryService = {
  async list(productId = null) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    let query = supabase
      .from('inventory_movements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (productId) query = query.eq('product_id', productId)
    const { data, error } = await query
    if (error) {
      console.error('Error fetching inventory:', error)
      return []
    }
    return data || []
  },

  async record({ productId, type, quantity, referenceId, referenceType, notes }) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert([{
        id: generateId(),
        user_id: userId,
        product_id: productId,
        type,
        quantity,
        reference_id: referenceId || null,
        reference_type: referenceType || null,
        notes: notes || null,
      }])
      .select()
      .single()
    if (error) throw error
    return data
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

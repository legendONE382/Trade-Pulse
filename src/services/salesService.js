import { supabase } from '../lib/supabase'

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export const salesService = {
  async list() {
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
    const { data, error } = await supabase
      .from('sales')
      .insert([{ id, ...sale, amount: amt, user_id: userId }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('sales')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },
}

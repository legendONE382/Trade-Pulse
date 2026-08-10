import { supabase } from '../lib/supabase'

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

export const orderService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }
    return data || []
  },

  async create(order) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('orders')
      .insert([{ id: generateId(), ...order, user_id: userId }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('orders')
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
      .from('orders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return true
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

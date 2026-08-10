import { supabase } from '../lib/supabase'

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export const productsService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching products:', error)
      return []
    }
    return data || []
  },

  async create(product) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    const { data, error } = await supabase
      .from('products')
      .insert([{ id, ...product, user_id: userId }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('products')
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
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },
}

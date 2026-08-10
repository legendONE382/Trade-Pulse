import { supabase } from '../lib/supabase'

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export const remindersService = {
  async list() {
    const userId = await getCurrentUserId()
    if (!userId) return []
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
    if (error) throw error
    return data || []
  },

  async create(reminder) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ id, ...reminder, user_id: userId }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('reminders')
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
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },
}

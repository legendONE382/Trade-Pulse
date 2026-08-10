import { supabase } from '../lib/supabase'

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

export const transactionService = {
  async list(filters = {}) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.from) query = query.gte('date', filters.from)
    if (filters.to) query = query.lte('date', filters.to)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async create(transaction) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ id: generateId(), ...transaction, user_id: userId }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },

  async getSummary(dateFrom, dateTo) {
    const transactions = await this.list({ from: dateFrom, to: dateTo })
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const refunds = transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    return { income, expenses, refunds, net: income - expenses - refunds }
  },
}

import { supabase } from '../lib/supabase'

const PREFIX = 'tp_'

function localGet(table) {
  try { return JSON.parse(localStorage.getItem(PREFIX + table) || '[]') } catch { return [] }
}

function localSet(table, data) {
  localStorage.setItem(PREFIX + table, JSON.stringify(data))
}

export async function fetchAll(table, userId) {
  try {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    localSet(table, data)
    return data || []
  } catch {
    return localGet(table).filter(r => r.user_id === userId)
  }
}

export async function insertOne(table, record) {
  const { data, error } = await supabase.from(table).insert([record]).select().single()
  if (error) throw error
  const all = localGet(table)
  localSet(table, [...all, data])
  return data
}

export async function updateOne(table, id, userId, updates) {
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).eq('user_id', userId).select().single()
  if (error) throw error
  const all = localGet(table).map(r => r.id === id ? data : r)
  localSet(table, all)
  return data
}

export async function deleteOne(table, id, userId) {
  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
  const all = localGet(table).filter(r => r.id !== id)
  localSet(table, all)
  return true
}

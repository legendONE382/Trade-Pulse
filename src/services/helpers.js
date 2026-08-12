import { supabase } from '../lib/supabase'

export async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

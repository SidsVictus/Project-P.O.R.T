import { supabaseAdmin } from '../../config/database'
import { encrypt, decrypt } from '../credentials/crypto'

const TABLE = 'custom_providers'

export interface CustomProvider {
  id: string
  user_id: string
  name: string
  token_encrypted: string
  email?: string
  created_at: string
}

export async function createCustomProvider(userId: string, name: string, token: string, email?: string) {
  const encrypted = encrypt(token)
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .upsert({ user_id: userId, name, token_encrypted: encrypted, email }, { onConflict: 'user_id,name' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCustomProviders(userId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('id, user_id, name, email, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getCustomProviderToken(userId: string, name: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('name', name)
    .single()
  if (error || !data) return null
  return { ...data, token: decrypt(data.token_encrypted) }
}

export async function deleteCustomProvider(userId: string, name: string) {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('name', name)
  if (error) throw error
}

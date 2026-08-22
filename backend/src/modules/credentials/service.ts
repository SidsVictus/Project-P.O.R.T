import { supabaseAdmin } from '../../config/database'
import { encrypt, decrypt } from './crypto'
import { Provider } from '../../shared/types'

const TABLE = 'credentials'

export async function storeCredential(userId: string, provider: Provider, token: string, email?: string) {
  const encrypted = encrypt(token)
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .upsert({ user_id: userId, provider, token_encrypted: encrypted, email }, { onConflict: 'user_id,provider' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCredential(userId: string, provider: Provider) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()
  if (error || !data) return null
  return { ...data, token: decrypt(data.token_encrypted) }
}

export async function getAllCredentials(userId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('id, provider, email, created_at')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function deleteCredential(userId: string, provider: Provider) {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider)
  if (error) throw error
}

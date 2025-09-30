import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const getAdminClient = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

function decrypt(encrypted: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'),
    iv
  )
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function getUserApiKey(
  userId: string,
  provider: string
): Promise<string | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('user_keys')
      .select('encrypted_key, iv')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single()

    if (error || !data) {
      return null
    }

    return decrypt(data.encrypted_key, data.iv)
  } catch (error) {
    console.error(`Error fetching ${provider} key for user ${userId}:`, error)
    return null
  }
}

export async function getUserApiKeys(
  userId: string,
  providers: string[]
): Promise<Record<string, string>> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('user_keys')
      .select('provider, encrypted_key, iv')
      .eq('user_id', userId)
      .in('provider', providers)

    if (error || !data) {
      return {}
    }

    const keys: Record<string, string> = {}
    data.forEach((row: { provider: string; encrypted_key: string; iv: string }) => {
      try {
        keys[row.provider] = decrypt(row.encrypted_key, row.iv)
      } catch (err) {
        console.error(`Error decrypting ${row.provider} key:`, err)
      }
    })

    return keys
  } catch (error) {
    console.error(`Error fetching keys for user ${userId}:`, error)
    return {}
  }
}

import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const getAdminClient = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is required')
  }
  
  const key = Buffer.from(ENCRYPTION_KEY, 'base64')
  
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes long')
  }
  
  return key
}

function decrypt(encryptedData: string, ivHex: string): string {
  const key = getEncryptionKey()
  const [encrypted, authTagHex] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

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
      console.log(`No ${provider} key found for user ${userId}`)
      return null
    }

    console.log(`Decrypting ${provider} key - encrypted length:`, data.encrypted_key.length, 'iv length:', data.iv.length)
    const decrypted = decrypt(data.encrypted_key, data.iv)
    console.log(`Decrypted ${provider} key - first 10 chars:`, decrypted.substring(0, 10))
    return decrypted
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

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Admin client for database operations
const getAdminClient = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Encryption key - should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'),
    iv
  )
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return { encrypted, iv: iv.toString('hex') }
}

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

// Get current user ID from Supabase session
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('user_keys')
      .select('provider, encrypted_key, iv')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching keys:', error)
      return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 })
    }

    const keys: Record<string, string> = {}
    
    if (data) {
      data.forEach((row: { provider: string; encrypted_key: string; iv: string }) => {
        try {
          keys[row.provider] = decrypt(row.encrypted_key, row.iv)
        } catch (err) {
          console.error(`Error decrypting key for ${row.provider}:`, err)
        }
      })
    }

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Error in GET /api/user-keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keys } = body

    if (!Array.isArray(keys)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Save each key
    for (const key of keys) {
      const { provider, value } = key
      
      if (!provider || !value) continue

      const { encrypted, iv } = encrypt(value)

      const supabase = getAdminClient()
      const { error } = await supabase
        .from('user_keys')
        .upsert({
          user_id: userId,
          provider,
          encrypted_key: encrypted,
          iv,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error(`Error saving key for ${provider}:`, error)
        return NextResponse.json(
          { error: `Failed to save ${provider} key` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user-keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { error } = await supabase
      .from('user_keys')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider)

    if (error) {
      console.error(`Error deleting key for ${provider}:`, error)
      return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/user-keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserApiKey } from '@/lib/user-keys'

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    console.log('GitHub user route - Auth user:', authUser?.id, 'Error:', authError)
    
    if (!authUser?.id) {
      console.log('No authenticated user found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's GitHub token
    const githubToken = await getUserApiKey(authUser.id, 'github')
    
    console.log('GitHub token retrieved:', githubToken ? 'Found' : 'Not found')
    
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token not configured. Please add it in Settings.' }, { status: 400 })
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const githubUser = await response.json()

    return NextResponse.json({
      login: githubUser.login,
      name: githubUser.name,
      avatar_url: githubUser.avatar_url,
    })
  } catch (error) {
    console.error('Error fetching GitHub user:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}

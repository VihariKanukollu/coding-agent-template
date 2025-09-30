import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserApiKey } from '@/lib/user-keys'

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's GitHub token
    const githubToken = await getUserApiKey(authUser.id, 'github')
    
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token not configured. Please add it in Settings.' }, { status: 400 })
    }

    const response = await fetch('https://api.github.com/user/orgs', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const orgs = await response.json()

    interface GitHubOrg {
      login: string
      name?: string
      avatar_url: string
    }

    return NextResponse.json(
      (orgs as GitHubOrg[]).map((org) => ({
        login: org.login,
        name: org.name || org.login,
        avatar_url: org.avatar_url,
      })),
    )
  } catch (error) {
    console.error('Error fetching GitHub organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

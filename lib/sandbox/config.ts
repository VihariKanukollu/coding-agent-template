// Platform-level environment validation (Vercel credentials only)
// User-specific API keys are now validated when fetching from database
export function validateEnvironmentVariables() {
  const errors: string[] = []

  // Check for Vercel sandbox credentials (platform-level)
  if (!process.env.VERCEL_TEAM_ID) {
    errors.push('VERCEL_TEAM_ID is required for sandbox creation')
  }

  if (!process.env.VERCEL_PROJECT_ID) {
    errors.push('VERCEL_PROJECT_ID is required for sandbox creation')
  }

  if (!process.env.VERCEL_TOKEN) {
    errors.push('VERCEL_TOKEN is required for sandbox creation')
  }

  return {
    valid: errors.length === 0,
    error: errors.length > 0 ? errors.join(', ') : undefined,
  }
}

export function createAuthenticatedRepoUrl(repoUrl: string, githubToken?: string): string {
  if (!githubToken) {
    return repoUrl
  }

  try {
    const url = new URL(repoUrl)
    if (url.hostname === 'github.com') {
      // Add GitHub token for authentication
      url.username = githubToken
      url.password = 'x-oauth-basic'
    }
    return url.toString()
  } catch {
    // Failed to parse repository URL
    return repoUrl
  }
}

export function createSandboxConfiguration(config: {
  repoUrl: string
  timeout?: string
  ports?: number[]
  runtime?: string
  resources?: { vcpus?: number }
  branchName?: string
}) {
  return {
    template: 'node',
    git: {
      url: config.repoUrl,
      branch: config.branchName || 'main',
    },
    timeout: config.timeout || '20m',
    ports: config.ports || [3000],
    runtime: config.runtime || 'node22',
    resources: config.resources || { vcpus: 4 },
  }
}

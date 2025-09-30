# API Keys Setup Guide

## Overview

Browzy Code now includes a user-friendly settings modal for managing API keys. Keys are encrypted and stored securely in your Supabase database.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration (for storing encrypted keys)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Encryption Key (generate with: node -e "console.log(crypto.randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_64_character_hex_string
```

## Database Setup

Your `user_keys` table is already configured with:
- `user_id` (uuid) - References users table
- `provider` (text) - Key identifier (e.g., 'anthropic', 'github')
- `encrypted_key` (text) - Encrypted API key
- `iv` (text) - Initialization vector for encryption
- `created_at` / `updated_at` timestamps

## How It Works

### First-Time Setup
1. When a user first visits Browzy Code, the app checks if required API keys are configured
2. If not, an onboarding modal automatically appears
3. Users can enter their API keys which are encrypted before storage
4. After setup, the modal won't show again (tracked in localStorage)

### Settings Access
- Users can access settings anytime via the menu (three dots icon → "API Keys Settings")
- Keys are decrypted for display/editing
- Changes are re-encrypted on save

### Required Keys
- **Anthropic API Key** - For Claude agent
- **GitHub Token** - For repository access
- **Vercel Team ID** - For sandbox creation
- **Vercel Project ID** - For sandbox creation  
- **Vercel Token** - For sandbox API

### Optional Keys
- **AI Gateway API Key** - For AI-powered branch naming
- **Cursor API Key** - For Cursor agent
- **OpenAI API Key** - For Codex agent
- **NPM Token** - For private packages

## Authentication Integration

**Important**: The API route currently has a placeholder for authentication:

```typescript
// In app/api/user-keys/route.ts
async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  // TODO: Implement your authentication logic here
  const userId = request.cookies.get('user_id')?.value
  return userId || null
}
```

### You need to:
1. Replace this with your actual authentication logic
2. Return the authenticated user's UUID
3. Options include:
   - Supabase Auth
   - NextAuth.js
   - Custom JWT verification
   - Session cookies

## Security Notes

- All keys are encrypted using AES-256-CBC encryption
- Encryption key should be kept secret and backed up
- Keys are only decrypted server-side when needed
- Never log or expose decrypted keys in client-side code

## Testing

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3001`
3. If no keys are configured, the setup modal will appear
4. Add at least the required keys
5. Click "Save Keys" to store them encrypted
6. Access settings anytime via the menu

## Files Created/Modified

### New Files:
- `components/settings-modal.tsx` - Settings UI component
- `components/setup-check.tsx` - First-time setup checker
- `app/api/user-keys/route.ts` - API for encrypted key storage
- `SETUP_KEYS.md` - This guide

### Modified Files:
- `components/home-page-header.tsx` - Added settings menu item
- `components/home-page-content.tsx` - Wrapped with setup check

## Deployment Checklist

- [ ] Add Supabase environment variables to deployment platform
- [ ] Generate and add secure ENCRYPTION_KEY
- [ ] Implement proper authentication in `/api/user-keys/route.ts`
- [ ] Test key encryption/decryption
- [ ] Verify first-time setup flow
- [ ] Test settings access from menu

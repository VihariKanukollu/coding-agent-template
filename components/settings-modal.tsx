'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, CheckCircle, XCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  provider: string
  value: string
  isSet: boolean
}

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isFirstTime?: boolean
}

const REQUIRED_KEYS = [
  {
    provider: 'anthropic',
    label: 'Anthropic API Key',
    placeholder: 'sk-ant-api03-...',
    description: 'Required for Claude agent',
    helpUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    provider: 'github',
    label: 'GitHub Token',
    placeholder: 'ghp_...',
    description: 'Required for repository access',
    helpUrl: 'https://github.com/settings/tokens',
  },
]

const OPTIONAL_KEYS = [
  {
    provider: 'vercel_team_id',
    label: 'Vercel Team ID (Optional)',
    placeholder: 'team_...',
    description: 'Override platform default for sandbox creation',
    helpUrl: 'https://vercel.com/docs/accounts/create-a-team',
  },
  {
    provider: 'vercel_project_id',
    label: 'Vercel Project ID (Optional)',
    placeholder: 'prj_...',
    description: 'Override platform default for sandbox creation',
    helpUrl: 'https://vercel.com/docs/projects/overview',
  },
  {
    provider: 'vercel_token',
    label: 'Vercel Token (Optional)',
    placeholder: 'Your Vercel API token',
    description: 'Override platform default for sandbox creation',
    helpUrl: 'https://vercel.com/account/tokens',
  },
  {
    provider: 'ai_gateway',
    label: 'AI Gateway API Key',
    placeholder: 'Your AI Gateway key',
    description: 'For AI-powered branch naming',
    helpUrl: 'https://vercel.com/docs/ai-gateway',
  },
  {
    provider: 'cursor',
    label: 'Cursor API Key',
    placeholder: 'Your Cursor API key',
    description: 'For Cursor agent support',
    helpUrl: 'https://cursor.sh',
  },
  {
    provider: 'openai',
    label: 'OpenAI API Key',
    placeholder: 'sk-...',
    description: 'For Codex/OpenCode agent support',
    helpUrl: 'https://platform.openai.com/api-keys',
  },
  {
    provider: 'npm',
    label: 'NPM Token',
    placeholder: 'npm_...',
    description: 'For private npm packages',
    helpUrl: 'https://docs.npmjs.com/creating-and-viewing-access-tokens',
  },
]

export function SettingsModal({ open, onOpenChange, isFirstTime = false }: SettingsModalProps) {
  const [keys, setKeys] = useState<Record<string, ApiKey>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadKeys()
    }
  }, [open])

  const loadKeys = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user-keys')
      if (response.ok) {
        const data = await response.json()
        const loadedKeys: Record<string, ApiKey> = {}
        
        ;[...REQUIRED_KEYS, ...OPTIONAL_KEYS].forEach((keyConfig) => {
          loadedKeys[keyConfig.provider] = {
            provider: keyConfig.provider,
            value: data.keys[keyConfig.provider] || '',
            isSet: !!data.keys[keyConfig.provider],
          }
        })
        
        setKeys(loadedKeys)
      }
    } catch (error) {
      console.error('Error loading keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const keysToSave = Object.values(keys)
        .filter((key) => key.value)
        .map((key) => ({ provider: key.provider, value: key.value }))

      const response = await fetch('/api/user-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: keysToSave }),
      })

      if (response.ok) {
        toast.success('API keys saved successfully!')
        onOpenChange(false)
        // Reload the page to apply new keys
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save API keys')
      }
    } catch (error) {
      console.error('Error saving keys:', error)
      toast.error('Failed to save API keys')
    } finally {
      setSaving(false)
    }
  }

  const updateKey = (provider: string, value: string) => {
    setKeys((prev) => ({
      ...prev,
      [provider]: { provider, value, isSet: !!value },
    }))
  }

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  const renderKeyInput = (keyConfig: typeof REQUIRED_KEYS[0]) => {
    const key = keys[keyConfig.provider] || { value: '', isSet: false }
    const isVisible = showKeys[keyConfig.provider]

    return (
      <div key={keyConfig.provider} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={keyConfig.provider} className="text-sm font-medium">
            {keyConfig.label}
            {key.isSet && (
              <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-500" />
            )}
          </Label>
          <a
            href={keyConfig.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            Get key
          </a>
        </div>
        <p className="text-xs text-muted-foreground">{keyConfig.description}</p>
        <div className="relative">
          <Input
            id={keyConfig.provider}
            type={isVisible ? 'text' : 'password'}
            placeholder={keyConfig.placeholder}
            value={key.value}
            onChange={(e) => updateKey(keyConfig.provider, e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => toggleShowKey(keyConfig.provider)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    )
  }

  const allRequiredKeysSet = REQUIRED_KEYS.every(
    (keyConfig) => keys[keyConfig.provider]?.value || keys[keyConfig.provider]?.isSet
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isFirstTime ? 'Welcome to Browzy Code!' : 'API Keys Settings'}
          </DialogTitle>
          <DialogDescription>
            {isFirstTime
              ? 'Set up your API keys to start using AI coding agents. All keys are encrypted and stored securely.'
              : 'Manage your API keys. All keys are encrypted and stored securely.'}
          </DialogDescription>
        </DialogHeader>

        {isFirstTime && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure your Anthropic API Key and GitHub Token to start using Browzy Code. 
              Vercel sandbox credentials are optional - the platform defaults will be used if not provided.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="required" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="required">
              Required Keys
              {!allRequiredKeysSet && (
                <XCircle className="ml-2 h-4 w-4 text-orange-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="optional">Optional Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="required" className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading keys...</div>
            ) : (
              REQUIRED_KEYS.map(renderKeyInput)
            )}
          </TabsContent>

          <TabsContent value="optional" className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading keys...</div>
            ) : (
              OPTIONAL_KEYS.map(renderKeyInput)
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {allRequiredKeysSet ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                All required keys configured
              </span>
            ) : (
              <span className="text-orange-600 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Some required keys are missing
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {!isFirstTime && (
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || (!isFirstTime && !allRequiredKeysSet)}>
              {saving ? 'Saving...' : 'Save Keys'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

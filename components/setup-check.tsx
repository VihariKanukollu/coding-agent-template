'use client'

import { useEffect, useState } from 'react'
import { SettingsModal } from '@/components/settings-modal'

export function SetupCheck({ children }: { children: React.ReactNode }) {
  const [showSetup, setShowSetup] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkKeys()
  }, [])

  const checkKeys = async () => {
    try {
      // Check if we've already shown the setup (use localStorage to track)
      const hasSeenSetup = localStorage.getItem('browzy-setup-complete')
      
      if (hasSeenSetup) {
        setLoading(false)
        return
      }

      // Check if required keys are configured
      const response = await fetch('/api/user-keys')
      
      if (response.ok) {
        const data = await response.json()
        const { keys } = data

        const requiredKeys = [
          'anthropic',
          'github',
        ]

        const hasAllRequiredKeys = requiredKeys.every((key) => keys[key])

        if (!hasAllRequiredKeys) {
          setShowSetup(true)
        } else {
          // Mark setup as complete
          localStorage.setItem('browzy-setup-complete', 'true')
        }
      }
    } catch (error) {
      console.error('Error checking keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetupComplete = (open: boolean) => {
    if (!open) {
      // User closed the modal, mark as seen
      localStorage.setItem('browzy-setup-complete', 'true')
      setShowSetup(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <SettingsModal open={showSetup} onOpenChange={handleSetupComplete} isFirstTime={true} />
    </>
  )
}

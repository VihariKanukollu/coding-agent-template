'use client'

import { PageHeader } from '@/components/page-header'
import { RepoSelector } from '@/components/repo-selector'
import { useTasks } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, RefreshCw, Trash2, Settings } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SettingsModal } from '@/components/settings-modal'
import { useUser } from '@/lib/user-store/provider'
import { BrowzyIcon } from '@/components/icons/browzy'
import Link from 'next/link'

interface HomePageHeaderProps {
  selectedOwner: string
  selectedRepo: string
  onOwnerChange: (owner: string) => void
  onRepoChange: (repo: string) => void
}

export function HomePageHeader({ selectedOwner, selectedRepo, onOwnerChange, onRepoChange }: HomePageHeaderProps) {
  const { toggleSidebar, refreshTasks } = useTasks()
  const { user } = useUser()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [deleteCompleted, setDeleteCompleted] = useState(true)
  const [deleteFailed, setDeleteFailed] = useState(true)
  const [deleteStopped, setDeleteStopped] = useState(true)
  
  const isLoggedIn = !!user

  const handleRefreshRepos = async () => {
    setIsRefreshing(true)
    try {
      // Clear all GitHub-related caches
      sessionStorage.removeItem('github-owners')
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('github-repos-')) {
          sessionStorage.removeItem(key)
        }
      })

      // Reload the page to fetch fresh data
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing repositories:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteTasks = async () => {
    if (!deleteCompleted && !deleteFailed && !deleteStopped) {
      toast.error('Please select at least one task type to delete')
      return
    }

    setIsDeleting(true)
    try {
      const actions = []
      if (deleteCompleted) actions.push('completed')
      if (deleteFailed) actions.push('failed')
      if (deleteStopped) actions.push('stopped')

      const response = await fetch(`/api/tasks?action=${actions.join(',')}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        // Refresh the tasks list to update the sidebar
        await refreshTasks()
        setShowDeleteDialog(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete tasks')
      }
    } catch (error) {
      console.error('Error deleting tasks:', error)
      toast.error('Failed to delete tasks')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogin = async () => {
    try {
      const { signInWithGoogle } = await import('@/lib/auth')
      const data = await signInWithGoogle()
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to initiate login')
    }
  }

  const actions = isLoggedIn ? (
    <div className="flex items-center gap-2">
      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            API Keys Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRefreshRepos} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Repositories
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Tasks
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <button
      onClick={handleLogin}
      className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      Login
    </button>
  )

  const leftActions = (
    <div className="flex items-center gap-3">
      <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
        <BrowzyIcon className="size-6" />
        <span className="font-semibold text-sm hidden sm:inline">Browzy.ai</span>
      </Link>
      <span className="text-muted-foreground">/</span>
      <RepoSelector
        selectedOwner={selectedOwner}
        selectedRepo={selectedRepo}
        onOwnerChange={onOwnerChange}
        onRepoChange={onRepoChange}
        size="sm"
      />
    </div>
  )

  return (
    <>
      <PageHeader
        showMobileMenu={true}
        onToggleMobileMenu={toggleSidebar}
        actions={actions}
        leftActions={leftActions}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Select which types of tasks you want to delete. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-completed"
                  checked={deleteCompleted}
                  onCheckedChange={(checked) => setDeleteCompleted(checked === true)}
                />
                <label
                  htmlFor="delete-completed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Delete Completed Tasks
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-failed"
                  checked={deleteFailed}
                  onCheckedChange={(checked) => setDeleteFailed(checked === true)}
                />
                <label
                  htmlFor="delete-failed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Delete Failed Tasks
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-stopped"
                  checked={deleteStopped}
                  onCheckedChange={(checked) => setDeleteStopped(checked === true)}
                />
                <label
                  htmlFor="delete-stopped"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Delete Stopped Tasks
                </label>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTasks}
              disabled={isDeleting || (!deleteCompleted && !deleteFailed && !deleteStopped)}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Tasks'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
    </>
  )
}

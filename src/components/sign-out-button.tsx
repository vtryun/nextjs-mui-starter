'use client'

import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useSnackbar } from '@/hooks/useSnackbar'

export default function SignOutButton() {
  const router = useRouter()
  const { show } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    if (loading) return
    setLoading(true)

    try {
      const { error } = await signOut({
        fetchOptions: {
          onSuccess: () => {
            show('Signed out successfully', 'success')
            router.push('/sign-in')
            router.refresh()
          },
        },
      })

      if (error) {
        show(error.message ?? 'Sign out failed, please try again.', 'error')
      }
    } finally {
      // Reset on every path. Previously this only ran in the error branch, so
      // any success that did not fire `onSuccess` left the button disabled
      // forever — the user could no longer sign out at all.
      setLoading(false)
    }
  }

  return (
    <Button variant="outlined" loading={loading} onClick={handleSignOut}>
      Sign Out
    </Button>
  )
}

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
      setLoading(false)
    }
  }

  return (
    <Button variant="outlined" loading={loading} onClick={handleSignOut}>
      Sign Out
    </Button>
  )
}

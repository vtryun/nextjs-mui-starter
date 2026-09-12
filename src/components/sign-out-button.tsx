'use client'

import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { showSnackbar } from '@/store/snackbar-slice'

export default function SignOutButton() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    if (loading) return
    setLoading(true)

    const { error } = await signOut({
      fetchOptions: {
        onSuccess: () => {
          dispatch(
            showSnackbar({
              message: 'Signed out successfully',
              severity: 'success',
            }),
          )
          router.push('/sign-in')
          router.refresh()
        },
      },
    })

    if (error) {
      dispatch(
        showSnackbar({
          message: error.message ?? 'Sign out failed, please try again.',
          severity: 'error',
        }),
      )
      setLoading(false)
    }
  }

  return (
    <Button variant="outlined" loading={loading} onClick={handleSignOut}>
      Sign Out
    </Button>
  )
}

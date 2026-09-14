import { Suspense } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import ResetPasswordForm from './reset-password-form'

export const metadata = {
  title: 'Choose a new password',
}

export default function ResetPasswordPage() {
  return (
    // `useSearchParams` opts the tree into client rendering, so the form needs
    // an explicit boundary for the rest of the page to stay prerenderable.
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

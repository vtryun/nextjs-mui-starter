'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import AuthCard from '@/components/auth-card'
import Link from '@/components/link'
import { useSnackbar } from '@/hooks/useSnackbar'
import { requestPasswordReset } from '@/lib/auth-client'
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from '@/validations/auth'

export default function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const { show } = useSnackbar()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  })

  const onSubmit = async (data: RequestPasswordResetInput) => {
    const { error } = await requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      show(
        error.message ?? 'Could not send the reset email. Please try again.',
        'error',
      )
      return
    }

    setSubmittedEmail(data.email)
  }

  if (submittedEmail) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="We've sent you an email with a reset link"
      >
        <Stack spacing={2.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            If an account exists for <strong>{submittedEmail}</strong>, the link
            to choose a new password is on its way. It expires in one hour.
          </Typography>
          <Button
            component={Link}
            href="/sign-in"
            variant="contained"
            size="large"
            fullWidth
          >
            Back to sign in
          </Button>
        </Stack>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            required
            label="Email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>

          <Typography
            component={Link}
            href="/sign-in"
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'text.primary',
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Back to sign in
          </Typography>
        </Stack>
      </form>
    </AuthCard>
  )
}

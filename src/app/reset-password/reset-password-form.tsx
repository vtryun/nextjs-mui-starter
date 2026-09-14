'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

import AuthCard from '@/components/auth-card'
import Link from '@/components/link'
import { useSnackbar } from '@/hooks/useSnackbar'
import { resetPassword } from '@/lib/auth-client'
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/validations/auth'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { show } = useSnackbar()

  const token = searchParams.get('token')
  // better-auth appends ?error=INVALID_TOKEN when the link is expired or has
  // already been used.
  const linkIsInvalid = !token || searchParams.get('error') === 'INVALID_TOKEN'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return

    const { error } = await resetPassword({
      newPassword: data.password,
      token,
    })

    if (error) {
      show(error.message ?? 'Could not reset your password.', 'error')
      return
    }

    show('Password updated. You can sign in now.', 'success')
    router.push('/sign-in')
  }

  if (linkIsInvalid) {
    return (
      <AuthCard
        title="Link expired"
        subtitle="This password reset link is no longer valid"
      >
        <Stack spacing={2.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Reset links are single use and expire after one hour. Request a new
            one to continue.
          </Typography>
          <Button
            component={Link}
            href="/forgot-password"
            variant="contained"
            size="large"
            fullWidth
          >
            Request a new link
          </Button>
        </Stack>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Your new password must be at least 8 characters"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            required
            label="New password"
            type="password"
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
          />

          <TextField
            fullWidth
            required
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating password...' : 'Update password'}
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

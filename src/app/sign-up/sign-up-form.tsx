'use client'

import { Visibility, VisibilityOff } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import Link from '@/components/link'
import SocialProviderButtons from '@/components/social-provider-buttons'
import { useSnackbar } from '@/hooks/useSnackbar'
import { signUp } from '@/lib/auth-client'
import type { SocialProviderId } from '@/lib/social-providers'
import { registerSchema, type RegisterInput } from '@/validations/auth'

export default function SignUpForm({
  enabledProviders,
}: {
  enabledProviders: SocialProviderId[]
}) {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { show } = useSnackbar()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (data: RegisterInput) => {
    const { error } = await signUp.email({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
    })

    if (error) {
      show(error.message || 'Sign up failed. Please try again.', 'error')
      return
    }

    show('Account created successfully.', 'success')

    router.push('/dashboard')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, md: 4 },
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ maxWidth: 400, width: '100%' }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 600, mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Enter your details to create your account
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                required
                label="Name"
                placeholder="John Doe"
                autoComplete="name"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />

              <TextField
                fullWidth
                required
                label="Username"
                placeholder="john.doe"
                autoComplete="username"
                error={!!errors.username}
                helperText={
                  errors.username?.message ??
                  'Letters, numbers, underscores, and dots'
                }
                {...register('username')}
              />

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

              <TextField
                fullWidth
                required
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                required
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
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
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>

              <SocialProviderButtons providers={enabledProviders} />

              <Stack
                direction="row"
                spacing={0.5}
                sx={{ justifyContent: 'center', mt: 2 }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Already have an account?
                </Typography>
                <Typography
                  component={Link}
                  href="/sign-in"
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Sign In
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'

import { useSnackbar } from '@/hooks/useSnackbar'
import { updateUser } from '@/lib/auth-client'
import { profileSchema, type ProfileInput } from '@/validations/auth'

type ProfileFormProps = {
  user: {
    name: string
    email: string
    username: string
    image: string
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const { show } = useSnackbar()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      image: user.image,
    },
    mode: 'onBlur',
  })

  // `useWatch` rather than `watch()`: watch returns a function, which React
  // Compiler cannot memoize safely and therefore skips the whole component.
  // The explicit defaultValue keeps the first paint from flashing empty.
  const imageValue = useWatch({
    control,
    name: 'image',
    defaultValue: user.image,
  })
  const nameValue = useWatch({
    control,
    name: 'name',
    defaultValue: user.name,
  })

  const onSubmit = async (data: ProfileInput) => {
    const username = data.username.trim()
    const image = data.image.trim()

    const { error } = await updateUser({
      name: data.name,
      // Omitting the field leaves the stored username untouched; existing
      // accounts predate the username plugin and may still not have one.
      ...(username ? { username } : {}),
      image: image === '' ? null : image,
    })

    if (error) {
      show(error.message ?? 'Could not save your profile.', 'error')
      return
    }

    show('Profile updated.', 'success')
    // Re-read the session on the server so the dashboard and this page show the
    // new values without a full reload.
    router.refresh()
  }

  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 520 }}>
      <Stack spacing={1}>
        <Typography variant="h4">Profile</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Update how you appear across the app.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar
          src={imageValue || undefined}
          sx={{ width: 56, height: 56 }}
          alt={nameValue || 'Avatar'}
        >
          {nameValue.trim().charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Avatar preview
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            required
            label="Name"
            autoComplete="name"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />

          <TextField
            fullWidth
            label="Username"
            autoComplete="username"
            error={!!errors.username}
            helperText={
              errors.username?.message ??
              'Used to sign in. Letters, numbers, underscores, and dots.'
            }
            {...register('username')}
          />

          <TextField
            fullWidth
            disabled
            label="Email"
            value={user.email}
            helperText="Changing your email requires verification and is not supported yet."
          />

          <TextField
            fullWidth
            label="Avatar URL"
            placeholder="https://example.com/avatar.png"
            error={!!errors.image}
            helperText={errors.image?.message ?? 'Leave empty to remove it.'}
            {...register('image')}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}

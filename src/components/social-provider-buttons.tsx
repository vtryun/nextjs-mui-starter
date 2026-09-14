'use client'

import { useState } from 'react'
import Facebook from '@mui/icons-material/Facebook'
import Google from '@mui/icons-material/Google'
import type { SvgIconComponent } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

import { signIn } from '@/lib/auth-client'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { SocialProviderId } from '@/lib/social-providers'

const PROVIDER_META: Record<
  SocialProviderId,
  { label: string; Icon: SvgIconComponent }
> = {
  google: { label: 'Google', Icon: Google },
  facebook: { label: 'Facebook', Icon: Facebook },
}

type SocialProviderButtonsProps = {
  providers: readonly SocialProviderId[]
  callbackURL?: string
}

/**
 * Renders nothing when no OAuth credentials are configured. The previous
 * version always drew the buttons while `socialProviders` was empty, so
 * clicking them did nothing at all.
 */
export default function SocialProviderButtons({
  providers,
  callbackURL = '/dashboard',
}: SocialProviderButtonsProps) {
  const { show } = useSnackbar()
  const [pending, setPending] = useState<SocialProviderId | null>(null)

  if (providers.length === 0) return null

  const handleSignIn = async (provider: SocialProviderId) => {
    setPending(provider)

    const { error } = await signIn.social({ provider, callbackURL })

    if (error) {
      show(
        error.message ??
          `Could not continue with ${PROVIDER_META[provider].label}`,
        'error',
      )
      setPending(null)
    }
  }

  return (
    <>
      <Divider sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        or
      </Divider>
      <Stack spacing={1.5}>
        {providers.map((provider) => {
          const { label, Icon } = PROVIDER_META[provider]
          return (
            <Button
              key={provider}
              fullWidth
              variant="outlined"
              startIcon={<Icon />}
              loading={pending === provider}
              disabled={pending !== null && pending !== provider}
              onClick={() => handleSignIn(provider)}
            >
              {label}
            </Button>
          )
        })}
      </Stack>
    </>
  )
}

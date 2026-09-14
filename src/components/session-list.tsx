'use client'

import { listSessions, revokeSession } from '@/lib/auth-client'
import { useSnackbar } from '@/hooks/useSnackbar'
import { formatIp, parseUserAgent } from '@/lib/user-agent'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const SESSIONS_KEY = ['auth', 'sessions'] as const

export default function SessionList() {
  const queryClient = useQueryClient()
  const { show } = useSnackbar()

  const {
    data: sessions,
    isPending,
    error,
  } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: async () => {
      const { data, error } = await listSessions()
      if (error) throw new Error(error.message ?? 'Failed to load sessions')

      // Mapped field by field rather than asserted, so a change in the
      // library's response shape surfaces as a type error instead of a
      // silently wrong `as` cast.
      return (data ?? []).map((session) => ({
        id: session.id,
        token: session.token,
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        // Normalised here so the render path has a Date and never has to guess
        // whether the library handed back a Date, an ISO string, or a number.
        createdAt: new Date(session.createdAt),
      }))
    },
  })

  const revokeMutation = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await revokeSession({ token })
      if (error) throw new Error(error.message ?? 'Failed to revoke session')
    },
    onSuccess: () => {
      show('Session revoked', 'success')
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
    onError: (err) => {
      show(
        err instanceof Error ? err.message : 'Failed to revoke session',
        'error',
      )
    },
  })

  if (isPending) return <CircularProgress size={20} />
  if (error) {
    return (
      <Typography color="error">
        {error instanceof Error ? error.message : 'Failed to load sessions'}
      </Typography>
    )
  }

  if (!sessions?.length) {
    return <Typography color="text.secondary">No active sessions.</Typography>
  }

  return (
    <Stack spacing={1.5}>
      {sessions.map((session) => (
        <Card key={session.id} variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  {parseUserAgent(session.userAgent)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatIp(session.ipAddress)} ·{' '}
                  {session.createdAt.toLocaleString()}
                </Typography>
              </Stack>
              <Button
                size="small"
                color="error"
                variant="outlined"
                disabled={revokeMutation.isPending}
                onClick={() => revokeMutation.mutate(session.token)}
              >
                Revoke
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

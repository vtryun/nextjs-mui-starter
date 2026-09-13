'use client'

import { authClient } from '@/lib/auth-client'
import { useSnackbar } from '@/hooks/useSnackbar'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

type SessionItem = {
  id: string
  token: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  expiresAt: Date
}

const SESSIONS_KEY = ['auth', 'sessions'] as const

function formatIp(ip: string | null) {
  if (!ip) return 'Unknown IP'
  if (
    ip === '::1' ||
    ip === '0000:0000:0000:0000:0000:0000:0000:0000' ||
    ip === '::ffff:127.0.0.1'
  ) {
    return 'Localhost'
  }
  return ip
}

function parseUserAgent(ua: string | null) {
  if (!ua) return 'Unknown device'
  const browser = ua.includes('Edg/')
    ? 'Edge'
    : ua.includes('Chrome/')
      ? 'Chrome'
      : ua.includes('Firefox/')
        ? 'Firefox'
        : ua.includes('Safari/')
          ? 'Safari'
          : 'Unknown browser'
  const os = ua.includes('Windows')
    ? 'Windows'
    : ua.includes('Mac OS')
      ? 'macOS'
      : ua.includes('Linux')
        ? 'Linux'
        : ua.includes('Android')
          ? 'Android'
          : ua.includes('iPhone') || ua.includes('iPad')
            ? 'iOS'
            : 'Unknown OS'
  return `${browser} on ${os}`
}

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
      const { data, error } = await authClient.listSessions()
      if (error) throw new Error(error.message ?? 'Failed to load sessions')
      return data as SessionItem[]
    },
  })

  const revokeMutation = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({ token })
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
                  {new Date(session.createdAt).toLocaleString()}
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

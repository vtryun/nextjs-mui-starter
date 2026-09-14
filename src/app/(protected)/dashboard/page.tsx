import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Link from '@/components/link'
import SessionList from '@/components/session-list'
import SignOutButton from '@/components/sign-out-button'
import { requireSession } from '@/lib/session'

export default async function DashboardPage() {
  const session = await requireSession()

  return (
    <Stack spacing={3} sx={{ p: 4 }}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography>Welcome, {session.user.name}</Typography>
        <Typography color="text.secondary">
          Email: {session.user.email}
        </Typography>
        {session.user.username ? (
          <Typography color="text.secondary">
            Username: {session.user.username}
          </Typography>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Button component={Link} href="/profile" variant="outlined">
          Edit profile
        </Button>
        <SignOutButton />
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="h6">Active sessions</Typography>
        <SessionList />
      </Stack>
    </Stack>
  )
}

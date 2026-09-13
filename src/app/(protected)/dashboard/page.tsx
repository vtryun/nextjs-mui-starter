import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/sign-out-button'
import SessionList from '@/components/session-list'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <Stack spacing={3} sx={{ p: 4 }}>
      <div>
        <Typography variant="h4">Dashboard</Typography>
        <Typography>Welcome, {session.user.name}</Typography>
        <Typography>Email: {session.user.email}</Typography>
      </div>

      <div>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Active Sessions
        </Typography>
        <SessionList />
      </div>

      <SignOutButton />
    </Stack>
  )
}

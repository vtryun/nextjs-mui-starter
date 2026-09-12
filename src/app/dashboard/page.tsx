import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/sign-out-button'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <SignOutButton />
    </div>
  )
}

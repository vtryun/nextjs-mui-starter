import { requireSession } from '@/lib/session'
import ProfileForm from './profile-form'

export const metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const session = await requireSession()

  return (
    <ProfileForm
      user={{
        name: session.user.name,
        email: session.user.email,
        // `username` is nullable in the database: accounts created before the
        // username plugin was enabled have none. The form needs a string, so
        // the empty case collapses to '' here.
        username: session.user.username ?? '',
        // `image` keeps its null: '' and null both mean "no avatar", but only
        // null is what the database stores, and the form converts '' back to
        // null on submit.
        image: session.user.image ?? '',
      }}
    />
  )
}

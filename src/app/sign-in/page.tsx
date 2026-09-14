import { getEnabledSocialProviders } from '@/lib/social-providers'
import SignInForm from './sign-in-form'

export const metadata = {
  title: 'Sign in',
}

export default function SignInPage() {
  // The OAuth button list is derived from server-side env vars, so the client
  // form receives it as a prop rather than reading process.env itself.
  return <SignInForm enabledProviders={getEnabledSocialProviders()} />
}

import { getEnabledSocialProviders } from '@/lib/social-providers'
import SignUpForm from './sign-up-form'

export const metadata = {
  title: 'Create account',
}

export default function SignUpPage() {
  return <SignUpForm enabledProviders={getEnabledSocialProviders()} />
}

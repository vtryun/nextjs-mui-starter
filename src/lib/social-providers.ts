export type SocialProviderId = 'google' | 'facebook'

export type SocialProviderOption = {
  id: SocialProviderId
  label: string
  clientId: string
  clientSecret: string
}

type ProviderDefinition = {
  id: SocialProviderId
  label: string
  clientIdEnv: string
  clientSecretEnv: string
}

const PROVIDER_DEFINITIONS: readonly ProviderDefinition[] = [
  {
    id: 'google',
    label: 'Google',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    clientIdEnv: 'FACEBOOK_CLIENT_ID',
    clientSecretEnv: 'FACEBOOK_CLIENT_SECRET',
  },
]

function readProvider(
  definition: ProviderDefinition,
): SocialProviderOption | null {
  const clientId = process.env[definition.clientIdEnv]
  const clientSecret = process.env[definition.clientSecretEnv]

  if (!clientId || !clientSecret) return null

  return {
    id: definition.id,
    label: definition.label,
    clientId,
    clientSecret,
  }
}

const configuredProviders = PROVIDER_DEFINITIONS.map(readProvider).filter(
  (provider): provider is SocialProviderOption => provider !== null,
)

/**
 * Passed straight to `betterAuth({ socialProviders })`. Empty when no
 * credentials are present, which is the current state — the sign-in and sign-up
 * pages read the same list to decide whether to render the OAuth buttons at all,
 * instead of shipping buttons that do nothing when clicked.
 */
export const socialProviders = Object.fromEntries(
  configuredProviders.map(({ id, clientId, clientSecret }) => [
    id,
    { clientId, clientSecret },
  ]),
) satisfies Partial<
  Record<SocialProviderId, { clientId: string; clientSecret: string }>
>

/**
 * Serializable subset safe to hand to client components.
 *
 * Derived from `socialProviders` rather than from `configuredProviders` so the
 * server config and the UI cannot drift apart — deriving both independently
 * from the same source is not the same thing as having one source of truth.
 */
export function getEnabledSocialProviders(): SocialProviderId[] {
  return Object.keys(socialProviders) as SocialProviderId[]
}
